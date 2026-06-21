/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Timestamp } from "firebase/firestore";

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  size: string;
  condition: string;
  description: string;
  imageUrl: string;
  isSoldOut: boolean;
  isRecommended: boolean;
  stockCount?: number;
  createdAt: Timestamp | Date;
  detailDescription?: string;
  measurements?: string;
  material?: string;
  shippingInfo?: string;
  notice?: string;
  detailImageUrls?: string[];
}

export interface SiteSetting {
  heroImageUrl: string;
  noticeTitle: string;
  noticeText: string;
  instagramUrl: string;
  contactUrl: string;
  eventTitle?: string;
  eventText?: string;
  eventLink?: string;
  eventBadge?: string;
  isEventActive?: boolean;
  eventImageUrl?: string;
}

export interface Favorite {
  id: string; // userId_productId
  userId: string;
  productId: string;
  createdAt: Timestamp | Date;
}

export interface Inquiry {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  productId?: string;
  productName?: string;
  title: string;
  message: string;
  createdAt: Timestamp | Date;
  reply?: string;
}

export type ActivePage =
  | "Home"
  | "Shop"
  | "ProductDetail"
  | "Notice"
  | "About"
  | "Login"
  | "Signup"
  | "MyPage"
  | "Admin"
  | "Cart"
  | "Privacy"
  | "Terms";

export interface MoodCard {
  id: string;
  title: string;
  tags: string;
  imageUrl: string;
  linkUrl: string;
  order: number;
  isActive: boolean;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export interface EventApplication {
  id?: string;
  userId: string;
  userEmail: string;
  name: string;
  phone: string;
  size: string;
  eventTitle: string;
  createdAt: Timestamp | Date;
}

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  productId: string;
  productName: string;
  productPrice: number;
  productImageUrl: string;
  recipientName: string;
  recipientPhone: string;
  shippingAddress: string;
  size: string;
  status: "pending" | "completed" | "cancelled";
  createdAt: Timestamp | Date;
}

