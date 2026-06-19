export type DropStatus = "upcoming" | "live" | "ended" | "sold_out";

export interface Drop {
  dropId: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  imageUrl: string;
  totalStock: number;
  remainingStock: number;
  startTime: string;
  status: DropStatus;
  createdAt: string;
}

export interface Claim {
  dropId: string;
  userId: string;
  claimedAt: string;
  status: "confirmed";
}

export interface ClaimResult {
  success: boolean;
  message: string;
  remainingStock?: number;
}