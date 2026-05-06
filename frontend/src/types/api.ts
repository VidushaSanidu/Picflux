export type User = { id: string; email: string; role: "user" | "admin" };

export type PublicImage = {
  id: string;
  title: string | null;
  location: string | null;
  tags: string[];
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
  thumbnailUrl: string | null;
  featured: boolean;
  uploader: { id: string; email: string };
};

export type ImageDetail = PublicImage & {
  approvedAt: string;
  viewUrl: string;
  featured: boolean;
};

export type ImagesListResponse = {
  data: PublicImage[];
  pagination: { total: number; page: number; limit: number; pages: number };
  topTags: string[];
};

export type MyImage = {
  id: string;
  storageKey: string;
  status: "Pending" | "Approved" | "Rejected";
  title: string | null;
  location: string | null;
  tags: string[];
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
  rejectionReason: string | null;
};

export type ApiKey = { id: string; keyPrefix: string; createdAt: string };

export type NewApiKey = ApiKey & { message: string; key: string };

export type PendingImage = {
  id: string;
  title: string | null;
  tags: string[];
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
  uploader: { id: string; email: string };
};

export type PendingImageDetail = PendingImage & {
  location: string | null;
  previewUrl: string;
};
