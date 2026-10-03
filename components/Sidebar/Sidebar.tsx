"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import classNames from "classnames";

import {
  ACCOUNT_NAV_ITEMS,
  getVisibleNavItems,
  isActiveNavItem,
  LOGIN_ROUTE,
  NAV_ITEMS,
} from "@/lib/constants";
import { useAuth } from "@/store";

type TSidebarProps = {
  open?: boolean;
  onClose?: () => void;
};

const appName = process.env.NEXT_PUBLIC_NAME ?? "Kost Apps";

export function Sidebar({ open = false, onClose }: TSidebarProps) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const { user, logout } = useAuth();

  const mainItems = getVisibleNavItems(NAV_ITEMS, user?.role);
  const accountItems = getVisibleNavItems(ACCOUNT_NAV_ITEMS, user?.role);

  const handleLogout = () => {
    logout();
    onClose?.();
    router.replace(LOGIN_ROUTE);
  };

  return (
    <>
      <button
        type="button"
        aria-label="Close sidebar"
        onClick={onClose}
        className={classNames(
          "fixed inset-0 z-30 bg-ink/40 backdrop-blur-[2px] lg:hidden",
          open ? "block" : "hidden",
        )}
      />

      <aside
        className={classNames(
          "fixed inset-y-0 left-0 z-40 flex w-[272px] flex-col bg-primary text-white transition-transform duration-200 lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center gap-3 px-5 py-6">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-white/12 ring-1 ring-white/20">
            <Icon icon="solar:home-smile-bold" className="size-6" />
          </div>
          <div>
            <p className="font-semibold tracking-tight">{appName}</p>
            <p className="text-xs text-white/65">Boarding house dashboard</p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 pb-4">
          <NavSection
            title="Manage"
            items={mainItems}
            pathname={pathname}
            onNavigate={onClose}
          />
          <NavSection
            title="Account"
            items={accountItems}
            pathname={pathname}
            onNavigate={onClose}
          />
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="mb-3 rounded-2xl bg-white/8 px-3 py-3 ring-1 ring-white/10">
            <p className="truncate text-sm font-medium">
              {user?.fullName ?? "User"}
            </p>
            <p className="truncate text-xs text-white/65">
              {user?.email ?? "—"}
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white/10 text-sm font-medium transition hover:bg-white/16"
          >
            <Icon icon="solar:logout-2-linear" className="size-5" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}

type TNavSectionProps = {
  title: string;
  items: ReturnType<typeof getVisibleNavItems>;
  pathname: string;
  onNavigate?: () => void;
};

function NavSection({ title, items, pathname, onNavigate }: TNavSectionProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div>
      <p className="mb-2 px-3 text-[11px] font-medium tracking-[0.16em] text-white/50 uppercase">
        {title}
      </p>
      <ul className="flex flex-col gap-1">
        {items.map((item) => {
          const active = isActiveNavItem(pathname, item.href);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                className={classNames(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                  active
                    ? "bg-white/14 font-medium text-white"
                    : "text-white/75 hover:bg-white/10 hover:text-white",
                )}
              >
                <Icon icon={item.icon} className="size-5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
