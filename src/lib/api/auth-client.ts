"use client";

import { apiRequest, getApiBaseUrl, getAccessToken } from "@/lib/api/client";
import type {
  ChatMessage,
  Conversation,
  CustomerOnboardingRequest,
  CustomerPreferencesRequest,
  DirectoryProfessional,
  InAppNotification,
  ProfessionalArrangement,
  ProfessionalCreateRequest,
  ProfessionalService,
  ProfessionalServiceCreateRequest,
  RecurringArrangementCreateRequest,
  RequestDeletionRequest,
  Review,
  ServiceTicket,
  ServiceTicketCreateRequest,
  User,
} from "@/lib/api/types";
import { ApiError } from "@/lib/api/types";

function asList<T>(
  data: unknown,
  keys: string[] = ["items", "tickets", "conversations", "messages", "reviews"],
): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data as T[];
  if (typeof data === "object") {
    const obj = data as Record<string, unknown>;
    for (const key of keys) {
      if (Array.isArray(obj[key])) return obj[key] as T[];
    }
  }
  return [];
}

function asRecord(data: unknown): Record<string, unknown> {
  return data && typeof data === "object"
    ? (data as Record<string, unknown>)
    : {};
}

export async function getMe() {
  return apiRequest<{ user: User } | User>("/api/v1/auth/me", {
    method: "GET",
  }).then((data) => {
    if (data && typeof data === "object" && "user" in data && data.user) {
      return { user: data.user as User };
    }
    return { user: data as User };
  });
}

export type UpdateMePayload = {
  full_name: string;
  phone?: string | null;
  whatsapp_number?: string | null;
  home_state_id?: string | null;
  home_lga_id?: string | null;
};

export async function updateMe(payload: UpdateMePayload) {
  const data = await apiRequest<{ user?: User } | User>("/api/v1/auth/me", {
    method: "PATCH",
    body: payload,
  });
  if (data && typeof data === "object" && "user" in data && data.user) {
    return data.user as User;
  }
  return data as User;
}

export async function listPendingReviews() {
  const data = await apiRequest<unknown>("/api/v1/reviews/pending");
  return asList<ServiceTicket>(data, [
    "items",
    "tickets",
    "pending_reviews",
    "reviews",
  ]);
}

export async function logoutRequest(refreshToken: string) {
  return apiRequest<{ message?: string }>("/api/v1/auth/logout", {
    method: "POST",
    body: { refresh_token: refreshToken },
  });
}

export async function resendVerification(email: string) {
  return apiRequest<{ message?: string }>("/api/v1/auth/resend-verification", {
    method: "POST",
    auth: false,
    body: { email },
  });
}

export async function submitOnboarding(payload: CustomerOnboardingRequest) {
  return apiRequest<{ user?: User; message?: string }>(
    "/api/v1/auth/onboarding",
    { method: "POST", body: payload },
  );
}

export async function saveCustomerPreferences(
  payload: CustomerPreferencesRequest,
) {
  return apiRequest<{ message?: string }>("/api/v1/auth/customer-preferences", {
    method: "POST",
    body: payload,
  });
}

export async function uploadProfilePhoto(file: File) {
  const form = new FormData();
  form.append("file", file);
  return apiRequest<{ profile_photo_url?: string; user?: User }>(
    "/api/v1/auth/profile-photo",
    { method: "POST", formData: form },
  );
}

export async function deleteProfilePhoto() {
  return apiRequest<{ message?: string }>("/api/v1/auth/profile-photo", {
    method: "DELETE",
  });
}

export async function requestAccountDeletion(payload: RequestDeletionRequest) {
  return apiRequest<{ message?: string }>("/api/v1/auth/request-deletion", {
    method: "POST",
    body: payload,
  });
}

export async function createServiceTicket(payload: ServiceTicketCreateRequest) {
  return apiRequest<{ ticket?: ServiceTicket; message?: string }>(
    "/api/v1/tickets",
    { method: "POST", body: payload },
  );
}

export async function listCustomerTickets(customerId: string) {
  const data = await apiRequest<unknown>(
    `/api/v1/tickets/customer/${customerId}`,
  );
  return asList<ServiceTicket>(data, ["tickets", "items"]);
}

export async function listProfessionalTickets(professionalId: string) {
  const data = await apiRequest<unknown>(
    `/api/v1/tickets/professional/${professionalId}`,
  );
  return asList<ServiceTicket>(data, ["tickets", "items"]);
}

