/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { User, Heart, MessageSquare, Sparkles, Clock, Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import { Product, Favorite, Inquiry, Order } from "../types";
import { User as FirebaseUser } from "firebase/auth";
import { collection, query, where, onSnapshot, doc, deleteDoc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { sendOrderCancellationEmail } from "../utils/emailService";

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
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Cancellation States
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [cancellingError, setCancellingError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancelOrder = async (order: Order) => {
    setIsCancelling(true);
    setCancellingError(null);
    try {
      // 1. Update order status to 'cancelled' in Firestore
      const orderRef = doc(db, "orders", order.id);
      await updateDoc(orderRef, {
        status: "cancelled",
      });

      // 2. Load latest product data and restore/increment stock count
      if (order.productId) {
        const productRef = doc(db, "products", order.productId);
        const productSnap = await getDoc(productRef);
        if (productSnap.exists()) {
          const productData = productSnap.data();
          const currentStock = productData.stockCount !== undefined ? Number(productData.stockCount) : 1;
          const nextStock = currentStock + 1;
          const nextIsSoldOut = nextStock <= 0;
          
          await updateDoc(productRef, {
            stockCount: nextStock,
            isSoldOut: nextIsSoldOut,
          });
        }
      }

      // 3. Send email cancellation notification to administrator
      await sendOrderCancellationEmail({
        orderId: order.id,
        productName: order.productName,
        productPrice: order.productPrice,
        recipientName: order.recipientName,
        recipientPhone: order.recipientPhone,
        shippingAddress: order.shippingAddress,
        size: order.size,
        buyerEmail: order.userEmail || user.email || "",
      });

      setCancellingOrderId(null);
    } catch (err: any) {
      console.error("Error cancelling order:", err);
      setCancellingError("주문을 취소하는 과정에서 오류가 발생했습니다: " + (err.message || err));
    } finally {
      setIsCancelling(false);
    }
  };

  // Load orders made by this user
  useEffect(() => {
    const q = query(collection(db, "orders"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: Order[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
          } as Order);
        });
        // Sort newest first
        list.sort((a, b) => new Date(b.createdAt as any).getTime() - new Date(a.createdAt as any).getTime());
        setUserOrders(list);
        setLoadingOrders(false);
      },
      (error) => {
        console.error("Error loading user orders Snap:", error);
        setLoadingOrders(false);
      }
    );

    return () => unsubscribe();
  }, [user.uid]);

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

        <div className="flex space-x-6 sm:space-x-8 items-center text-center">
          <div>
            <span className="block text-2.5xl font-serif text-[#8C624E] font-bold">{favProducts.length}</span>
            <span className="text-[10px] uppercase tracking-widest text-stone-400 font-mono">Wishlist</span>
          </div>
          <div className="w-px h-8 bg-stone-300" />
          <div>
            <span className="block text-2.5xl font-serif text-[#1A3020] font-bold">{userInquiries.length}</span>
            <span className="text-[10px] uppercase tracking-widest text-stone-400 font-mono">Inquiry</span>
          </div>
          <div className="w-px h-8 bg-stone-300" />
          <div>
            <span className="block text-2.5xl font-serif text-amber-700 font-bold">{userOrders.length}</span>
            <span className="text-[10px] uppercase tracking-widest text-stone-400 font-mono font-medium">Orders</span>
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
                      * 테오도르 스태프가 문의 내용을 점검하고 있으며 메일 회신 및 답변 처리를 빠르게 대기 중입니다.
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* 3. Order History Section */}
      <div className="space-y-6 border-t border-stone-200 pt-16">
        <div className="flex items-center space-x-2 pb-1">
          <ShoppingBag className="w-5.5 h-5.5 text-amber-700" />
          <h2 className="text-xl font-serif text-[#2C302E]">My Purchase History (구매 내역)</h2>
        </div>

        {loadingOrders ? (
          <p className="text-xs text-stone-400 animate-pulse">Loading orders...</p>
        ) : userOrders.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-stone-200 rounded-sm bg-[#FAF7F0]/20 space-y-3">
            <ShoppingBag className="w-8 h-8 text-stone-300 mx-auto" />
            <p className="text-xs text-stone-400 font-light">주문 내역이 비어 있습니다. 마음에 드는 셀렉션을 구매해 보세요.</p>
            <button
              onClick={() => setActivePage("Shop")}
              className="px-5 py-2 text-xs uppercase tracking-widest bg-[#2C302E] text-[#FAF7F0] hover:bg-[#8C624E] transition-colors rounded-xs shadow-xs cursor-pointer"
            >
              Go to Theodor Catalog
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userOrders.map((ord) => (
              <div key={ord.id} className="bg-white border border-[#8C624E]/10 rounded-sm hover:border-[#8C624E]/20 transition-all p-5 shadow-xs flex flex-col sm:flex-row gap-5">
                <div 
                  onClick={() => ord.productId && viewProduct(ord.productId)}
                  className="w-24 h-32 bg-stone-50 shrink-0 border border-stone-100 overflow-hidden cursor-pointer h-fit"
                >
                  <img src={ord.productImageUrl} alt={ord.productName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                
                <div className="flex-1 space-y-3 min-w-0">
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="min-w-0">
                      <h3 
                        onClick={() => ord.productId && viewProduct(ord.productId)}
                        className="text-sm font-serif text-[#2C302E] font-semibold truncate cursor-pointer hover:text-[#8C624E]"
                      >
                        {ord.productName}
                      </h3>
                      <p className="text-[10px] text-stone-400 font-mono">
                        Size: {ord.size} &middot; Price: {formattedPrice(ord.productPrice)}
                      </p>
                    </div>

                    <span className={`text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 rounded-sm shrink-0 border ${
                      ord.status === "completed" || ord.status === "delivered"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-250/40"
                        : ord.status === "cancelled"
                        ? "bg-red-50 text-red-600 border-red-250/40"
                        : ord.status === "shipped"
                        ? "bg-blue-50 text-blue-700 border-blue-250/30"
                        : ord.status === "confirmed"
                        ? "bg-indigo-50 text-indigo-700 border-indigo-250/30"
                        : "bg-amber-50 text-amber-700 border-amber-250/40 animate-pulse"
                    }`}>
                      {ord.status === "completed" 
                        ? "Completed" 
                        : ord.status === "cancelled" 
                        ? "Cancelled" 
                        : ord.status === "confirmed"
                        ? "Confirmed / 입금확인"
                        : ord.status === "shipped"
                        ? "Shipped / 배송중"
                        : ord.status === "delivered"
                        ? "Delivered / 배송완료"
                        : "Pending / 입금대기"}
                    </span>
                  </div>

                  <div className="border-t border-stone-100 pt-2.5 space-y-1 text-[11px] text-stone-600 font-sans">
                    <div className="flex justify-between">
                      <span className="text-stone-400">Order ID:</span>
                      <span className="font-mono text-stone-550 font-light select-all">{ord.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Recipient (수령인):</span>
                      <span className="font-medium text-stone-700">{ord.recipientName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Phone (연락처):</span>
                      <span className="text-stone-600 font-mono">{ord.recipientPhone}</span>
                    </div>
                    <div className="flex flex-col pt-1">
                      <span className="text-stone-400">Address (배송지 주소):</span>
                      <span className="text-stone-700 leading-relaxed font-light mt-0.5">{ord.shippingAddress}</span>
                    </div>
                  </div>

                  <div className="text-[10px] text-stone-400 font-mono flex items-center pt-1">
                    <Clock className="w-3 h-3 mr-1" />
                    <span>Order Date: {new Date(ord.createdAt as any).toLocaleDateString()} {new Date(ord.createdAt as any).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>

                  {/* Cancel Order Section */}
                  {ord.status !== "cancelled" ? (
                    <div className="border-t border-dashed border-stone-100 pt-3 flex flex-col gap-2">
                      {cancellingOrderId === ord.id ? (
                        <div className="bg-red-50/50 p-3 rounded-xs border border-red-100/60 text-xs space-y-2 font-sans">
                          <p className="font-medium text-red-800">
                            정말 이 주문을 취소하시겠습니까?<br/>
                            <span className="text-[10px] text-stone-500 font-normal block mt-1">* 취소 시 아카이브 개별 상품의 재고가 복구되고, 관리자에게 즉시 취소 알림이 이메일로 전송됩니다.</span>
                          </p>
                          {cancellingError && (
                            <p className="text-[10px] text-red-650 font-bold">{cancellingError}</p>
                          )}
                          <div className="flex space-x-2 pt-1">
                            <button
                              disabled={isCancelling}
                              onClick={() => handleCancelOrder(ord)}
                              className="px-3 py-1.5 text-[11px] font-medium bg-red-650 hover:bg-red-700 text-white rounded-xs transition-colors disabled:opacity-50 cursor-pointer"
                            >
                              {isCancelling ? "취소 중..." : "예, 주문 취소"}
                            </button>
                            <button
                              disabled={isCancelling}
                              onClick={() => {
                                setCancellingOrderId(null);
                                setCancellingError(null);
                              }}
                              className="px-3 py-1.5 text-[11px] font-medium bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xs transition-colors disabled:opacity-50 cursor-pointer"
                            >
                              돌아가기
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => {
                              setCancellingOrderId(ord.id);
                              setCancellingError(null);
                            }}
                            className="px-3 py-1.5 text-[11px] font-serif border border-red-100 hover:bg-red-50 hover:text-red-700 text-red-600 rounded-xs transition-all cursor-pointer"
                          >
                            주문 신청 취소 (Cancel Order)
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="border-t border-dashed border-stone-100 pt-3">
                      <p className="text-[10px] text-red-500/80 italic font-medium font-sans">
                        * 본 상품 주문은 정상 취소 및 재고가 회수 처리되었습니다.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
