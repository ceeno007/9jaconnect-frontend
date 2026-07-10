export type Professional = {
  id: string;
  name: string;
  tradeName: string;
  /** Real cover from API only. Null when the backend has no image. */
  coverImage: string | null;
  galleryImages: string[];
  category: string;
  state: string;
  lga: string;
  rating: number;
  reviews: number;
  hourlyRate: number;
  dayRate: number;
  projectRate: number;
  verified: boolean;
  years: number;
  description: string;
  services: string[];
};
