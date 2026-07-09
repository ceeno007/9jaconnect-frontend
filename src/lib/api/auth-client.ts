"use client";

import { apiRequest } from "@/lib/api/client";
import type {
  ChatMessage,
  Conversation,
  CustomerOnboardingRequest,
  CustomerPreferencesRequest,
  DirectoryProfessional,
  ProfessionalCreateRequest,
  RequestDeletionRequest,
  Review,
  ServiceTicket,
  ServiceTicketCreateRequest,
  User,
} from "@/lib/api/types";

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
