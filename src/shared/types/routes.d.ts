import { ReactNode } from 'react';

export type AppRoute = {
  path: string;
  element: ReactNode;
  title: string;
  isPrivate?: boolean;
  showHeader?: boolean;
  showFooter?: boolean;
  showBreadcrumb?: boolean;
  roles?: string[];
};