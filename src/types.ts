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
  createdAt: Timestamp | Date;
}

export interface SiteSetting {
  heroImageUrl: string;
  noticeTitle: string;
  noticeText: string;
  instagramUrl: string;
  contactUrl: string;
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
  | "Admin";
