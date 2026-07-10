export type UserType = "customer" | "professional" | "admin";

export type ApiErrorBody = {
  code?: string;
  message?: string;
  details?: unknown;
};

export type ApiEnvelope<T> = {
  success: boolean;
  data: T | null;
  error: ApiErrorBody | null;
};

export type User = {
  id: string;
  professional_id: string | null;
  email: string;
  phone: string | null;
  user_type: UserType;
  full_name: string;
  whatsapp_number: string | null;
  profile_photo_url: string | null;
  date_of_birth: string | null;
  gender: string | null;
  home_state_id: string | null;
  home_lga_id: string | null;
  kyc_status: string | null;
  onboarding_completed: boolean;
  is_verified: boolean;
  is_active: boolean;
  is_suspended: boolean;
};

export type AuthTokens = {
  access_token: string;
  refresh_token: string;
  token_type?: string;
  expires_in?: number;
};

export type AuthSessionPayload = AuthTokens & {
  user?: User | null;
};

export type Category = {
  id: string;
  slug: string;
  name: string;
  display_order: number;
  icon_key: string | null;
  icon_url: string | null;
  image_url: string | null;
};

export type Subcategory = {
  id: string;
  category_id: string;
  slug: string;
  name: string;
  display_order: number;
};

export type State = {
  id: string;
  slug: string;
  name: string;
  display_order: number;
};

export type Lga = {
  id: string;
  state_id: string;
  slug: string;
  name: string;
  display_order: number;
};

export type DirectoryProfessional = {
  id: string;
  business_name: string;
  service_description: string;
  years_of_experience: number;
  state_id: string;
  state_name: string;
  lga_id: string;
  lga_name: string;
  category_id: string;
  category_name: string;
  subcategory_id: string;
  subcategory_name: string;
  has_premium_listing: boolean;
  is_verified: boolean;
  has_trust_badge: boolean;
  avg_rating: number;
  review_count: number;
  hourly_rate_kobo: number | null;
  daily_rate_kobo: number | null;
  monthly_rate_kobo: number | null;
  is_live_in_available: boolean;
  services?: unknown[];
  gallery?: { id: string; url: string }[];
  cover_image_url?: string | null;
};

export type Pagination = {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
};

export type ProfessionalDetail = DirectoryProfessional & {
  referral_code?: string | null;
  business_address?: string | null;
  full_name?: string | null;
};

export type RegisterRequest = {
  email: string;
  password: string;
  full_name: string;
  user_type: UserType;
  phone?: string | null;
  whatsapp_number?: string | null;
  professional_profile?: ProfessionalCreateRequest | null;
};

export type ProfessionalCreateRequest = {
  business_name: string;
  service_description: string;
  business_address?: string | null;
  years_of_experience: number;
  state_id: string;
  lga_id: string;
  category_id: string;
  subcategory_id: string;
  preferred_featured_plan_slug?: "standard" | "premium-monthly" | "premium-yearly";
  hourly_rate_kobo?: number | null;
  daily_rate_kobo?: number | null;
  monthly_rate_kobo?: number | null;
  is_live_in_available?: boolean;
  referred_by_code?: string | null;
};

export type ProfessionalServiceCreateRequest = {
  service_name: string;
};

export type ProfessionalService = {
  id: string;
  service_name?: string;
  name?: string;
  [key: string]: unknown;
};

export type ProfessionalArrangement = {
  id: string;
  status?: string;
  title?: string;
  customer_name?: string;
  professional_id?: string;
  professional_name?: string;
  business_name?: string;
  service_name?: string;
  service_summary?: string;
  service_description?: string;
  review_interval?: string;
  start_date?: string;
  conversation_id?: string | null;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
};

export type RecurringArrangementCreateRequest = {
  professional_id: string;
  service_summary: string;
  service_description: string;
  review_interval: string;
  start_date: string;
};

export type RecurringArrangementIntervalUpdateRequest = {
  review_interval: string;
};

export type AdSlot = {
  id?: string;
  ad_slot_id?: string;
  page_context?: string | null;
  adsense_slot_id?: string | null;
  is_active?: boolean;
  display_order?: number;
  category_id?: string | null;
  state_id?: string | null;
  [key: string]: unknown;
};

export type ServiceTicketCreateRequest = {
  professional_id: string;
  issue_summary: string;
  issue_description: string;
};

export type ServiceTicket = {
  id: string;
  status?: string;
  issue_summary?: string;
  issue_description?: string;
  professional_id?: string;
  professional_name?: string;
  business_name?: string;
  customer_id?: string;
  customer_name?: string;
  category_name?: string;
  state_name?: string;
  lga_name?: string;
  quote_amount_kobo?: number | null;
  quote_note?: string | null;
  conversation_id?: string | null;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
};

export type Conversation = {
  id: string;
  ticket_id?: string | null;
  arrangement_id?: string | null;
  title?: string | null;
  unread_count?: number;
  last_message?: string | null;
  updated_at?: string;
  [key: string]: unknown;
};

export type ChatMessage = {
  id: string;
  body: string;
  sender_id?: string;
  sender_name?: string;
  sender_type?: string;
  created_at?: string;
  [key: string]: unknown;
};

export type Review = {
  id: string;
  rating?: number;
  comment?: string;
  created_at?: string;
  customer_name?: string;
  [key: string]: unknown;
};

export type InAppNotification = {
  id: string;
  title: string;
  body: string;
  type: string;
  href: string;
  unread: boolean;
  created_at?: string | null;
  raw?: Record<string, unknown>;
};

export type CustomerOnboardingRequest = {
  date_of_birth: string;
  gender: "male" | "female" | "prefer_not_to_say";
  home_state_id: string;
  home_lga_id: string;
};

export type CustomerPreferencesRequest = {
  primary_need?: string | null;
  service_frequency?: string | null;
  discovery_source?: string | null;
  category_interests?: string[];
};

export type RequestDeletionRequest = {
  reason: string;
  note?: string | null;
};

export class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}
