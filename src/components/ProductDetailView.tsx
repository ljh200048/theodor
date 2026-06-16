/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ArrowLeft, Heart, ShieldCheck, Truck, Sparkles, MessageSquare, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ActivePage, Product, SiteSetting } from "../types";
import { User } from "firebase/auth";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
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
  const [inquiryTitle, setInquiryTitle] = useState("");
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [userName, setUserName] = useState(user?.displayName || "");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

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
        productId: product.id,
        productName: product.name,
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

  const contactLink = settings?.contactUrl || "mailto:lch200048@gmail.com";

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
        
        {/* Left Side: Crisp Image Card */}
        <div className="relative aspect-3/4 overflow-hidden bg-stone-100 border border-[#FAF7F0] shadow-xs">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />

          {product.isSoldOut && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white border border-white px-6 py-2.5 text-sm tracking-widest uppercase font-mono">
                Sold Out Collection
              </span>
            </div>
          )}

          {product.isRecommended && !product.isSoldOut && (
            <div className="absolute top-4 left-4 bg-[#1A3020] text-white px-3 py-1.5 text-xs tracking-widest uppercase flex items-center space-x-1.5 font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Recommended Pick</span>
            </div>
          )}
        </div>

        {/* Right Side: Specifications and descriptions */}
        <div className="space-y-8">
          
          {/* Header metadata */}
          <div className="space-y-3.5 border-b border-stone-200 pb-6">
            <div className="flex justify-between items-center text-xs tracking-widest uppercase text-stone-400 font-mono">
              <span>{product.category}</span>
              <span>Condition {product.condition.split(":")[0]}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif text-[#2C302E] leading-tight font-medium">
              {product.name}
            </h1>
            <p className="text-2xl font-serif text-[#8C624E] font-semibold pt-1">
              {formattedPrice(product.price)}
            </p>
          </div>

          {/* Measurements & Conditions List */}
          <div className="grid grid-cols-2 gap-4 bg-[#FAF7F0] p-6 border border-[#8C624E]/5 rounded-xs">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#2C302E]/40 block mb-1 font-mono">Tagged Size</span>
              <span className="text-sm font-medium text-[#2C302E]">{product.size}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#2C302E]/40 block mb-1 font-mono">Condition Rating</span>
              <span className="text-sm font-medium text-[#1A3020]">{product.condition}</span>
            </div>
          </div>

          {/* Core Description Text */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-stone-400 font-semibold font-mono">Description</h4>
            <p className="text-stone-700 text-sm font-light leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>

          {/* Shipping & Handling checklist */}
          <div className="space-y-3 border-t border-[#FAF7F0] pt-6 text-xs text-stone-500 font-light space-y-2">
            <div className="flex items-center space-x-3">
              <Truck className="w-4 h-4 text-[#8C624E]" />
              <span>전국 무료 배송 혜택 &middot; 결제 완료 후 1-3일 소요 (우체국 택배)</span>
            </div>
            <div className="flex items-center space-x-3">
              <ShieldCheck className="w-4 h-4 text-[#1A3020]" />
              <span>모든 가먼트 특수 산소 살균 및 스팀 세탁 완료</span>
            </div>
          </div>

          {/* Interactive Actions Panel */}
          <div className="flex items-center space-x-4 pt-4 border-t border-stone-200">
            
            {/* Wishlist toggle */}
            <button
              onClick={() => toggleFavorite(product.id)}
              className={`flex items-center justify-center p-4 border rounded-xs transition-colors shrink-0 focus:outline-hidden ${
                isFavorited
                  ? "bg-red-50 border-red-200 text-red-500"
                  : "border-stone-300 text-stone-400 hover:text-red-500 hover:border-red-200"
              }`}
              id="like-button"
            >
              <Heart className="w-5 h-5" fill={isFavorited ? "currentColor" : "none"} />
            </button>

            {/* Inquire on Kakao/Purchase contact */}
            <a
              href={`${contactLink}?subject=[theodor_vintage Curation Inquiry] ${product.name}`}
              className="flex-1 text-center bg-[#2C302E] hover:bg-[#8C624E] text-[#FAF7F0] py-4 text-xs font-semibold uppercase tracking-widest transition-colors block border border-[#2C302E] rounded-xs"
            >
              Request Buying (Purchase Inquiry)
            </a>

          </div>

          {!user && (
            <div className="text-xs text-red-700/80 bg-red-100/50 border border-red-200/50 p-3 rounded-xs flex items-center space-x-2">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Login or Sign up to utilize the wishlist and raise inquiries on specific items!</span>
            </div>
          )}

        </div>

      </div>

      {/* 4. Product Specific Inquiry Section */}
      <div className="mt-20 border-t border-stone-200 pt-16 max-w-3xl mx-auto">
        <div className="text-center space-y-2 mb-12">
          <span className="text-xs uppercase tracking-widest text-[#8C624E] font-mono">Collection Q&A</span>
          <h2 className="text-2xl font-serif text-[#2C302E]">Inquire About This Garment</h2>
          <p className="text-xs text-stone-500 font-light">
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
