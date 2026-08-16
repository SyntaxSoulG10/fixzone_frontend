import { ReactNode } from 'react';
import { getSessionUser } from '@/lib/session';
import AccessDenied from './AccessDenied';
import { redirect } from 'next/navigation';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: string[];
}

export default async function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const user = await getSessionUser();

  if (!user) {
    // If somehow middleware let it pass, redirect to login
    redirect('/login');
  }

  // Handle case-insensitivity or standard mappings if necessary
  const userRole = user.role?.toUpperCase();
  const hasAccess = allowedRoles.some(role => role.toUpperCase() === userRole);

  if (!hasAccess) {
    return <AccessDenied />;
  }

  return <>{children}</>;
}
