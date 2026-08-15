export type Branch = 'PER' | 'ADL' | 'QLD' | 'VIC' | 'CBR' | 'NSW' | 'NTL'
export type Dept = 'RP' | 'CC' | 'WH' | 'DM'
export type ItemStatus = 'in_progress' | 'completed'
export type UserRole = 'admin' | 'staff'
export type ActionType =
  | 'created'
  | 'assigned'
  | 'note_added'
  | 'transferred'
  | 'status_changed'
  | 'completed'
  | 'imported'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  branch: Branch | 'ALL' | null
  dept: Dept | 'ADMIN' | null
  depts: string[] | null
  created_at: string
}

export interface StatusCode {
  code: string
  description: string
  dept_first: Dept | null
  dept_notes: string | null
}

export interface StockItem {
  id: string
  branch: Branch
  status: ItemStatus
  dept_assigned: Dept | null

  // Delivery details — mirrors actual sheet columns G–N
  date_listed: string | null       // col G: Date Listed
  client: string | null            // col H: Client
  serial: string | null            // col I: Serial / order number
  tracking: string | null          // col J: Tracking code
  customer_name: string | null     // col K: Customer Name
  status_code: string | null       // col L: Status code (AD, BA, GNR…)
  action_required: string | null   // col M: ACTION REQUIRED
  delivery_depot: string | null    // col N: Delivery Depot

  // Department-specific comment columns (P, S, V, Y)
  notes_rp: string | null          // Route Planner comments
  notes_cc: string | null          // Customer Care comments
  notes_wh: string | null          // Warehouse comments
  notes_dm: string | null          // Driver Management comments

  // Meta
  imported_row_id: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
  created_by: string | null
  updated_by: string | null
  completed_by: string | null

  // Joined
  status_code_details?: StatusCode
  created_by_profile?: Pick<Profile, 'full_name' | 'email'>
  updated_by_profile?: Pick<Profile, 'full_name' | 'email'>
}

export interface ActionLog {
  id: string
  item_id: string
  user_id: string | null
  user_name: string | null
  action_type: ActionType
  from_dept: Dept | null
  to_dept: Dept | null
  note: string | null
  old_status: string | null
  new_status: string | null
  created_at: string
}

export interface BranchStats {
  branch: Branch
  label: string
  rp: number
  cc: number
  wh: number
  dm: number
  unassigned: number
  in_progress: number
  completed: number
  total: number
}

export interface DashboardData {
  total_in_progress: number
  total_completed: number
  total_items: number
  branches: BranchStats[]
}

export interface ImportRow {
  branch: Branch
  status: ItemStatus
  dept_assigned: Dept | null
  date_listed: string | null
  client: string | null
  serial: string | null
  tracking: string | null
  customer_name: string | null
  status_code: string | null
  action_required: string | null
  delivery_depot: string | null
  notes_rp: string | null
  notes_cc: string | null
  notes_wh: string | null
  notes_dm: string | null
  imported_row_id: string | null
}