export async function getTicket(ticketId: string) {
  const data = await apiRequest<unknown>(`/api/v1/tickets/${ticketId}`);
  const record = asRecord(data);
  return (record.ticket as ServiceTicket) || (data as ServiceTicket);
}

export async function updateTicketStatus(
  ticketId: string,
  status: "in_progress" | "completed",
) {
  return apiRequest<unknown>(`/api/v1/tickets/${ticketId}/status`, {
    method: "PUT",
    body: { status },
  });
}

export async function submitTicketQuote(
  ticketId: string,
  amountKobo: number,
  note?: string,
) {
  return apiRequest<unknown>(`/api/v1/tickets/${ticketId}/quote`, {
    method: "PUT",
    body: { amount_kobo: amountKobo, currency: "NGN", note: note || null },
  });
}

export async function confirmTicketQuote(ticketId: string) {
  return apiRequest<unknown>(`/api/v1/tickets/${ticketId}/quote/confirm`, {
    method: "PUT",
  });
}

export async function disputeTicket(ticketId: string, reason: string) {
  return apiRequest<unknown>(`/api/v1/tickets/${ticketId}/dispute`, {
    method: "PUT",
    body: { reason },
  });
}

export async function listConversations() {
  const data = await apiRequest<unknown>("/api/v1/conversations");
  return asList<Conversation>(data, ["conversations", "items"]);
}

export async function getConversation(conversationId: string) {
  const data = await apiRequest<unknown>(
    `/api/v1/conversations/${conversationId}`,
  );
  const record = asRecord(data);
  return (record.conversation as Conversation) || (data as Conversation);
}

export async function listMessages(conversationId: string) {
  const data = await apiRequest<unknown>(
    `/api/v1/conversations/${conversationId}/messages`,
  );
  return asList<ChatMessage>(data, ["messages", "items"]);
}

export async function sendTicketMessage(ticketId: string, body: string) {
  return apiRequest<unknown>(
    `/api/v1/conversations/by-ticket/${ticketId}/messages`,
    { method: "POST", body: { body } },
  );
}

export async function sendArrangementMessage(
  arrangementId: string,
  body: string,
) {
  return apiRequest<unknown>(
    `/api/v1/conversations/by-arrangement/${arrangementId}/messages`,
    { method: "POST", body: { body } },
  );
}

export async function markConversationRead(conversationId: string) {
  return apiRequest<unknown>(
    `/api/v1/conversations/${conversationId}/read`,
    { method: "POST" },
  );
}

export async function listProfessionalReviews(professionalId: string) {
  const data = await apiRequest<unknown>(
    `/api/v1/reviews/professional/${professionalId}`,
  );
  return asList<Review>(data, ["reviews", "items"]);
}

export async function createOneOffReview(input: {
  ticketId: string;
  rating: number;
  comment: string;
  proof?: File | null;
}) {
  const form = new FormData();
  form.append("ticket_id", input.ticketId);
  form.append("rating", String(input.rating));
  form.append("comment", input.comment);
  if (input.proof) form.append("proof", input.proof);
  return apiRequest<unknown>("/api/v1/reviews/one-off", {
    method: "POST",
    formData: form,
  });
}

export async function getCustomerVerificationStatus() {
  return apiRequest<Record<string, unknown>>(
    "/api/v1/customers/verification-status",
  );
}

export async function submitCustomerIdentity(docType: string, file: File) {
  const form = new FormData();
  form.append("doc_type", docType);
  form.append("file", file);
  return apiRequest<unknown>("/api/v1/customers/verify-identity", {
    method: "POST",
    formData: form,
  });
}

export async function getMyProfessional() {
  const data = await apiRequest<unknown>("/api/v1/professionals/me");
  const record = asRecord(data);
  return (
    (record.professional as DirectoryProfessional) ||
    (data as DirectoryProfessional)
  );
}

export async function createProfessional(payload: ProfessionalCreateRequest) {
  const data = await apiRequest<unknown>("/api/v1/professionals", {
    method: "POST",
    body: payload,
  });
  const record = asRecord(data);
  return (
    (record.professional as DirectoryProfessional) ||
    (data as DirectoryProfessional)
  );
}

