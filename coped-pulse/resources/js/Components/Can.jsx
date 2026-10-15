import { usePage } from '@inertiajs/react';

export function useRole() {
    return usePage().props.auth?.user?.role ?? null;
}

/**
 * Client-side role guard (UX only — never a security boundary).
 * Server must still enforce RoleMiddleware + Policies.
 *
 * Usage: <Can roles={['staff']}><Link ...>New Course</Link></Can>
 */
export default function Can({ roles, children, fallback = null }) {
    const role = useRole();
    if (!roles.includes(role)) return fallback;
    return children;
}
