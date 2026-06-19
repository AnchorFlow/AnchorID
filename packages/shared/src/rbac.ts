import { Role } from '@anchorid/types';

const ROLE_HIERARCHY: Record<Role, number> = {
  [Role.USER]: 0,
  [Role.ANCHOR_MEMBER]: 1,
  [Role.ANCHOR_ADMIN]: 2,
  [Role.ADMIN]: 3,
};

/** True if `role` is allowed where any of `required` would satisfy the check. */
export function hasRole(role: Role, required: Role[]): boolean {
  return required.includes(role);
}

export function isAtLeast(role: Role, minimum: Role): boolean {
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[minimum];
}
