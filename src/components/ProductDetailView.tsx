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
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ActivePage, Product, SiteSetting } from "../types";
import { User } from "firebase/auth";
import { collection, doc, setDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";

interface ProductDetailProps {
  product: Product;
  user: User | null;
  isFavorited: boolean;
  toggleFavorite: (productId: string) => Promise<void>;
  onBack: () => void;
  settings: SiteSetting | null;
  setActivePage: (p: ActivePage) => void;
}

export default function ProductDetailView({
  product,
  user,
  isFavorited,
  toggleFavorite,
  onBack,
  settings,
  setActivePage,
}: ProductDetailProps) {
  const [liveProduct, setLiveProduct] = useState<Product>(product);
  const [activeImage, setActiveImage] = useState(product.imageUrl);
  const [inquiryTitle, setInquiryTitle] = useState("");
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [userName, setUserName] = useState(user?.displayName || "");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  // Keep liveProduct updated with the live Firestore document
  useEffect(() => {
    setLiveProduct(product);
    setActiveImage(product.imageUrl);
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

  const instagram = settings?.instagramUrl || "https://instagram.com/theodor_vintage";
  const allImages = [liveProduct.imageUrl, ...( (liveProduct as any).detailImageUrls || [] )].filter(Boolean);

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
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-[#FAF7F0] p-6 border border-[#8C624E]/5 rounded-xs">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#2C302E]/40 block mb-1 font-mono">Tagged Size</span>
              <span className="text-sm font-medium text-[#2C302E]">{liveProduct.size}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#2C302E]/40 block mb-1 font-mono">Condition Rating</span>
              <span className="text-sm font-medium text-[#1A3020]">{liveProduct.condition}</span>
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

          {/* Interactive Actions Panel */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4 border-t border-stone-200">
            
            {/* Wishlist toggle */}
            <button
              onClick={() => toggleFavorite(liveProduct.id)}
              className={`flex items-center justify-center p-4 border rounded-xs transition-colors shrink-0 focus:outline-hidden ${
                isFavorited
                  ? "bg-red-50 border-red-200 text-red-500"
                  : "border-stone-300 text-stone-400 hover:text-red-500 hover:border-red-200"
              }`}
              id="like-button"
            >
              <Heart className="w-5 h-5" fill={isFavorited ? "currentColor" : "none"} />
            </button>

            {/* Instagram DM button */}
            {instagram && (
              <a
                href={instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center bg-white border border-[#2C302E] hover:bg-stone-50 text-[#2C302E] py-4 text-xs font-semibold uppercase tracking-widest transition-all flex items-center justify-center space-x-2 rounded-xs"
              >
                <Instagram className="w-4 h-4 text-stone-700" />
                <span>Instagram DM Contact</span>
              </a>
            )}

            {/* Direct inquiry trigger scroll */}
            <button
              onClick={() => {
                const el = document.getElementById("qna-form-section");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="flex-1 text-center bg-[#2C302E] hover:bg-[#8C624E] text-[#FAF7F0] py-4 text-xs font-semibold uppercase tracking-widest transition-colors block border border-[#2C302E] rounded-xs"
            >
              문의하기 (Send Inquiry)
            </button>

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

    </div>
  );
}
