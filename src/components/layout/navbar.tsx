"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { MessageSquare, UserRound } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { NotificationsMenu } from "@/components/layout/notifications-menu";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { isAdminAreaPath, isAdminAuthPath } from "@/lib/admin-paths";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/find", label: "Find Professionals" },
];

const panelVariants: Variants = {
  closed: {
    x: "100%",
    transition: {
      duration: 0.28,
      ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
      when: "afterChildren",
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
  open: {
    x: 0,
    transition: {
      duration: 0.34,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      when: "beforeChildren",
      staggerChildren: 0.05,
      delayChildren: 0.06,
    },
  },
};

const itemVariants: Variants = {
  closed: {
    opacity: 0,
    x: 18,
    filter: "blur(4px)",
  },
  open: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.28,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

function AccountAvatar({
  photoUrl,
  name,
  size = "md",
}: {
  photoUrl?: string | null;
  name?: string | null;
  size?: "sm" | "md";
}) {
  const dim = size === "sm" ? 20 : 32;
  const className =
    size === "sm"
      ? "h-5 w-5 rounded-full object-cover"
      : "h-8 w-8 rounded-full object-cover ring-1 ring-[#e4e2e0]";

  if (photoUrl) {
    return (
      <Image
        src={photoUrl}
        alt={name ? `${name} profile` : "Profile"}
        width={dim}
        height={dim}
        className={className}
      />
    );
  }

  return <UserRound className="h-5 w-5" />;
}

export function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  if (isAdminAreaPath(pathname) || isAdminAuthPath(pathname)) return null;

  const accountHref = !isAuthenticated
    ? "/login"
    : user?.user_type === "professional"
      ? "/dashboard/professional"
      : "/dashboard/customer";

  const messagesHref = !isAuthenticated
    ? "/login?next=/dashboard/customer/tickets"
    : user?.user_type === "professional"
      ? "/dashboard/professional/tickets"
      : "/dashboard/customer/tickets";

  const photoUrl = isAuthenticated ? user?.profile_photo_url : null;

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-[#e4e2e0] bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 lg:px-6">
        <Logo compact className="shrink-0" />

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : link.href === "/find"
                  ? pathname.startsWith("/find") ||
                    pathname.startsWith("/professionals")
                  : false;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative px-3 py-5 text-[15px] font-bold text-[#2d2d2d] transition hover:text-black",
                  active && "text-black",
                )}
              >
                {link.label}
                {active ? (
                  <span className="absolute inset-x-2 bottom-0 h-[3px] rounded-full bg-black" />
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto hidden items-center gap-1 md:flex">
          <Link
            href={messagesHref}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#2d2d2d] hover:bg-[#f3f2f1]"
            aria-label="Messages"
          >
            <MessageSquare className="h-5 w-5" />
          </Link>
          <NotificationsMenu />
          <Link
            href={accountHref}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#2d2d2d] hover:bg-[#f3f2f1]"
            aria-label="Account"
          >
            <AccountAvatar photoUrl={photoUrl} name={user?.full_name} />
          </Link>

          <span className="mx-2 h-6 w-px bg-[#e4e2e0]" />

          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => void logout()}
              className="px-2 text-[15px] font-bold text-[#2d2d2d] hover:underline"
            >
              Log out
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/signup/customer"
                className="px-2 text-[15px] font-bold text-[#2d2d2d] hover:underline"
              >
                Sign up
              </Link>
              <Link href="/signup/professional">
                <Button size="sm" className="rounded-full px-4">
                  List as Pro
                </Button>
              </Link>
            </div>
          )}
        </div>

        <button
          type="button"
          className="relative z-[60] ml-auto inline-flex h-10 w-10 items-center justify-center md:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          <span className="relative block h-3.5 w-5">
            <motion.span
              className="absolute left-0 top-0 block h-[2px] w-5 origin-center bg-black"
              animate={open ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.span
              className="absolute left-0 top-[6px] block h-[2px] w-5 bg-black"
              animate={open ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.16 }}
            />
            <motion.span
              className="absolute left-0 top-[12px] block h-[2px] w-5 origin-center bg-black"
              animate={open ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            />
          </span>
        </button>
      </div>

      <AnimatePresence initial={false}>
        {open ? (
          <>
            <motion.button
              type="button"
              aria-label="Close menu overlay"
              className="fixed inset-0 z-40 bg-black/25 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 right-0 z-50 flex w-[min(86vw,320px)] flex-col bg-white md:hidden"
              initial="closed"
              animate="open"
              exit="closed"
              variants={panelVariants}
            >
              <div className="flex h-16 items-center justify-between border-b border-[#e4e2e0] px-5">
                <Logo compact />
              </div>

              <div className="flex flex-1 flex-col overflow-y-auto px-5 pb-6 pt-2">
                <nav className="flex flex-col">
                  {navLinks.map((link) => {
                    const active =
                      link.href === "/"
                        ? pathname === "/"
                        : pathname.startsWith("/find") ||
                          pathname.startsWith("/professionals");

                    return (
                      <motion.div key={link.href} variants={itemVariants}>
                        <Link
                          href={link.href}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "flex items-center justify-between border-b border-[#f0eeec] py-4 text-[17px] font-bold text-black",
                            active && "text-black",
                          )}
                        >
                          {link.label}
                          {active ? (
                            <span className="h-1.5 w-1.5 rounded-full bg-black" />
                          ) : null}
                        </Link>
                      </motion.div>
                    );
                  })}

                  <motion.div variants={itemVariants}>
                    <Link
                      href={accountHref}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 border-b border-[#f0eeec] py-4 text-[17px] font-bold text-black"
                    >
                      <AccountAvatar
                        photoUrl={photoUrl}
                        name={user?.full_name}
                        size="sm"
                      />
                      {isAuthenticated ? "Account" : "Login"}
                    </Link>
                  </motion.div>
                  {!isAuthenticated ? (
                    <motion.div variants={itemVariants}>
                      <Link
                        href="/signup/customer"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 border-b border-[#f0eeec] py-4 text-[17px] font-bold text-black"
                      >
                        Sign up as Customer
                      </Link>
                    </motion.div>
                  ) : (
                    <motion.div variants={itemVariants}>
                      <button
                        type="button"
                        onClick={() => {
                          setOpen(false);
                          void logout();
                        }}
                        className="flex w-full items-center gap-3 border-b border-[#f0eeec] py-4 text-left text-[17px] font-bold text-black"
                      >
                        Log out
                      </button>
                    </motion.div>
                  )}

                  <motion.div variants={itemVariants}>
                    <Link
                      href={messagesHref}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 border-b border-[#f0eeec] py-4 text-[17px] font-bold text-black"
                    >
                      <MessageSquare className="h-5 w-5" />
                      Messages
                    </Link>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <NotificationsMenu variant="row" />
                  </motion.div>
                </nav>

                <motion.div
                  variants={itemVariants}
                  className="mt-auto space-y-3 pt-6"
                >
                  {!isAuthenticated ? (
                    <Link
                      href="/signup/customer"
                      onClick={() => setOpen(false)}
                    >
                      <Button variant="outline" className="w-full" size="lg">
                        Sign up as Customer
                      </Button>
                    </Link>
                  ) : null}
                  <Link
                    href="/signup/professional"
                    onClick={() => setOpen(false)}
                  >
                    <Button className="w-full" size="lg">
                      List as Pro
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