export async function listProfessionalServices(professionalId: string) {
  const data = await apiRequest<unknown>(
    `/api/v1/professionals/${professionalId}/services`,
  );
  return asList<ProfessionalService>(data, ["services", "items"]);
}

export async function createProfessionalService(
  professionalId: string,
  payload: ProfessionalServiceCreateRequest,
) {
  return apiRequest<unknown>(
    `/api/v1/professionals/${professionalId}/services`,
    { method: "POST", body: payload },
  );
}

export async function deleteProfessionalService(
  professionalId: string,
  serviceId: string,
) {
  return apiRequest<unknown>(
    `/api/v1/professionals/${professionalId}/services/${serviceId}`,
    { method: "DELETE" },
  );
}

export async function listProfessionalArrangements(professionalId: string) {
  const data = await apiRequest<unknown>(
    `/api/v1/arrangements/professional/${professionalId}`,
  );
  return asList<ProfessionalArrangement>(data, [
    "arrangements",
    "items",
    "history",
  ]);
}

export async function listCustomerArrangements(customerId: string) {
  const data = await apiRequest<unknown>(
    `/api/v1/arrangements/customer/${customerId}`,
  );
  return asList<ProfessionalArrangement>(data, [
    "arrangements",
    "items",
    "history",
  ]);
}

export async function getArrangement(arrangementId: string) {
  const data = await apiRequest<unknown>(
    `/api/v1/arrangements/${arrangementId}`,
  );
  const record = asRecord(data);
  return (
    (record.arrangement as ProfessionalArrangement) ||
    (data as ProfessionalArrangement)
  );
}

export async function createArrangement(
  payload: RecurringArrangementCreateRequest,
) {
  const data = await apiRequest<unknown>("/api/v1/arrangements", {
    method: "POST",
    body: payload,
  });
  const record = asRecord(data);
  return (
    (record.arrangement as ProfessionalArrangement) ||
    (data as ProfessionalArrangement)
  );
}

export async function updateArrangementInterval(
  arrangementId: string,
  reviewInterval: string,
) {
  return apiRequest<unknown>(
    `/api/v1/arrangements/${arrangementId}/interval`,
    {
      method: "PUT",
      body: { review_interval: reviewInterval },
    },
  );
}

export async function endArrangement(arrangementId: string) {
  return apiRequest<unknown>(`/api/v1/arrangements/${arrangementId}/end`, {
    method: "PUT",
  });
}

export async function createRecurringReview(input: {
  arrangementId: string;
  rating: number;
  comment: string;
  proof?: File | null;
}) {
  const form = new FormData();
  form.append("arrangement_id", input.arrangementId);
  form.append("rating", String(input.rating));
  form.append("comment", input.comment);
  if (input.proof) form.append("proof", input.proof);
  return apiRequest<unknown>("/api/v1/reviews/recurring", {
    method: "POST",
    formData: form,
  });
}

export async function amendReview(
  reviewId: string,
  input: {
    rating?: number;
    comment?: string;
    proof?: File | null;
  },
) {
  const form = new FormData();
  if (input.rating != null) form.append("rating", String(input.rating));
  if (input.comment != null) form.append("comment", input.comment);
  if (input.proof) form.append("proof", input.proof);
  return apiRequest<unknown>(`/api/v1/reviews/${reviewId}`, {
    method: "PUT",
    formData: form,
  });
}

export function reviewProofUrl(reviewId: string) {
  return `${getApiBaseUrl()}/api/v1/reviews/${reviewId}/proof`;
}

export function privateFileAccessUrl(token: string) {
  return `${getApiBaseUrl()}/api/v1/files/private-access?token=${encodeURIComponent(token)}`;
}

export function serviceDisplayName(service: ProfessionalService) {
  return String(service.service_name || service.name || "Service").trim();
}

