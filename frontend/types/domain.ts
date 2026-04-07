export const roleValues = ["CUSTOMER", "ADMIN"] as const;
export const orderStatusValues = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;
export const paymentMethodValues = ["PIX", "CREDIT_CARD", "BANK_SLIP"] as const;

export type Role = (typeof roleValues)[number];
export type OrderStatus = (typeof orderStatusValues)[number];
export type PaymentMethod = (typeof paymentMethodValues)[number];

export type ProductSortOption =
  | "relevance"
  | "price-asc"
  | "price-desc"
  | "name-asc"
  | "name-desc";

export interface CatalogFilters {
  query?: string;
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: ProductSortOption;
}

export interface CatalogProductCard {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceInCents: number;
  stock: number;
  featured: boolean;
  imageUrl: string;
  categoryName: string;
  categorySlug: string;
}

export interface CatalogCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  productCount?: number;
}

export interface CartLineItem {
  productId: string;
  slug: string;
  name: string;
  imageUrl: string;
  categoryName: string;
  quantity: number;
  stock: number;
  unitPriceInCents: number;
  totalInCents: number;
}

export interface CartSummary {
  items: CartLineItem[];
  itemCount: number;
  subtotalInCents: number;
  totalInCents: number;
}

export interface AddressInput {
  recipientName?: string | null;
  line1?: string | null;
  line2?: string | null;
  district?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
}

export interface CheckoutInput extends AddressInput {
  fullName: string;
  phone?: string | null;
  documentValue?: string | null;
  paymentMethod: PaymentMethod;
}

export interface ProfileInput extends AddressInput {
  fullName: string;
  email: string;
  phone?: string | null;
  documentValue?: string | null;
}

export interface SessionUser {
  id: string;
  fullName: string;
  email: string;
  role: Role;
}

export interface OrderListItem {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalInCents: number;
  createdAt: Date;
  itemCount: number;
}

export interface DashboardMetrics {
  totalUsers: number;
  totalOrders: number;
  totalRevenueInCents: number;
  lowStockProducts: number;
}

export interface CategoryFormInput {
  id?: string;
  name: string;
  slug?: string;
  description: string;
  imageUrl: string;
}

export interface ProductFormInput {
  id?: string;
  name: string;
  slug?: string;
  description: string;
  priceInCents: number;
  stock: number;
  featured: boolean;
  active: boolean;
  imageUrl: string;
  categoryId: string;
}
