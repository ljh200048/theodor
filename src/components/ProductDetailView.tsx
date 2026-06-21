/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Heart, 
  ShieldCheck, 
  Truck, 
  Sparkles, 
  MessageSquare, 
  AlertCircle, 
  Instagram,
  FileText,
  BadgeAlert,
  Info,
  Check,
  Clock
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ActivePage, Product, SiteSetting } from "../types";
import { User } from "firebase/auth";
import { collection, doc, setDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { sendOrderEmails } from "../utils/emailService";

interface ProductDetailProps {
  product: Product;
  user: User | null;
  isFavorited: boolean;
  toggleFavorite: (productId: string) => Promise<void>;
  onBack: () => void;
  settings: SiteSetting | null;
  setActivePage: (p: ActivePage) => void;
  triggerLoginRedirect?: (page: ActivePage, prodId?: string | null, notice?: string) => void;
}

export default function ProductDetailView({
  product,
  user,
  isFavorited,
  toggleFavorite,
  onBack,
  settings,
  setActivePage,
  triggerLoginRedirect,
}: ProductDetailProps) {
  const [liveProduct, setLiveProduct] = useState<Product>(product);
  const [activeImage, setActiveImage] = useState(product.imageUrl);
  const [inquiryTitle, setInquiryTitle] = useState("");
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [userName, setUserName] = useState(user?.displayName || "");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  // Order & Purchase Modal States
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [recipientName, setRecipientName] = useState(user?.displayName || "");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [ordering, setOrdering] = useState(false);
  const [orderErr, setOrderErr] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [lastOrderId, setLastOrderId] = useState("");

  // Sync recipient name if user logins in later
  useEffect(() => {
    if (user && !recipientName) {
      setRecipientName(user.displayName || "");
    }
  }, [user]);

  // Sizing choice states
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState("");

  // Keep liveProduct updated with the live Firestore document
  useEffect(() => {
    setLiveProduct(product);
    setActiveImage(product.imageUrl);
    setSelectedSize(null);
    setSizeError("");
  }, [product]);

  useEffect(() => {
    const docRef = doc(db, "products", product.id);
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setLiveProduct({
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
          } as Product);
        }
      },
      (error) => {
        console.error("Error loaded live product detail stream:", error);
      }
    );
    return () => unsubscribe();
  }, [product.id]);

  // Sync active image with product main image on change
  useEffect(() => {
    setActiveImage(liveProduct.imageUrl);
  }, [liveProduct.imageUrl]);

  const formattedPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW" }).format(price);
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setErr("로그인이 필요한 서비스입니다.");
      return;
    }
    if (!inquiryTitle.trim() || !inquiryMessage.trim() || !userName.trim()) {
      setErr("모든 입력란을 작성해 주세요.");
      return;
    }

    setSubmitting(true);
    setErr("");
    const path = "inquiries";

    try {
      // Create unique ID based on user and time
      const inquiryId = `inquiry_${user.uid}_${Date.now()}`;
      const inquiryRef = doc(db, path, inquiryId);

      await setDoc(inquiryRef, {
        userId: user.uid,
        userEmail: user.email || "",
        userName: userName,
        productId: liveProduct.id,
        productName: liveProduct.name,
        title: inquiryTitle,
        message: inquiryMessage,
        createdAt: serverTimestamp(),
      });

      setInquiryTitle("");
      setInquiryMessage("");
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOrderClick = () => {
    const isSizeSelectionCategory = ["tops", "dresses", "outerwear"].includes(liveProduct.category.toLowerCase());
    const isShoesCategory = liveProduct.category.toLowerCase() === "shoes";

    if (isSizeSelectionCategory && !selectedSize) {
      setSizeError("구매 진행을 위해 S / M / L 중 원하시는 옷의 사이즈를 선택해 주세요.");
      return;
    }
    if (isShoesCategory && (!selectedSize || !selectedSize.trim())) {
      setSizeError("구매 진행을 위해 원하시는 신발 사이즈(예: 240, 270 등)를 입력해 주세요.");
      return;
    }

    if (!user) {
      if (triggerLoginRedirect) {
        triggerLoginRedirect(
          "ProductDetail",
          liveProduct.id,
          "해당 빈티지 피스를 안전하게 구매/선점(배달 수령 정보 등록)하시려면 회원 로그인이 필요합니다. 로그인 완료 후 즉시 이 화면으로 소급 복귀합니다."
        );
      } else {
        setActivePage("Login");
      }
      return;
    }
    // Open Checkout Dialog Modal
    setShowOrderModal(true);
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!recipientName.trim()) {
      setOrderErr("수령인 성함을 입력해주세요.");
      return;
    }
    if (!recipientPhone.trim()) {
      setOrderErr("연락 업데이트를 위한 전화번호를 입력해주세요.");
      return;
    }
    if (!shippingAddress.trim()) {
      setOrderErr("우편 수령 배송지 주소를 정확히 기재해 주세요.");
      return;
    }

    setOrdering(true);
    setOrderErr("");

    try {
      const orderId = "order_" + user.uid + "_" + Date.now();

      // Double-check real-time product state as extra failure protection
      if (liveProduct.isSoldOut) {
        throw new Error("죄송합니다. 이 단 하나의 빈티지 제품은 방금 전 다른 구매자에 의해 품절 소화되었습니다.");
      }

      // 1. Create order document in orders collection
      const isSizeSelectionCategory = ["tops", "dresses", "outerwear"].includes(liveProduct.category.toLowerCase());
      const isShoesCategory = liveProduct.category.toLowerCase() === "shoes";
      const chosenSize = ((isSizeSelectionCategory || isShoesCategory) && selectedSize) ? selectedSize : liveProduct.size;
      
      const orderData = {
        userId: user.uid,
        userEmail: user.email || "guest",
        buyerName: recipientName.trim(),
        buyerEmail: user.email || "guest",
        buyerPhone: recipientPhone.trim(),
        productId: liveProduct.id,
        productName: liveProduct.name,
        productPrice: liveProduct.price,
        productImageUrl: liveProduct.imageUrl,
        recipientName: recipientName.trim(),
        recipientPhone: recipientPhone.trim(),
        shippingAddress: shippingAddress.trim(),
        size: chosenSize,
        status: "pending",
        createdAt: serverTimestamp(),
      };

      await setDoc(doc(db, "orders", orderId), orderData);

      // 2. Transitionally decrement stock Count and set soldOut flag if stock is 0 (Reserved)
      const currentStock = liveProduct.stockCount !== undefined ? liveProduct.stockCount : 1;
      const newStock = Math.max(0, currentStock - 1);
      const nextIsSoldOut = newStock <= 0;

      const rawProductRef = doc(db, "products", liveProduct.id);
      await setDoc(rawProductRef, {
        ...liveProduct,
        createdAt: liveProduct.createdAt instanceof Date ? liveProduct.createdAt : (liveProduct.createdAt as any).toDate ? (liveProduct.createdAt as any).toDate() : new Date(),
        stockCount: newStock,
        isSoldOut: nextIsSoldOut
      });

      // 3. Send manual order/application confirmation emails
      try {
        await sendOrderEmails({
          orderId,
          productName: liveProduct.name,
          productPrice: liveProduct.price,
          recipientName: recipientName.trim(),
          recipientPhone: recipientPhone.trim(),
          shippingAddress: shippingAddress.trim(),
          size: chosenSize,
          buyerEmail: user.email || "guest",
        });
      } catch (errEmail) {
        console.error("Failed to send automatic order emails:", errEmail);
      }

      setLastOrderId(orderId);
      setOrderSuccess(true);
    } catch (error: any) {
      console.error("Order submission failed:", error);
      const friendlyMsg = handleFirestoreError(error, OperationType.WRITE, "orders");
      setOrderErr(friendlyMsg || error.message || "주문 진행 중 이상이 발견되었습니다.");
    } finally {
      setOrdering(false);
    }
  };

  const instagram = settings?.instagramUrl || "https://instagram.com/theodor_vintage";
  const allImages = [liveProduct.imageUrl, ...( (liveProduct as any).detailImageUrls || [] )].filter(Boolean);
  const isSizeSelectionCategory = ["tops", "dresses", "outerwear"].includes(liveProduct.category.toLowerCase());
  const isShoesCategory = liveProduct.category.toLowerCase() === "shoes";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Back Button */}
      <button
        onClick={onBack}
        className="inline-flex items-center space-x-2 text-xs tracking-widest uppercase text-stone-500 hover:text-[#8C624E] mb-10 transition-colors focus:outline-hidden"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Catalog</span>
      </button>

      {/* Main product representation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
        
        {/* Left Side: Crisp Image Card + Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-3/4 overflow-hidden bg-stone-100 border border-[#FAF7F0] shadow-xs">
            <img
              src={activeImage}
              alt={liveProduct.name}
              className="w-full h-full object-cover transition-all duration-300"
              referrerPolicy="no-referrer"
            />

            {liveProduct.isSoldOut && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white border border-white px-6 py-2.5 text-sm tracking-widest uppercase font-mono bg-stone-900/40 backdrop-blur-xs">
                  SOLD OUT COLLECTION
                </span>
              </div>
            )}

            {liveProduct.isRecommended && !liveProduct.isSoldOut && (
              <div className="absolute top-4 left-4 bg-[#1A3020] text-white px-3 py-1.5 text-xs tracking-widest uppercase flex items-center space-x-1.5 font-mono">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Recommended Pick</span>
              </div>
            )}
          </div>

          {/* Interactive Thumbnails Gallery */}
          {allImages.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`aspect-square overflow-hidden border rounded-xs transition-all relative ${
                    activeImage === img 
                      ? "border-[#8C624E] ring-1 ring-[#8C624E]" 
                      : "border-stone-200 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Specifications and descriptions */}
        <div className="space-y-8">
          
          {/* Header metadata */}
          <div className="space-y-3.5 border-b border-stone-200 pb-6">
            <div className="flex justify-between items-center text-xs tracking-widest uppercase text-stone-400 font-mono">
              <span className="bg-stone-100 text-stone-600 px-2 py-0.5 rounded-sm">{liveProduct.category}</span>
              <span>Condition: {liveProduct.condition?.split(":")[0] || "Unknown"}</span>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-1">
              <h1 className="text-3xl sm:text-4xl font-serif text-[#2C302E] leading-tight font-medium">
                {liveProduct.name}
              </h1>
              {liveProduct.isSoldOut && (
                <span className="inline-block shrink-0 bg-red-100 text-red-800 text-xs px-2.5 py-1 rounded-sm uppercase tracking-widest font-mono font-bold border border-red-200 w-fit">
                  SOLD OUT
                </span>
              )}
            </div>

            <p className="text-2xl font-serif text-[#8C624E] font-semibold pt-1">
              {formattedPrice(liveProduct.price)}
            </p>
          </div>

          {/* Details / Specifications Quick List */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-[#FAF7F0] p-6 border border-[#8C624E]/5 rounded-xs font-sans">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#2C302E]/40 block mb-1 font-mono">Tagged Size</span>
              <span className="text-sm font-medium text-[#2C302E]">{liveProduct.size}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#2C302E]/40 block mb-1 font-mono">Condition Rating</span>
              <span className="text-sm font-medium text-[#1A3020]">{liveProduct.condition}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#2C302E]/40 block mb-1 font-mono">Stock / 남은 수량</span>
              {liveProduct.isSoldOut || (liveProduct.stockCount !== undefined && liveProduct.stockCount <= 0) ? (
                <span className="text-sm font-bold text-red-600">0개 (종료)</span>
              ) : (
                <span className="text-sm font-bold text-emerald-800 animate-pulse">
                  {liveProduct.stockCount !== undefined ? `${liveProduct.stockCount}개 남음` : "1개 남음"}
                </span>
              )}
            </div>
            { (liveProduct as any).material && (
              <div className="col-span-2 sm:col-span-1">
                <span className="text-[10px] uppercase tracking-widest text-[#2C302E]/40 block mb-1 font-mono">Material</span>
                <span className="text-sm font-medium text-[#2C302E]">{(liveProduct as any).material}</span>
              </div>
            )}
          </div>

          {/* Descriptions Text */}
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-xs uppercase tracking-widest text-[#8C624E] font-bold font-mono">Product Story</h4>
              <p className="text-stone-700 text-sm font-light leading-relaxed whitespace-pre-line">
                {liveProduct.description}
              </p>
            </div>

            {/* Optional detailed description */}
            { (liveProduct as any).detailDescription && (
              <div className="space-y-2 border-t border-stone-100 pt-4">
                <h4 className="text-xs uppercase tracking-widest text-[#8C624E] font-bold font-mono">상세 설명</h4>
                <p className="text-stone-700 text-sm font-light leading-relaxed whitespace-pre-line">
                  {(liveProduct as any).detailDescription}
                </p>
              </div>
            )}

            {/* Optional Measurements description */}
            { (liveProduct as any).measurements && (
              <div className="space-y-2 border-t border-stone-100 pt-4">
                <h4 className="text-xs uppercase tracking-widest text-[#8C624E] font-bold font-mono">실측 사이즈</h4>
                <div className="bg-stone-50 p-4 border border-stone-200/80 rounded-xs text-stone-700 text-xs font-mono leading-relaxed whitespace-pre-line">
                  {(liveProduct as any).measurements}
                </div>
              </div>
            )}
          </div>

          {/* Shipping & Notice Policies representation */}
          <div className="space-y-3.5 border-t border-stone-100 pt-6">
            <div className="flex items-start space-x-3 text-xs text-stone-500 font-light">
              <Truck className="w-4 h-4 text-[#8C624E] shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-[#2C302E] block">배송 안내</span>
                <span>{(liveProduct as any).shippingInfo || "전국 무료 배송 · 결제 완료 후 1-3일 소요 (우체국 택배)"}</span>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 text-xs text-stone-500 font-light">
              <ShieldCheck className="w-4 h-4 text-[#1A3020] shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-[#2C302E] block">구매 전 안내</span>
                <span>{(liveProduct as any).notice || "모든 아카이브 빈티지 제품들은 세탁 및 특수 스팀 고온 소독이 완료된 제품입니다."}</span>
              </div>
            </div>
          </div>

          {/* Size Choice Component if category matches */}
          {isSizeSelectionCategory && (
            <div className="space-y-3 pt-5 border-t border-stone-200">
              <div className="flex items-center justify-between pb-1">
                <label className="text-[11px] uppercase tracking-widest text-[#8C624E] block font-mono font-bold">
                  Select Size (사이즈 선택) <span className="text-red-500">*</span>
                </label>
                {selectedSize && (
                  <span className="text-xs text-[#1A3020] font-medium bg-[#FAF7F0] px-2 py-0.5 rounded-sm border border-[#1A3020]/10 font-mono">
                    Size {selectedSize} Selected
                  </span>
                )}
              </div>
              <div className="flex gap-3">
                {["S", "M", "L"].map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => {
                      setSelectedSize(sz);
                      setSizeError("");
                    }}
                    className={`flex-1 text-center py-4 text-xs font-bold uppercase tracking-widest rounded-xs border transition-all duration-200 cursor-pointer ${
                      selectedSize === sz
                        ? "bg-[#2C302E] border-[#2C302E] text-[#FAF7F0] font-serif shadow-md hover:brightness-105 scale-[1.01]"
                        : "bg-white border-stone-300 text-stone-600 hover:border-[#8C624E]/80 hover:text-[#8C624E] font-serif hover:bg-[#FAF7F0]/30"
                    }`}
                  >
                    Size {sz}
                  </button>
                ))}
              </div>
              {sizeError ? (
                <p className="text-xs text-red-650 font-medium font-sans mt-2 flex items-center space-x-1 animate-pulse">
                  <span>* {sizeError}</span>
                </p>
              ) : (
                <p className="text-[11px] text-stone-400 font-light leading-relaxed">
                  * 본 카테고리는 S / M / L 중 원하시는 맞춤 사이즈 선택 완료 후에 구매(Order Now)가 가능합니다.
                </p>
              )}
            </div>
          )}

          {/* Shoe Size Input Component if category is shoes */}
          {isShoesCategory && (
            <div className="space-y-3 pt-5 border-t border-stone-200">
              <div className="flex items-center justify-between pb-1">
                <label className="text-[11px] uppercase tracking-widest text-[#8C624E] block font-mono font-bold">
                  Shoe Size (신발 사이즈 입력) <span className="text-red-500">*</span>
                </label>
                {selectedSize && selectedSize.trim() && (
                  <span className="text-xs text-[#1A3020] font-medium bg-[#FAF7F0] px-2 py-0.5 rounded-sm border border-[#1A3020]/10 font-mono">
                    Size {selectedSize} Entered
                  </span>
                )}
              </div>
              <div>
                <input
                  type="text"
                  value={selectedSize || ""}
                  onChange={(e) => {
                    setSelectedSize(e.target.value);
                    setSizeError("");
                  }}
                  className="w-full bg-[#FAF7F0]/60 border border-[#8C624E]/20 hover:border-[#8C624E]/50 focus:border-[#8C624E] rounded-xs py-3 px-4 text-xs font-serif focus:outline-hidden transition-all text-stone-800 placeholder-stone-400"
                  placeholder="예: 240, 260 (원하시는 사이즈를 직접 입력해주세요)"
                />
              </div>
              {sizeError ? (
                <p className="text-xs text-red-650 font-medium font-sans mt-2 flex items-center space-x-1 animate-pulse">
                  <span>* {sizeError}</span>
                </p>
              ) : (
                <p className="text-[11px] text-stone-400 font-light leading-relaxed">
                  * 슈즈(Shoes) 제품군은 원하시는 맞춤 신발 사이즈 입력 완료 후에 구매(Order Now)가 가능합니다.
                </p>
              )}
            </div>
          )}

          {/* Interactive Actions Panel */}
          <div className="flex flex-col gap-4 pt-4 border-t border-stone-200">
            
            <div className="flex items-stretch gap-4">
              {/* Wishlist toggle */}
              <button
                onClick={() => toggleFavorite(liveProduct.id)}
                className={`flex items-center justify-center p-4.5 border rounded-xs transition-colors shrink-0 focus:outline-hidden ${
                  isFavorited
                    ? "bg-red-50 border-red-200 text-red-500"
                    : "border-stone-300 text-stone-400 hover:text-red-500 hover:border-red-200"
                }`}
                id="like-button"
              >
                <Heart className="w-5.5 h-5.5" fill={isFavorited ? "currentColor" : "none"} />
              </button>

              {/* Purchase Trigger Button */}
              {liveProduct.isSoldOut ? (
                <button
                  disabled
                  className="flex-1 text-center bg-stone-100 text-stone-400 border border-stone-200 py-4.5 text-xs font-semibold uppercase tracking-widest rounded-xs cursor-not-allowed"
                >
                  품절된 상품 (SOLD OUT)
                </button>
              ) : (
                <button
                  onClick={handleOrderClick}
                  className="flex-1 text-center bg-[#8C624E] hover:bg-[#754f3d] text-white py-4.5 px-6 text-xs sm:text-sm font-bold uppercase tracking-widest transition-all duration-200 block rounded-xs shadow-md hover:shadow-lg hover:brightness-105 active:scale-98 cursor-pointer font-serif"
                >
                  구매하기 (Order Now)
                </button>
              )}
            </div>

          </div>

          {!user && (
            <div className="text-xs text-stone-600 bg-stone-50 border border-stone-200 p-3.5 rounded-xs flex items-start space-x-2">
              <Info className="w-4 h-4 text-[#8C624E] shrink-0 mt-0.5" />
              <span>로그인 시 위시리스트 저장 및 상세 제품에 대한 문의 작성이 활성화됩니다.</span>
            </div>
          )}

        </div>

      </div>

      {/* Mandatory Vintage disclaimer notice section at bottom */}
      <div className="mt-16 bg-stone-50 border border-stone-200/60 p-6 rounded-xs text-center max-w-4xl mx-auto">
        <p className="text-xs text-stone-600 leading-relaxed font-serif">
          “빈티지 상품 특성상 미세한 사용감이 있을 수 있습니다. 실측 사이즈 확인 후 구매를 권장드립니다.”
        </p>
      </div>

      {/* 4. Product Specific Inquiry Section */}
      <div id="qna-form-section" className="mt-16 border-t border-stone-200 pt-16 max-w-3xl mx-auto">
        <div className="text-center space-y-2 mb-12">
          <span className="text-xs uppercase tracking-widest text-[#8C624E] font-mono font-bold">Collection Q&A</span>
          <h2 className="text-2xl font-serif text-[#2C302E]">Inquire About This Garment</h2>
          <p className="text-xs text-stone-500 font-light leading-relaxed">
            의류의 실측 문의, 상세 원단감, 추가 디테일 컷 요청은 아래 문의 폼을 통해 양식을 남겨주세요.
          </p>
        </div>

        {user ? (
          <form onSubmit={handleInquirySubmit} className="space-y-5 bg-[#FAF7F0]/40 p-6 sm:p-8 border border-[#8C624E]/5 rounded-xs">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-[#2C302E]/60 block mb-1 font-mono font-semibold">
                  Sender Name
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full bg-[#FAF7F0] border border-[#8C624E]/10 rounded-xs py-2.5 px-4 text-sm focus:outline-hidden focus:border-[#8C624E]"
                  placeholder="의뢰 주체명"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-[#2C302E]/60 block mb-1 font-mono font-semibold">
                  Sender Email
                </label>
                <input
                  type="email"
                  disabled
                  value={user.email || ""}
                  className="w-full bg-stone-100 border border-stone-200 text-stone-400 rounded-xs py-2.5 px-4 text-sm select-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest text-[#2C302E]/60 block mb-1 font-mono font-semibold">
                Inquiry Headline Title
              </label>
              <input
                type="text"
                value={inquiryTitle}
                onChange={(e) => setInquiryTitle(e.target.value)}
                className="w-full bg-[#FAF7F0] border border-[#8C624E]/10 rounded-xs py-2.5 px-4 text-sm focus:outline-hidden focus:border-[#8C624E]"
                placeholder="실측 문의 및 핏 스타일 등 핵심 제목"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest text-[#2C302E]/60 block mb-1 font-mono font-semibold">
                Inquiry Message Content
              </label>
              <textarea
                rows={4}
                value={inquiryMessage}
                onChange={(e) => setInquiryMessage(e.target.value)}
                className="w-full bg-[#FAF7F0] border border-[#8C624E]/10 rounded-xs py-2.5 px-4 text-sm focus:outline-hidden focus:border-[#8C624E] resize-none"
                placeholder="궁금하신 세부 내용을 편하게 기재해 주십시오."
              />
            </div>

            {err && (
              <p className="text-xs text-red-700 font-medium flex items-center space-x-1.5 font-mono">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{err}</span>
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#1A3020] text-white hover:bg-[#2C302E] transition-colors py-3 text-xs uppercase tracking-widest font-semibold flex items-center justify-center space-x-2 rounded-xs"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{submitting ? "Sending Inquiry..." : "Submit Inquiry Msg"}</span>
            </button>

            <AnimatePresence>
              {submitSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-[#2D4236] text-[#FAF7F0] text-center text-xs py-3 rounded-xs font-mono tracking-wider shadow-sm border border-[#2D4236]/10"
                >
                  Your inquiry and registration succeeded! Check your My Page for replies soon.
                </motion.div>
              )}
            </AnimatePresence>

          </form>
        ) : (
          <div className="bg-[#FAF7F0]/60 p-8 border border-stone-200/50 rounded-xs text-center space-y-4">
            <p className="text-xs text-[#2C302E]/70 font-light">
              의류 상세 문의는 회원 가입 및 로그인 후 작성하실 수 있습니다. 가입에는 10초 가량 소요됩니다.
            </p>
            <button
              onClick={() => setActivePage("Login")}
              className="text-xs font-semibold uppercase bg-stone-800 hover:bg-[#8C624E] text-[#FAF7F0] px-6 py-2.5 tracking-widest transition-all rounded-xs"
            >
              Go to Login Page
            </button>
          </div>
        )}
      </div>

      {/* 5. Purchase Order Checkout Modal overlay */}
      <AnimatePresence>
        {showOrderModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if (!ordering) { setShowOrderModal(false); setOrderSuccess(false); setOrderErr(""); } }}
              className="absolute inset-0 bg-[#2C302E]/60 backdrop-blur-xs"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white border border-[#8C624E]/15 rounded-xs w-full max-w-lg overflow-hidden shadow-2xl relative z-10 max-h-[95vh] flex flex-col"
            >
              
              {/* Header */}
              <div className="bg-[#FAF7F0] border-b border-[#8C624E]/10 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-[#8C624E]" />
                  <h3 className="text-sm font-serif text-[#2C302E] font-medium">Theodor Vintage Checkout (주문서 작성)</h3>
                </div>
                {!ordering && (
                  <button
                    onClick={() => { setShowOrderModal(false); setOrderSuccess(false); setOrderErr(""); }}
                    className="text-stone-400 hover:text-stone-600 font-mono text-xs uppercase px-1 transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                )}
              </div>

              {/* Scrollable Content */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-stone-700">
                
                {orderSuccess ? (
                  <div className="text-center space-y-6 py-6">
                    <div className="w-14 h-14 bg-emerald-150 inline-flex text-emerald-800 rounded-full items-center justify-center shadow-sm">
                      <Check className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-base font-serif text-[#1A3020] font-bold">아카이브 상품 주문 신청이 완료되었습니다!</h4>
                      <p className="text-xs text-stone-500 font-light leading-relaxed max-w-sm mx-auto">
                        선택하신 고유 소장용 빈티지 의류가 단독 선점되었으며, 입금 완료 시 신속한 세탁 및 발송 접수가 개시됩니다.
                      </p>
                    </div>

                    {/* 무통장 무통장 계좌이체 대화창 및 정보 팝업 */}
                    <div className="bg-[#FAF7F0] border border-[#8C624E]/20 p-5 rounded-sm space-y-4 text-left font-sans">
                      <div className="border-b border-[#8C624E]/10 pb-2 mb-2 flex justify-between items-center">
                        <span className="text-[11px] uppercase tracking-widest text-[#8C624E] font-bold font-mono">무통장 계좌이체 안내</span>
                        <span className="text-[10px] bg-amber-100 text-amber-800 font-mono px-2 py-0.5 rounded-sm font-semibold border border-amber-200">입금 확인 대기</span>
                      </div>
                      
                      <div className="space-y-2.5 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-stone-400 font-serif">계좌번호 (Bank Account)</span>
                          <span className="font-bold text-[#1A3020] text-sm select-all">카카오뱅크 3333365056455</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-stone-400 font-serif">예금주 (Account Holder)</span>
                          <span className="font-medium text-stone-800">신종민</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-[#8C624E]/5 pt-2.5">
                          <span className="text-stone-400 font-serif font-bold">송금 금액 (Payment Amount)</span>
                          <span className="font-bold text-amber-800 text-sm">{formattedPrice(liveProduct.price)}</span>
                        </div>
                      </div>

                      {/* 입금 확인 후 처리 예정 안내 문구 */}
                      <div className="bg-white/80 p-3 rounded-xs border border-stone-200/50 text-[10px] sm:text-[11px] text-stone-605 font-light leading-relaxed space-y-1">
                        <p className="text-[#8C624E] font-medium flex items-center space-x-1.5 pl-0.5">
                          <AlertCircle className="w-3.5 h-3.5 inline shrink-0" />
                          <span>안내 사항</span>
                        </p>
                        <p className="pl-0.5 pt-0.5 text-stone-500">
                          - 고객님의 정교한 아카이브 출고를 위하여 <strong>"입금 확인 후 상품 발송 처리"</strong>가 신속히 개시될 예정입니다.
                        </p>
                        <p className="pl-0.5 text-stone-500">
                          - 기재와 다른 입금자명으로 송금해주시는 경우, 테오도르 문의하기 채널 또는 어드민 메일로 미리 공유해 주시면 감사하겠습니다.
                        </p>
                      </div>
                    </div>

                    <div className="bg-stone-50 p-4 text-left border border-stone-200 rounded-xs text-[11px] space-y-2 font-mono">
                      <div className="flex justify-between">
                        <span className="text-stone-400">Order ID:</span>
                        <span className="text-stone-600 font-medium select-all text-xs">{lastOrderId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-400">Recipient Name:</span>
                        <span className="text-stone-700 font-medium">{recipientName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-400">Selected Size:</span>
                        <span className="text-stone-700 font-medium font-bold">{(["tops", "dresses", "outerwear", "shoes"].includes(liveProduct.category.toLowerCase()) && selectedSize) ? `${selectedSize}` : liveProduct.size}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-400">Ordered Product:</span>
                        <span className="text-stone-700 font-medium truncate max-w-[200px]">{liveProduct.name}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setShowOrderModal(false);
                        setOrderSuccess(false);
                        setActivePage("MyPage");
                      }}
                      className="w-full bg-[#1A3020] hover:bg-[#8C624E] text-[#FAF7F0] py-3.5 text-xs uppercase tracking-widest font-semibold transition-all rounded-xs shadow-md hover:shadow-lg active:scale-98 cursor-pointer font-serif"
                    >
                      Go to "My Page" to Track Status
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleOrderSubmit} className="space-y-4">
                    
                    {/* Item Brief */}
                    <div className="bg-[#FAF7F0]/50 p-4 border border-stone-150 rounded-xs flex gap-4 items-center">
                      <div className="w-14 h-18 bg-stone-150 overflow-hidden shrink-0 border border-stone-200">
                        <img src={liveProduct.imageUrl} alt={liveProduct.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[9px] uppercase font-mono tracking-widest text-[#8C624E]">Selected Archive Collection</span>
                        <h4 className="text-sm font-serif font-semibold text-[#2C302E] truncate mt-0.5">{liveProduct.name}</h4>
                        <div className="text-[10px] text-stone-400 font-mono mt-0.5">
                          Size Tag: <span className="text-stone-600 font-semibold">{(["tops", "dresses", "outerwear", "shoes"].includes(liveProduct.category.toLowerCase()) && selectedSize) ? `${selectedSize} (Selected)` : liveProduct.size}</span> &middot; Price: <span className="text-amber-800 font-semibold">{formattedPrice(liveProduct.price)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {/* Recipient Name Input */}
                      <div>
                        <label className="text-[9px] uppercase tracking-widest text-[#2C302E]/60 block mb-1 font-mono font-bold">
                          Recipient Name (수령인 성함) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={recipientName}
                          onChange={(e) => setRecipientName(e.target.value)}
                          className="w-full bg-[#FAF7F0]/60 border border-[#8C624E]/10 rounded-xs py-2 px-3 text-xs focus:outline-hidden focus:border-[#8C624E]"
                          placeholder="배송 받으실 분의 이름"
                        />
                      </div>

                      {/* Phone Input */}
                      <div>
                        <label className="text-[9px] uppercase tracking-widest text-[#2C302E]/60 block mb-1 font-mono font-bold">
                          Phone Number (수령인 연락처) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={recipientPhone}
                          onChange={(e) => setRecipientPhone(e.target.value)}
                          className="w-full bg-[#FAF7F0]/60 border border-[#8C624E]/10 rounded-xs py-2 px-3 text-xs focus:outline-hidden focus:border-[#8C624E]"
                          placeholder="010-0000-0000 (입금 및 운송안내 수신용)"
                        />
                      </div>

                      {/* Shipping Address Input */}
                       <div>
                         <label className="text-[9px] uppercase tracking-widest text-[#2C302E]/60 block mb-1 font-mono font-bold">
                           Shipping Address (배송 수령 주소) <span className="text-red-500">*</span>
                         </label>
                         <textarea
                           rows={2.5}
                           required
                           value={shippingAddress}
                           onChange={(e) => setShippingAddress(e.target.value)}
                           className="w-full bg-[#FAF7F0]/60 border border-[#8C624E]/10 rounded-xs py-2 px-3 text-xs focus:outline-hidden focus:border-[#8C624E] resize-none"
                           placeholder="상세 우편 배송지와 공동현관 비밀번호 등 특이사항"
                         />
                       </div>

                    </div>

                    {/* Vintage Notice Panel */}
                    <div className="bg-amber-50/50 p-3.5 border border-amber-250/30 rounded-xs flex items-start space-x-2 text-[11px] text-amber-900 font-light">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="font-semibold block font-serif text-amber-950">테오도르 빈티지 안심 주문 주의사항</span>
                        <p className="leading-relaxed">
                          모든 아카이브 제품은 <strong>단 한 개의 객체</strong>만 존재합니다. 주문 전송이 완료된 직후 중복 선점을 방지하고자 데이터베이스 시스템에서 <strong>즉각 품절 처리</strong>됩니다. 단순 변심 취소 등은 지양해 주시기 바랍니다.
                        </p>
                      </div>
                    </div>

                    {orderErr && (
                      <p className="text-xs text-red-700 font-medium flex items-center space-x-1.5 font-mono">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{orderErr}</span>
                      </p>
                    )}

                    {/* Buttons */}
                    <div className="flex space-x-3 pt-2">
                      <button
                        type="button"
                        disabled={ordering}
                        onClick={() => { setShowOrderModal(false); setOrderErr(""); }}
                        className="w-1/3 border border-stone-300 hover:bg-stone-100 text-stone-600 transition-all py-3.5 text-xs uppercase tracking-widest font-semibold rounded-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                      
                      <button
                        type="submit"
                        disabled={ordering}
                        className="flex-1 bg-[#8C624E] hover:bg-[#754f3d] text-white transition-all duration-200 py-3.5 px-5 text-xs sm:text-sm font-bold uppercase tracking-widest flex items-center justify-center space-x-2 rounded-xs shadow-md hover:shadow-lg hover:brightness-105 active:scale-98 cursor-pointer font-serif"
                      >
                        {ordering ? (
                          <span className="animate-pulse">Processing...</span>
                        ) : (
                          <>
                            <ShieldCheck className="w-4.5 h-4.5" />
                            <span>Confirm Order (주문 완료)</span>
                          </>
                        )}
                      </button>
                    </div>

                  </form>
                )}

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
