"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import {
  deactivateAdminUser,
  displayName,
  inviteAdminUser,
  listAdminUsers,
  resendAdminInvite,
  suspendAdminUser,
  unsuspendAdminUser,
} from "@/lib/api/admin-client";
import { ApiError } from "@/lib/api/types";

export default function AdminUsersPage() {
  const toast = useToast();
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingId, setPendingId] = useState("");
  const [invitePending, setInvitePending] = useState(false);

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      setItems(await listAdminUsers());
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not load users.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      JSON.stringify(item).toLowerCase().includes(q),
    );
  }, [items, query]);

  async function onInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setInvitePending(true);
    const form = new FormData(event.currentTarget);
    try {
      await inviteAdminUser({
        email: String(form.get("email") || "").trim(),
        full_name: String(form.get("full_name") || "").trim(),
      });
      toast.success("Admin invite sent");
      event.currentTarget.reset();
      await refresh();
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Could not invite admin.",
      );
    } finally {
      setInvitePending(false);
    }
  }

  async function runAction(
    id: string,
    action: () => Promise<unknown>,
    success: string,
  ) {
    setPendingId(id);
    try {
      await action();
      toast.success(success);
      await refresh();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Action failed.");
    } finally {
      setPendingId("");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-black">Manage users</h1>
        <p className="mt-2 text-base font-medium text-muted">
          Invite admins, suspend accounts, or deactivate users.
        </p>
      </div>

      <section className="ui-card p-6">
        <h2 className="text-xl font-bold text-black">Invite admin</h2>
        <form
          className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
          onSubmit={onInvite}
        >
          <Input label="Full name" name="full_name" required />
          <Input label="Email" name="email" type="email" required />
          <div className="flex items-end">
            <Button type="submit" disabled={invitePending}>
              {invitePending ? "Inviting…" : "Send invite"}
            </Button>
          </div>
        </form>
      </section>

      <div className="max-w-sm">
        <Input
          label="Search users"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Name or email..."
        />
      </div>

      {loading ? (
        <p className="text-sm font-medium text-muted">Loading…</p>
      ) : error ? (
        <EmptyState title="Could not load users" description={error}>
          <Button onClick={() => void refresh()}>Retry</Button>
        </EmptyState>
      ) : filtered.length === 0 ? (
        <EmptyState title="No users found" />
      ) : (
        <div className="overflow-hidden ui-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#fafafa] text-muted">
              <tr>
                <th className="px-4 py-3 font-bold">User</th>
                <th className="px-4 py-3 font-bold">Role</th>
                <th className="px-4 py-3 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const id = String(item.id || "");
                const busy = pendingId === id;
                const role = String(
                  item.user_type || item.role || item.type || "user",
                );
                return (
                  <tr key={id || displayName(item)} className="border-t border-[#eee]">
                    <td className="px-4 py-4">
                      <p className="font-bold text-black">{displayName(item)}</p>
                      <p className="text-muted">{String(item.email || "")}</p>
                    </td>
                    <td className="px-4 py-4 font-semibold">{role}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        {role === "admin" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={busy || !id}
                            onClick={() =>
                              void runAction(
                                id,
                                () => resendAdminInvite(id),
                                "Invite resent",
                              )
                            }
                          >
                            Resend invite
                          </Button>
                        ) : null}
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busy || !id}
                          onClick={() => {
                            const reason = window.prompt("Suspend reason");
                            if (!reason?.trim()) return;
                            void runAction(
                              id,
                              () => suspendAdminUser(id, reason.trim()),
                              "User suspended",
                            );
                          }}
                        >
                          Suspend
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busy || !id}
                          onClick={() =>
                            void runAction(
                              id,
                              () => unsuspendAdminUser(id),
                              "User unsuspended",
                            )
                          }
                        >
                          Unsuspend
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          disabled={busy || !id}
                          onClick={() => {
                            if (!window.confirm("Deactivate this user?")) return;
                            void runAction(
                              id,
                              () => deactivateAdminUser(id),
                              "User deactivated",
                            );
                          }}
                        >
                          Deactivate
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