export async function uploadProfessionalGalleryImage(
  professionalId: string,
  file: File,
  onProgress?: (percent: number) => void,
) {
  const form = new FormData();
  form.append("file", file);
  const token = getAccessToken();

  return new Promise<{
    id?: string;
    url?: string;
    image?: { id?: string; url?: string };
    gallery_image?: { id?: string; url?: string };
  }>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(
      "POST",
      `${getApiBaseUrl()}/api/v1/professionals/${professionalId}/gallery`,
    );
    xhr.setRequestHeader("Accept", "application/json");
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.upload.onprogress = (event) => {
      if (!onProgress || !event.lengthComputable || event.total <= 0) return;
      onProgress(Math.min(99, Math.round((event.loaded / event.total) * 100)));
    };

    xhr.onload = () => {
      let json: {
        success?: boolean;
        data?: {
          id?: string;
          url?: string;
          image?: { id?: string; url?: string };
          gallery_image?: { id?: string; url?: string };
        } | null;
        error?: { code?: string; message?: string; details?: unknown };
      } | null = null;

      try {
        json = xhr.responseText ? JSON.parse(xhr.responseText) : null;
      } catch {
        reject(
          new ApiError(
            xhr.status || 500,
            "invalid_json",
            "Invalid API response",
          ),
        );
        return;
      }

      if (xhr.status >= 200 && xhr.status < 300 && json?.success !== false) {
        onProgress?.(100);
        resolve((json?.data ?? {}) as {
          id?: string;
          url?: string;
          image?: { id?: string; url?: string };
          gallery_image?: { id?: string; url?: string };
        });
        return;
      }

      reject(
        new ApiError(
          xhr.status || 500,
          json?.error?.code || `http_${xhr.status}`,
          json?.error?.message || "Gallery upload failed.",
          json?.error?.details,
        ),
      );
    };

    xhr.onerror = () => {
      reject(new ApiError(0, "network_error", "Network error during upload."));
    };

    xhr.send(form);
  });
}

export async function deleteProfessionalGalleryImage(
  professionalId: string,
  imageId: string,
) {
  return apiRequest<unknown>(
    `/api/v1/professionals/${professionalId}/gallery/${imageId}`,
    { method: "DELETE" },
  );
}

export async function updateProfessional(
  professionalId: string,
  payload: Partial<ProfessionalCreateRequest>,
) {
  return apiRequest<unknown>(`/api/v1/professionals/${professionalId}`, {
    method: "PUT",
    body: payload,
  });
}

export async function submitProfessionalVerification(
  professionalId: string,
  documentType: string,
  file: File,
) {
  const form = new FormData();
  form.append("document_type", documentType);
  form.append("file", file);
  return apiRequest<unknown>(
    `/api/v1/professionals/${professionalId}/verify`,
    { method: "POST", formData: form },
  );
}

function mapNotification(raw: unknown): InAppNotification | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;
  const id = String(item.id || "");
  if (!id) return null;

  const type = String(item.type || item.notification_type || item.kind || "ticket");
  const title = String(item.title || item.subject || "Notification");
  const body = String(
    item.body || item.message || item.content || item.description || "",
  );
  const createdAt = item.created_at
    ? String(item.created_at)
    : item.createdAt
      ? String(item.createdAt)
      : null;

  const unread = !(
    item.is_read === true ||
    item.read === true ||
    item.read_at ||
    item.readAt
  );

  const entityId = String(
    item.entity_id ||
      item.ticket_id ||
      item.review_id ||
      item.conversation_id ||
      item.resource_id ||
      "",
  );

  let href = String(
    item.href || item.link || item.action_url || item.url || "",
  );
  if (!href) {
    if (type.includes("review") && entityId) href = `/review/${entityId}`;
    else if (entityId) href = `/tickets/${entityId}`;
    else href = "/dashboard/customer";
  }

  return {
    id,
    title,
    body,
    type,
    href,
    unread,
    created_at: createdAt,
    raw: item,
  };
}

export async function listNotifications(page = 1, pageSize = 30) {
  const data = await apiRequest<unknown>(
    `/api/v1/notifications?page=${page}&page_size=${pageSize}`,
  );
  const items = asList<unknown>(data, [
    "items",
    "notifications",
    "results",
  ]).map(mapNotification).filter((item): item is InAppNotification => Boolean(item));
  return items;
}

export async function getUnreadNotificationCount() {
  const data = await apiRequest<unknown>("/api/v1/notifications/unread-count");
  if (typeof data === "number") return data;
  const record = asRecord(data);
  const count =
    record.unread_count ??
    record.count ??
    record.unread ??
    record.total_unread;
  return Number(count || 0);
}

export async function markNotificationRead(notificationId: string) {
  return apiRequest<unknown>(`/api/v1/notifications/${notificationId}/read`, {
    method: "POST",
  });
}

export async function markAllNotificationsRead() {
  return apiRequest<unknown>("/api/v1/notifications/read-all", {
    method: "POST",
  });
}
