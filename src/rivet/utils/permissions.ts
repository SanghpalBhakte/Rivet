import { UserRole } from '../context/AuthContext';

export type PermissionAction =
  | 'lead:create'
  | 'lead:update_stage'
  | 'lead:update_details'
  | 'job:create'
  | 'job:update_status'
  | 'task:create'
  | 'task:update_status'
  | 'payment:record'
  | 'note:create'
  | 'note:edit'
  | 'workspace:invite';

const ROLE_PERMISSIONS: Record<UserRole, PermissionAction[]> = {
  admin: [
    'lead:create',
    'lead:update_stage',
    'lead:update_details',
    'job:create',
    'job:update_status',
    'task:create',
    'task:update_status',
    'payment:record',
    'note:create',
    'note:edit',
    'workspace:invite',
  ],
  operations: [
    'lead:create',
    'lead:update_stage',
    'lead:update_details',
    'job:create',
    'job:update_status',
    'task:create',
    'task:update_status',
    'note:create',
    'note:edit',
  ],
  accounts: [
    'payment:record',
    'note:create',
    'task:create',
    'task:update_status',
  ],
  viewer: [],
};

export const hasPermission = (role: UserRole | undefined | null, action: PermissionAction): boolean => {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(action) ?? false;
};

export const getRoleBadgeLabel = (role: UserRole): string => {
  switch (role) {
    case 'admin':
      return 'Admin (Full Access)';
    case 'operations':
      return 'Ops Desk';
    case 'accounts':
      return 'Accounts / Billing';
    case 'viewer':
      return 'Read-Only Viewer';
    default:
      return 'Staff';
  }
};
