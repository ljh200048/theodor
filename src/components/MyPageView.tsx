/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { User, Heart, MessageSquare, Sparkles, Clock, Trash2, ArrowRight } from "lucide-react";
import { Product, Favorite, Inquiry } from "../types";
import { User as FirebaseUser } from "firebase/auth";
import { collection, query, where, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";

interface MyPageProps {
  user: FirebaseUser;
  products: Product[];
  favorites: Favorite[];
  toggleFavorite: (id: string) => Promise<void>;
  setActivePage: (p: any) => void;
  setDetailedProductId: (id: string | null) => void;
}

export default function MyPageView({
  user,
  products,
  favorites,
  toggleFavorite,
  setActivePage,
  setDetailedProductId,
}: MyPageProps) {
  const [userInquiries, setUserInquiries] = useState<Inquiry[]>([]);
  const [loadingInquiries, setLoadingInquiries] = useState(true);

  // Load inquiries sent by this user
  useEffect(() => {
    const q = query(collection(db, "inquiries"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: Inquiry[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
          } as Inquiry);
        });
        // Sort newest first
        list.sort((a, b) => new Date(b.createdAt as any).getTime() - new Date(a.createdAt as any).getTime());
        setUserInquiries(list);
        setLoadingInquiries(false);
      },
      (error) => {
        console.error("Error loading user inquiries Snap:", error);
        setLoadingInquiries(false);
      }
    );

    return () => unsubscribe();
  }, [user.uid]);

  // Map favorited products
  const favProducts = products.filter((p) => favorites.some((f) => f.productId === p.id));

  const viewProduct = (id: string) => {
    setDetailedProductId(id);
    setActivePage("ProductDetail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const formattedPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW" }).format(price);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Profile summary metadata */}
      <div className="bg-[#FAF7F0] border border-[#8C624E]/10 p-8 sm:p-10 rounded-xs flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-[#2D4236] text-[#FAF7F0] rounded-full flex items-center justify-center shadow-xs">
            <User className="w-8 h-8" />
          </div>
          <div className="space-y-1 text-center md:text-left">
            <h1 className="text-2xl font-serif text-[#2C302E]">Welcome, {user.displayName || "Vintage Guest"}</h1>
            <p className="text-xs text-stone-400 font-mono tracking-wide">{user.email}</p>
          </div>
        </div>

        <div className="flex space-x-8 items-center text-center">
          <div>
            <span className="block text-2xl font-serif text-[#8C624E] font-bold">{favProducts.length}</span>
            <span className="text-[10px] uppercase tracking-widest text-stone-400 font-mono">Wishlist Count</span>
          </div>
          <div className="w-px h-8 bg-stone-300" />
          <div>
            <span className="block text-2xl font-serif text-[#1A3020] font-bold">{userInquiries.length}</span>
            <span className="text-[10px] uppercase tracking-widest text-stone-400 font-mono">Inquiry Count</span>
          </div>
        </div>
      </div>

      {/* Two Columns: Wishlist and Inquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        {/* Wishlist Left Column */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2 border-b border-stone-200 pb-3">
            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
            <h2 className="text-xl font-serif text-[#2C302E]">My Curated Wishlist (찜 목록)</h2>
          </div>

          {favProducts.length === 0 ? (
            <div className="text-center py-20 border border-stone-100 rounded-xs bg-[#FAF7F0]/40 space-y-4">
              <Sparkles className="w-6 h-6 text-stone-300 mx-auto" />
              <p className="text-xs text-stone-400 font-light">Your wishlist is currently empty.</p>
              <button
                onClick={() => setActivePage("Shop")}
                className="text-xs uppercase tracking-widest text-[#8C624E] border-b border-[#8C624E]"
              >
                Go curate items
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {favProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center bg-[#FDFBF7] p-4 border border-[#8C624E]/5 hover:border-[#8C624E]/15 rounded-sm justify-between transition-colors shadow-2xs gap-4"
                >
                  <div
                    onClick={() => viewProduct(p.id)}
                    className="flex items-center space-x-4 cursor-pointer flex-1 min-w-0"
                  >
                    <div className="w-16 h-20 bg-stone-100 shrink-0 border border-[#FAF7F0] overflow-hidden">
                      <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <h3 className="text-sm font-serif text-[#2C302E] truncate font-medium leading-tight">
                        {p.name}
                      </h3>
                      <p className="text-xs text-stone-400 font-mono">
                        Size {p.size} &middot; {p.category}
                      </p>
                      <p className="text-xs text-[#8C624E] font-semibold">
                        {formattedPrice(p.price)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    {p.isSoldOut && (
                      <span className="text-[10px] font-mono uppercase bg-stone-200 text-stone-500 px-2 py-0.5 rounded-sm">
                        Sold Out
                      </span>
                    )}
                    <button
                      onClick={() => toggleFavorite(p.id)}
                      className="text-stone-300 hover:text-red-500 p-2 border border-transparent hover:border-red-100/50 hover:bg-red-50 rounded-full transition-all focus:outline-hidden"
                      title="찜 해제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Inquiries Right Column */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2 border-b border-stone-200 pb-3">
            <MessageSquare className="w-5 h-5 text-[#8C624E]" />
            <h2 className="text-xl font-serif text-[#2C302E]">My Direct Inquiries (문의 아카이브)</h2>
          </div>

          {loadingInquiries ? (
            <p className="text-xs text-stone-400 leading-6 animate-pulse">Loading sent queries...</p>
          ) : userInquiries.length === 0 ? (
            <div className="text-center py-20 border border-stone-100 rounded-xs bg-[#FAF7F0]/40 space-y-3">
              <MessageSquare className="w-6 h-6 text-stone-300 mx-auto" />
              <p className="text-xs text-stone-400 font-light">No direct inquiries submitted yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {userInquiries.map((inq) => (
                <div key={inq.id} className="bg-[#FAF7F0]/60 p-5 sm:p-6 border border-[#8C624E]/5 rounded-sm space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      {inq.productName && (
                        <span className="inline-block text-[9px] uppercase tracking-widest bg-stone-200 text-stone-600 px-2 py-0.5 rounded-xs font-mono">
                          linked product: {inq.productName}
                        </span>
                      )}
                      <h3 className="text-sm font-semibold text-[#2C302E] leading-snug">{inq.title}</h3>
                      <p className="text-[10px] text-stone-400 font-mono flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(inq.createdAt as any).toLocaleDateString()}
                      </p>
                    </div>

                    <span
                      className={`text-[9px] font-mono tracking-widest uppercase px-2 py-0.5 rounded-sm ${
                        inq.reply
                          ? "bg-emerald-100/60 text-emerald-700 border border-emerald-200/50"
                          : "bg-amber-100/60 text-amber-700 border border-amber-200/50"
                      }`}
                    >
                      {inq.reply ? "Replied" : "Awaiting Info"}
                    </span>
                  </div>

                  <p className="text-xs text-stone-600 font-light whitespace-pre-line leading-relaxed bg-white/50 p-3 border border-stone-200/30 rounded-xs">
                    {inq.message}
                  </p>

                  {/* Admin Reply Thread */}
                  {inq.reply ? (
                    <div className="bg-[#2D4236]/5 border border-[#2D4236]/15 p-4 rounded-xs text-xs space-y-2">
                      <p className="font-semibold text-[#1A3020] uppercase font-mono tracking-wide flex items-center space-x-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Theodor Vintage Staff Reply:</span>
                      </p>
                      <p className="text-stone-600 leading-relaxed font-light whitespace-pre-line pl-1 border-l-2 border-[#1A3020]/25">
                        {inq.reply}
                      </p>
                    </div>
                  ) : (
                    <p className="text-[10px] text-stone-400 italic pl-1 font-sans">
                      * 디오도어 스태프가 문의 내용을 점검하고 있으며 메일 회신 및 답변 처리를 빠르게 대기 중입니다.
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
