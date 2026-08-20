import type { Branch, Dept } from '@/types'

export const BRANCHES: { value: Branch; label: string }[] = [
  { value: 'NSW', label: 'NSW' },
  { value: 'QLD', label: 'QLD' },
  { value: 'VIC', label: 'VIC' },
  { value: 'ADL', label: 'SA' },
  { value: 'PER', label: 'WA' },
  { value: 'CBR', label: 'CBR' },
  { value: 'NTL', label: 'NTL' },
]

export const BRANCH_MAP: Record<Branch, string> = {
  NSW: 'NSW',
  QLD: 'QLD',
  VIC: 'VIC',
  ADL: 'SA',
  PER: 'WA',
  CBR: 'CBR',
  NTL: 'NTL',
}

export const DEPTS: { value: Dept; label: string; color: string }[] = [
  { value: 'RP', label: 'Operations (RP)', color: 'bg-blue-100 text-blue-800' },
  { value: 'CC', label: 'Customer Care (CC)', color: 'bg-purple-100 text-purple-800' },
  { value: 'WH', label: 'Warehouse (WH)', color: 'bg-amber-100 text-amber-800' },
  { value: 'DM', label: 'Driver Mgmt (DM)', color: 'bg-green-100 text-green-800' },
]

export const DEPT_MAP: Record<Dept, { label: string; color: string; email: string }> = {
  RP: { label: 'Operations', color: 'bg-blue-100 text-blue-800', email: 'operations@becoolcouriers.com.au' },
  CC: { label: 'Customer Care', color: 'bg-purple-100 text-purple-800', email: 'customercare@becoolcouriers.com.au' },
  WH: { label: 'Warehouse', color: 'bg-amber-100 text-amber-800', email: 'warehouse@becoolcouriers.com.au' },
  DM: { label: 'Driver Mgmt', color: 'bg-green-100 text-green-800', email: 'drivers@becoolcouriers.com.au' },
}

export const STATUS_COLORS: Record<string, string> = {
  in_progress: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
}

// Status codes from the Lists tab
export const STATUS_CODES = [
  { code: 'AD', description: 'Arrived after Dispatch', dept_first: 'RP' },
  { code: 'BA', description: 'Bad Address', dept_first: 'RP' },
  { code: 'BC', description: 'Business Closed', dept_first: 'RP' },
  { code: 'CNX', description: 'Canceled', dept_first: 'CC' },
  { code: 'ORC', description: 'Cancelled by Client en route', dept_first: 'CC' },
  { code: 'CC', description: 'Client to collect', dept_first: 'WH' },
  { code: 'DG', description: 'Damaged Goods', dept_first: 'CC' },
  { code: 'DT', description: 'Damaged in Transit', dept_first: 'CC' },
  { code: 'DTR', description: 'Damaged in Transit - Can be Repacked', dept_first: 'CC' },
  { code: 'DTU', description: 'Damaged in Transit - Unable to be Repacked', dept_first: 'CC' },
  { code: 'D', description: 'Duplicate', dept_first: 'CC' },
  { code: 'GNRL', description: 'GNR: Located after Dispatch', dept_first: 'RP' },
  { code: 'GNRW', description: 'GNR: Located in incorrect warehouse', dept_first: 'RP' },
  { code: 'GNRR', description: 'GNR: Received after Dispatch', dept_first: 'RP' },
  { code: 'GNRRD', description: 'GNR: Returned After Dispatch', dept_first: 'RP' },
  { code: 'GNRRW', description: 'GNR: Returned to Warehouse', dept_first: 'RP' },
  { code: 'G', description: 'Goods Not Received', dept_first: 'RP' },
  { code: 'GNR', description: 'Goods Not Received', dept_first: 'RP' },
  { code: 'I', description: 'Inaccessible drop zone', dept_first: 'RP' },
  { code: 'LMC', description: 'Last Minute Cancellation', dept_first: 'CC' },
  { code: 'LD', description: 'Located after Dispatch', dept_first: 'RP' },
  { code: 'MD', description: 'Manually dispatched', dept_first: 'CC' },
  { code: 'ND', description: 'Not Delivered', dept_first: 'RP' },
  { code: 'NDD', description: 'Not Delivered 2', dept_first: 'RP' },
  { code: 'NIP', description: 'Not in Portal', dept_first: 'CC' },
  { code: 'H', description: 'On Hold', dept_first: 'RP' },
  { code: 'OR', description: 'On Hold (Returned to warehouse)', dept_first: 'RP' },
  { code: 'O', description: 'Other', dept_first: 'RP' },
  { code: 'RE', description: 'Pending (Returned to Warehouse)', dept_first: 'RP' },
  { code: 'PE', description: 'Pending Delivery for Future Date', dept_first: 'WH' },
  { code: 'P', description: 'Processed', dept_first: 'CC' },
  { code: 'PB', description: 'Processed: Box on Hand', dept_first: 'CC' },
  { code: 'PR', description: 'Processed: Returned to Warehouse', dept_first: 'CC' },
  { code: 'RMB', description: 'Received Missing Box', dept_first: 'RP' },
  { code: 'R', description: 'Rejected by Receiver', dept_first: 'RP' },
  { code: 'RREC', description: 'Rejected by reception', dept_first: 'RP' },
  { code: 'RSC', description: 'Rescheduled', dept_first: 'WH' },
  { code: 'B', description: 'Road block / closure', dept_first: 'RP' },
  { code: 'S', description: 'Secure Gate / Complex', dept_first: 'RP' },
  { code: 'SH', description: 'Still on Hand', dept_first: 'RP' },
  { code: 'TNF', description: 'Tag not Found', dept_first: 'CC' },
  { code: 'TR', description: 'Temperature Rejection', dept_first: 'CC' },
  { code: 'A', description: 'Unable to locate address', dept_first: 'RP' },
  { code: 'U', description: 'Unit information Missing', dept_first: 'RP' },
  { code: 'UB', description: 'Unlabeled Box', dept_first: 'CC' },
  { code: 'UR', description: 'Unrouted', dept_first: 'RP' },
  { code: 'US', description: 'Unsafe drop zone', dept_first: 'RP' },
  { code: 'UZ', description: 'Unzoned', dept_first: 'CC' },
  { code: 'WR', description: 'Wrong Region', dept_first: 'CC' },
] as const
