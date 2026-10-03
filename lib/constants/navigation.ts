import type { TUserRole } from "@/lib/entities";
import {
  BILLS_ROUTE,
  EXPENSES_ROUTE,
  HOME_ROUTE,
  INCOMES_ROUTE,
  OCCUPANTS_ROUTE,
  PAYMENTS_ROUTE,
  PROPERTIES_ROUTE,
  REPORTS_ROUTE,
  ROOMS_ROUTE,
  SETTINGS_ROUTE,
} from "./url";

export type TNavItem = {
  href: string;
  label: string;
  description: string;
  icon: string;
  roles?: TUserRole[];
};

export const NAV_ITEMS: TNavItem[] = [
  {
    href: HOME_ROUTE,
    label: "Dashboard",
    description: "Overview of occupancy and operations",
    icon: "solar:widget-2-linear",
  },
  {
    href: PROPERTIES_ROUTE,
    label: "Properties",
    description: "Manage boarding houses",
    icon: "solar:buildings-2-linear",
    roles: ["OWNER"],
  },
  {
    href: ROOMS_ROUTE,
    label: "Rooms",
    description: "Track room availability",
    icon: "solar:home-2-linear",
    roles: ["OWNER"],
  },
  {
    href: OCCUPANTS_ROUTE,
    label: "Occupants",
    description: "Tenant and occupant records",
    icon: "solar:users-group-rounded-linear",
    roles: ["OWNER"],
  },
  {
    href: BILLS_ROUTE,
    label: "Bills",
    description: "Monthly and manual billing",
    icon: "solar:document-text-linear",
  },
  {
    href: INCOMES_ROUTE,
    label: "Incomes",
    description: "Manual income entries",
    icon: "solar:wad-of-money-linear",
    roles: ["OWNER"],
  },
  {
    href: EXPENSES_ROUTE,
    label: "Expenses",
    description: "Property expense records",
    icon: "solar:bill-list-linear",
    roles: ["OWNER"],
  },
  {
    href: REPORTS_ROUTE,
    label: "Reports",
    description: "Income and expense report",
    icon: "solar:chart-2-linear",
    roles: ["OWNER"],
  },
  {
    href: PAYMENTS_ROUTE,
    label: "Payments",
    description: "Payment and Midtrans status",
    icon: "solar:wallet-2-linear",
  },
];

export const ACCOUNT_NAV_ITEMS: TNavItem[] = [
  {
    href: SETTINGS_ROUTE,
    label: "Settings",
    description: "Change password and account",
    icon: "solar:settings-linear",
  },
];

export const getVisibleNavItems = (
  items: TNavItem[],
  role?: TUserRole | null,
) => {
  return items.filter((item) => {
    if (!item.roles || item.roles.length === 0) {
      return true;
    }

    return role ? item.roles.includes(role) : false;
  });
};

export const isActiveNavItem = (pathname: string, href: string) => {
  if (href === HOME_ROUTE) {
    return pathname === HOME_ROUTE;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
};
