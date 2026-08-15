-- ============================================================
-- National BC Stocktake — Supabase Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- ── Profiles ────────────────────────────────────────────────
create table if not exists public.profiles (
  id         uuid references auth.users on delete cascade primary key,
  email      text not null,
  full_name  text,
  role       text not null default 'staff' check (role in ('admin', 'staff')),
  branch     text check (branch in ('PER', 'ADL', 'QLD', 'VIC', 'CBR', 'NSW', 'NTL', 'ALL')),
  dept       text check (dept in ('RP', 'CC', 'WH', 'DM', 'ADMIN')),
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view all profiles"
  on public.profiles for select using (auth.role() = 'authenticated');

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Admins can update any profile"
  on public.profiles for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ── Status codes ─────────────────────────────────────────────
create table if not exists public.status_codes (
  code        text primary key,
  description text not null,
  dept_first  text check (dept_first in ('RP', 'CC', 'WH', 'DM')),
  dept_notes  text
);

alter table public.status_codes enable row level security;
create policy "Anyone authenticated can read status codes"
  on public.status_codes for select using (auth.role() = 'authenticated');

-- ── Stock items ───────────────────────────────────────────────
create table if not exists public.stock_items (
  id              uuid default gen_random_uuid() primary key,
  branch          text not null check (branch in ('PER', 'ADL', 'QLD', 'VIC', 'CBR', 'NSW', 'NTL')),
  status          text not null default 'in_progress' check (status in ('in_progress', 'completed')),
  dept_assigned   text check (dept_assigned in ('RP', 'CC', 'WH', 'DM')),

  -- Delivery details (mirrors sheet cols G–N)
  date_listed     date,
  client          text,
  serial          text,
  tracking        text,
  customer_name   text,
  status_code     text references public.status_codes(code),
  action_required text,
  delivery_depot  text,

  -- Dept comment columns (mirrors sheet cols P, S, V, Y)
  notes_rp text,
  notes_cc text,
  notes_wh text,
  notes_dm text,

  -- Metadata
  imported_row_id text,
  completed_at    timestamptz,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  created_by      uuid references auth.users,
  updated_by      uuid references auth.users,
  completed_by    uuid references auth.users
);

alter table public.stock_items enable row level security;

create policy "Authenticated users can view all items"
  on public.stock_items for select using (auth.role() = 'authenticated');

create policy "Authenticated users can insert items"
  on public.stock_items for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can update items"
  on public.stock_items for update using (auth.role() = 'authenticated');

-- Useful indexes
create index if not exists idx_stock_items_branch  on public.stock_items (branch);
create index if not exists idx_stock_items_status  on public.stock_items (status);
create index if not exists idx_stock_items_dept    on public.stock_items (dept_assigned);
create index if not exists idx_stock_items_client  on public.stock_items (client);
create index if not exists idx_stock_items_created on public.stock_items (created_at desc);

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger stock_items_updated_at
  before update on public.stock_items
  for each row execute function public.handle_updated_at();

-- ── Action logs ───────────────────────────────────────────────
create table if not exists public.action_logs (
  id          uuid default gen_random_uuid() primary key,
  item_id     uuid references public.stock_items on delete cascade,
  user_id     uuid references auth.users,
  user_name   text,
  action_type text not null,
  from_dept   text check (from_dept in ('RP', 'CC', 'WH', 'DM')),
  to_dept     text check (to_dept in ('RP', 'CC', 'WH', 'DM')),
  note        text,
  old_status  text,
  new_status  text,
  created_at  timestamptz default now()
);

alter table public.action_logs enable row level security;
create policy "Authenticated users can read logs"
  on public.action_logs for select using (auth.role() = 'authenticated');
create policy "Authenticated users can insert logs"
  on public.action_logs for insert with check (auth.role() = 'authenticated');

create index if not exists idx_action_logs_item on public.action_logs (item_id, created_at desc);

-- ── Seed: status codes ────────────────────────────────────────
insert into public.status_codes (code, description, dept_first, dept_notes) values
  ('AD',    'Arrived after Dispatch',                        'RP', null),
  ('BA',    'Bad Address',                                   'RP', 'Check bad address sheets — pass to CC if required'),
  ('BC',    'Business Closed',                               'RP', null),
  ('CNX',   'Canceled',                                      'CC', null),
  ('ORC',   'Cancelled by Client en route',                  'CC', null),
  ('CC',    'Client to collect',                             'WH', null),
  ('DG',    'Damaged Goods',                                 'CC', null),
  ('DT',    'Damaged in Transit',                            'CC', null),
  ('DTR',   'Damaged in Transit - Can be Repacked',          'CC', 'Check with client first'),
  ('DTU',   'Damaged in Transit - Unable to be Repacked',    'CC', null),
  ('D',     'Duplicate',                                     'CC', null),
  ('GNRL',  'GNR: Located after Dispatch',                   'RP', null),
  ('GNRW',  'GNR: Located in incorrect warehouse',           'RP', null),
  ('GNRR',  'GNR: Received after Dispatch',                  'RP', null),
  ('GNRRD', 'GNR: Returned After Dispatch',                  'RP', null),
  ('GNRRW', 'GNR: Returned to Warehouse',                    'RP', null),
  ('G',     'Goods Not Received',                            'RP', null),
  ('GNR',   'Goods Not Received',                            'RP', null),
  ('I',     'Inaccessible drop zone',                        'RP', 'Check if previous delivery — check pin'),
  ('LMC',   'Last Minute Cancellation',                      'CC', null),
  ('LD',    'Located after Dispatch',                        'RP', null),
  ('MD',    'Manually dispatched',                           'CC', null),
  ('ND',    'Not Delivered',                                 'RP', null),
  ('NDD',   'Not Delivered 2',                               'RP', null),
  ('NIP',   'Not in Portal',                                 'CC', 'Request new manifest for redelivery'),
  ('H',     'On Hold',                                       'RP', 'Check then pass to CC if required'),
  ('OR',    'On Hold (Returned to warehouse)',               'RP', 'Check then pass to CC'),
  ('O',     'Other',                                         'RP', 'Check then pass to CC if required'),
  ('RE',    'Pending (Returned to Warehouse)',               'RP', null),
  ('PE',    'Pending Delivery for Future Date',              'WH', null),
  ('P',     'Processed',                                     'CC', 'Request new manifest for redelivery'),
  ('PB',    'Processed: Box on Hand',                        'CC', null),
  ('PR',    'Processed: Returned to Warehouse',              'CC', null),
  ('RMB',   'Received Missing Box',                          'RP', null),
  ('R',     'Rejected by Receiver',                          'RP', 'Check then pass to CC if required'),
  ('RREC',  'Rejected by reception',                         'RP', 'Check then pass to CC if required'),
  ('RSC',   'Rescheduled',                                   'WH', null),
  ('B',     'Road block / closure',                          'RP', null),
  ('S',     'Secure Gate / Complex',                         'RP', null),
  ('SH',    'Still on Hand',                                 'RP', 'Check then pass to CC if required'),
  ('TNF',   'Tag not Found',                                 'CC', null),
  ('TR',    'Temperature Rejection',                         'CC', null),
  ('A',     'Unable to locate address',                      'RP', 'Check if previous delivery — check pin'),
  ('U',     'Unit information Missing',                      'RP', null),
  ('UB',    'Unlabeled Box',                                 'CC', null),
  ('UR',    'Unrouted',                                      'RP', 'Check why — pass to CC if required'),
  ('US',    'Unsafe drop zone',                              'RP', 'Check if previous delivery — check pin'),
  ('UZ',    'Unzoned',                                       'CC', null),
  ('WR',    'Wrong Region',                                  'CC', null)
on conflict (code) do nothing;

-- ── Table-level grants ───────────────────────────────────────
-- Required when schema is applied via SQL editor (not Supabase dashboard UI).
-- RLS policies alone are not enough; the role also needs table-level privileges.
grant select, insert, update, delete on table public.stock_items  to authenticated;
grant select, insert                  on table public.action_logs  to authenticated;
grant select                          on table public.status_codes to authenticated;
grant select, update                  on table public.profiles     to authenticated;

-- ── Helper: dashboard stats view ─────────────────────────────
create or replace view public.dashboard_stats as
select
  branch,
  count(*) filter (where status = 'in_progress' and dept_assigned = 'RP') as rp,
  count(*) filter (where status = 'in_progress' and dept_assigned = 'CC') as cc,
  count(*) filter (where status = 'in_progress' and dept_assigned = 'WH') as wh,
  count(*) filter (where status = 'in_progress' and dept_assigned = 'DM') as dm,
  count(*) filter (where status = 'in_progress' and dept_assigned is null) as unassigned,
  count(*) filter (where status = 'in_progress') as in_progress,
  count(*) filter (where status = 'completed')   as completed,
  count(*) as total
from public.stock_items
group by branch;
