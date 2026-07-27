import { httpRequest, unwrapList } from "@/lib/api/http";
import { ApiError } from "@/lib/api/types";
import type {
  AuthSessionPayload,
  AdSlot,
  Category,
  DirectoryProfessional,
  Lga,
  Pagination,
  ProfessionalDetail,
  RegisterRequest,
  State,
  Subcategory,
  User,
  UserType,
} from "@/lib/api/types";

export async function loginRequest(email: string, password: string) {
  return httpRequest<AuthSessionPayload>("/api/v1/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export async function registerRequest(payload: RegisterRequest) {
  return httpRequest<{ user: User; message?: string }>("/api/v1/auth/register", {
    method: "POST",
    body: payload,
  });
}

export async function forgotPasswordRequest(email: string) {
  return httpRequest<{ message?: string }>("/api/v1/auth/forgot-password", {
    method: "POST",
    body: { email },
  });
}

export async function resetPasswordRequest(token: string, newPassword: string) {
  return httpRequest<{ message?: string }>("/api/v1/auth/reset-password", {
    method: "POST",
    body: { token, new_password: newPassword },
  });
}

export async function verifyEmailRequest(token: string) {
  return httpRequest<{ message?: string }>("/api/v1/auth/verify-email", {
    method: "POST",
    body: { token },
  });
}

export async function googleOAuthRequest(
  idToken: string,
  options?: {
    user_type?: UserType;
  },
) {
  return httpRequest<AuthSessionPayload>("/api/v1/auth/oauth/google", {
    method: "POST",
    body: {
      id_token: idToken,
      ...(options?.user_type ? { user_type: options.user_type } : {}),
    },
  });
}

export async function listCategories() {
  const data = await httpRequest<
    Category[] | { categories: Category[]; items?: Category[] }
  >("/api/v1/categories", {
    next: { revalidate: 300 },
  });
  return unwrapList(data, "categories");
}

export async function listSubcategories(categoryId: string) {
  const data = await httpRequest<
    Subcategory[] | { subcategories?: Subcategory[]; items?: Subcategory[] }
  >(`/api/v1/categories/${categoryId}/subcategories`, {
    next: { revalidate: 300 },
  });
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.subcategories)) return data.subcategories;
  if (data && Array.isArray(data.items)) return data.items;
  return [];
}

export async function listStates() {
  const data = await httpRequest<State[] | { states: State[]; items?: State[] }>(
    "/api/v1/locations/states",
    { next: { revalidate: 3600 } },
  );
  return unwrapList(data, "states");
}

export async function listLgas(stateId: string) {
  const data = await httpRequest<Lga[] | { lgas: Lga[]; items?: Lga[] }>(
    `/api/v1/locations/states/${stateId}/lgas`,
    { next: { revalidate: 3600 } },
  );
  return unwrapList(data, "lgas");
}

export type DirectorySort = "recency" | "rating" | "recommended";

export type DirectoryQuery = {
  /** Preferred keyword param per Professional API docs. */
  query?: string;
  /** Alias accepted by the API; mapped to `query` when building the request. */
  q?: string;
  state_id?: string;
  lga_id?: string;
  category_id?: string;
  subcategory_id?: string;
  min_rating?: number | string;
  sort?: DirectorySort | string;
  page?: number;
  page_size?: number;
};

function buildDirectoryParams(query: DirectoryQuery) {
  const params = new URLSearchParams();
  const keyword = (query.query ?? query.q)?.trim();
  if (keyword) params.set("query", keyword);

  (
    [
      "state_id",
      "lga_id",
      "category_id",
      "subcategory_id",
      "min_rating",
      "sort",
      "page",
      "page_size",
    ] as const
  ).forEach((key) => {
    const value = query[key];
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });

  return params;
}

export async function listProfessionals(query: DirectoryQuery = {}) {
  const params = buildDirectoryParams(query);
  const qs = params.toString();
  const data = await httpRequest<{
    professionals?: DirectoryProfessional[];
    items?: DirectoryProfessional[];
    pagination?: Pagination;
  }>(`/api/v1/professionals${qs ? `?${qs}` : ""}`, {
    next: { revalidate: 60 },
  });

  const professionals = Array.isArray(data?.professionals)
    ? data.professionals
    : Array.isArray(data?.items)
      ? data.items
      : [];

  return {
    professionals,
    pagination: data?.pagination ?? {
      page: query.page ?? 1,
      page_size: query.page_size ?? 20,
      total: professionals.length,
      total_pages: 1,
    },
  };
}

/** Falls back to filter-only search when keyword search is rejected. */
export async function listProfessionalsForSearch(query: DirectoryQuery = {}) {
  const keyword = (query.query ?? query.q)?.trim();
  if (!keyword) {
    const data = await listProfessionals(query);
    return { ...data, keywordSearchUnavailable: false };
  }

  try {
    const data = await listProfessionals(query);
    return { ...data, keywordSearchUnavailable: false };
  } catch (err) {
    if (
      err instanceof ApiError &&
      err.code === "directory_search_invalid_params"
    ) {
      const { q: _q, query: _query, ...withoutKeyword } = query;
      const data = await listProfessionals(withoutKeyword);
      return { ...data, keywordSearchUnavailable: true };
    }
    throw err;
  }
}

export async function getProfessional(id: string) {
  const data = await httpRequest<{
    professional: ProfessionalDetail;
  }>(`/api/v1/professionals/${id}`, {
    next: { revalidate: 60 },
  });
  const detail = data.professional;

  // Public detail currently omits bio / experience that the directory list includes.
  const needsDirectoryFill =
    !detail?.service_description ||
    detail.years_of_experience == null ||
    detail.years_of_experience === undefined;

  if (!needsDirectoryFill) return detail;

  try {
    const listed = await listProfessionals({
      category_id: detail.category_id,
      page_size: 50,
    });
    let match = listed.professionals.find((item) => item.id === id);
    if (!match) {
      const all = await listProfessionals({ page_size: 50 });
      match = all.professionals.find((item) => item.id === id);
    }
    if (!match) return detail;

    return {
      ...match,
      ...detail,
      service_description:
        detail.service_description || match.service_description,
      years_of_experience:
        detail.years_of_experience ?? match.years_of_experience,
      services:
        Array.isArray(detail.services) && detail.services.length
          ? detail.services
          : match.services,
      gallery:
        Array.isArray(detail.gallery) && detail.gallery.length
          ? detail.gallery
          : match.gallery,
      cover_image_url: detail.cover_image_url || match.cover_image_url,
    };
  } catch {
    return detail;
  }
}

export async function listAds() {
  const data = await httpRequest<unknown>("/api/v1/ads", {
    next: { revalidate: 120 },
  });
  if (Array.isArray(data)) return data as AdSlot[];
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    for (const key of ["ads", "items", "slots"]) {
      if (Array.isArray(record[key])) return record[key] as AdSlot[];
    }
  }
  return [] as AdSlot[];
}
