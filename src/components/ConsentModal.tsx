/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ShieldCheck, ArrowRight, LogOut, CheckSquare, Square, Check, Info } from "lucide-react";
import { motion } from "motion/react";
import { User } from "firebase/auth";
import { serverTimestamp } from "firebase/firestore";

interface ConsentModalProps {
  user: User;
  onConsentComplete: (consents: {
    agreedTerms: boolean;
    agreedPrivacy: boolean;
    agreedMarketing: boolean;
  }) => Promise<void>;
  onSignOut: () => Promise<void>;
}

export default function ConsentModal({ user, onConsentComplete, onSignOut }: ConsentModalProps) {
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const [agreedMarketing, setAgreedMarketing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Detail viewing states
  const [showTermsDetail, setShowTermsDetail] = useState(false);
  const [showPrivacyDetail, setShowPrivacyDetail] = useState(false);

  // Toggle "Agree to All"
  const isAllAgreed = agreedTerms && agreedPrivacy && agreedMarketing;
  const handleToggleAll = () => {
    if (isAllAgreed) {
      setAgreedTerms(false);
      setAgreedPrivacy(false);
      setAgreedMarketing(false);
    } else {
      setAgreedTerms(true);
      setAgreedPrivacy(true);
      setAgreedMarketing(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedTerms || !agreedPrivacy) {
      setErrorMsg("필수 약관 및 개인정보 수집에 동의하셔야 정상적인 서비스 이용이 가능합니다.");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    try {
      await onConsentComplete({
        agreedTerms,
        agreedPrivacy,
        agreedMarketing,
      });
    } catch (err: any) {
      console.error("Consent submit error:", err);
      setErrorMsg(err.message || "동의 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative bg-[#FDFBF7] border border-[#8C624E]/15 rounded-sm max-w-lg w-full shadow-2xl p-6 sm:p-8 font-serif text-[#2C302E] my-8"
      >
        {/* Branding header */}
        <div className="text-center space-y-3 mb-6">
          <div className="inline-flex p-3 bg-[#FAF7F0] border border-[#8C624E]/10 rounded-full text-[#8C624E] mx-auto">
            <ShieldCheck className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-serif tracking-tight text-[#2C302E]">기본정보 및 서비스 동의</h2>
            <p className="text-[11px] text-stone-400 font-sans tracking-wider uppercase">
              ARCHIVE STORE USER VERIFICATION
            </p>
          </div>
          <div className="h-[1px] w-12 bg-[#8C624E]/30 mx-auto mt-4" />
        </div>

        {/* User identification */}
        <div className="bg-[#FAF7F0] border border-[#8C624E]/10 rounded-xs px-4 py-3 text-xs font-sans text-stone-600 mb-6 flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="font-medium text-[#2C302E]">{user.displayName || "신규 고객님"}</p>
            <p className="text-[11px] text-stone-400 font-mono">{user.email}</p>
          </div>
          <div className="text-[10px] bg-[#8C624E]/5 border border-[#8C624E]/20 text-[#8C624E] px-2 py-0.5 rounded font-medium tracking-wide">
            가입 대기 중
          </div>
        </div>

        <p className="text-xs text-stone-500 font-sans leading-relaxed text-center mb-6">
          플랫폼을 안전하고 공정하게 이용하기 위해 약관 동의 및 수집 절차를 진행합니다.
          동의하신 정보는 관련 법령에 의거하여 엄격히 보호됩니다.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
          {/* Total Agreement Toggle */}
          <button
            type="button"
            onClick={handleToggleAll}
            className={`w-full flex items-center justify-between p-4 rounded-xs border text-left transition-all ${
              isAllAgreed
                ? "bg-[#8C624E]/5 border-[#8C624E] text-[#2C302E]"
                : "bg-white border-stone-200 text-stone-600 hover:border-stone-300"
            }`}
          >
            <div className="flex items-center space-x-3">
              {isAllAgreed ? (
                <div className="w-4 h-4 bg-[#8C624E] text-white flex items-center justify-center rounded-xs">
                  <Check className="w-3.5 h-3.5" />
                </div>
              ) : (
                <div className="w-4 h-4 border border-stone-300 rounded-xs bg-white" />
              )}
              <span className="font-semibold text-sm">약관 전체 동의하기</span>
            </div>
            <span className="text-[10px] text-[#8C624E] font-medium font-serif bg-stone-100 hover:bg-stone-200/50 px-2.5 py-0.5 rounded-xs">
              {isAllAgreed ? "All Selected" : "Select All"}
            </span>
          </button>

          {/* Separation line */}
          <div className="h-[1px] bg-stone-100 my-2" />

          {/* Consent Checkbox #1: Terms and Conditions */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`w-4 h-4 rounded-xs flex items-center justify-center border transition-all ${
                    agreedTerms
                      ? "bg-[#2C302E] border-[#2C302E] text-white"
                      : "border-stone-300 bg-white"
                  }`}
                >
                  {agreedTerms && <Check className="w-3 h-3" />}
                </div>
                <span className="font-medium text-[13px] text-stone-800">
                  서비스 이용약관 동의 <span className="text-[#8C624E] font-semibold font-serif">(필수)</span>
                </span>
              </label>
              <button
                type="button"
                onClick={() => setShowTermsDetail(!showTermsDetail)}
                className="text-[10px] text-stone-400 font-medium hover:text-[#8C624E] underline decoration-dotted underline-offset-2 cursor-pointer font-sans"
              >
                {showTermsDetail ? "접기" : "내용보기"}
              </button>
            </div>
            {showTermsDetail && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="bg-stone-50 border border-stone-200/65 rounded-xs p-3 text-[10.5px] leading-relaxed text-stone-500 overflow-y-auto max-h-24 font-mono font-light shadow-inner"
              >
                <p className="font-semibold mb-1 text-stone-700 font-sans">제 1 조 (목적)</p>
                <p className="mb-2">본 약관은 '아카이브 빈티지 스토어'(이하 "회사")가 웹상에서 제공하는 정규 및 스페셜 아카이브 상품 탐색, 북마크, 문의 답변 배포 및 이벤트 슬롯 응모 서비스(이하 "서비스")를 회원으로서 이용할 때 요구되는 회사와 가입 고객 간의 권리, 의무 및 제반 사항 규정을 규정합니다.</p>
                <p className="font-semibold mb-1 text-stone-700 font-sans">제 2 조 (용어의 정의)</p>
                <p className="mb-2">1. "회원"이란 본 약관에 동의하여 소정의 회원가입 단계를 성실히 통과한 주체를 지칭합니다.<br />2. "이벤트 슬롯"이라 함은 당사에서 단발성 혹은 기획전 단위로 한정수량 진행하는 스페셜 메인 혜택 신청 경로를 뜻합니다.</p>
                <p className="font-semibold mb-1 text-stone-700 font-sans">제 3 조 (이용제한 및 준수의무)</p>
                <p>가입자는 타인의 명의, 이메일을 도용하여 가입을 조장하거나 슬롯 자동화 스크립트를 사용하여 시스템에 무리를 주어서는 아니 되며, 부정한 행위 포착 시 관리자 재량으로 영구 추방 처리됩니다.</p>
              </motion.div>
            )}
          </div>

          {/* Consent Checkbox #2: Privacy Policy */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedPrivacy}
                  onChange={(e) => setAgreedPrivacy(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`w-4 h-4 rounded-xs flex items-center justify-center border transition-all ${
                    agreedPrivacy
                      ? "bg-[#2C302E] border-[#2C302E] text-white"
                      : "border-stone-300 bg-white"
                  }`}
                >
                  {agreedPrivacy && <Check className="w-3 h-3" />}
                </div>
                <span className="font-medium text-[13px] text-stone-800">
                  개인정보 수집 및 이용 동의 <span className="text-[#8C624E] font-semibold font-serif">(필수)</span>
                </span>
              </label>
              <button
                type="button"
                onClick={() => setShowPrivacyDetail(!showPrivacyDetail)}
                className="text-[10px] text-stone-400 font-medium hover:text-[#8C624E] underline decoration-dotted underline-offset-2 cursor-pointer font-sans"
              >
                {showPrivacyDetail ? "접기" : "내용보기"}
              </button>
            </div>
            {showPrivacyDetail && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="bg-stone-50 border border-stone-200/65 rounded-xs p-3 text-[10.5px] leading-relaxed text-stone-500 overflow-y-auto max-h-24 font-mono font-light shadow-inner"
              >
                <p className="font-semibold mb-1 text-stone-700 font-sans">1. 수집하는 개인정보 항목</p>
                <p className="mb-2">가입 및 본인확인을 위한 정보: 성명, 이메일 주소, 로그인 식별정보(UID), 프로필 이미지 경로.</p>
                <p className="font-semibold mb-1 text-stone-700 font-sans">2. 수집 및 이용목적</p>
                <p className="mb-2">스토어 내 1:1 고객 실시간 문의(Inquiries) 처리, 답변 송신, 스페셜 이벤트 슬롯(Applications) 접수 완료에 관한 고객 대조 및 원활한 상담 절차 보장을 위해 신뢰성 있게 수집됩니다.</p>
                <p className="font-semibold mb-1 text-stone-700 font-sans">3. 개인정보 보존 및 이용기간</p>
                <p>회원 정보 파기 요청 및 즉각적인 회원 탈퇴 의사가 수립되기 전까지 영구 데이터베이스에 소중히 보관하며, 탈퇴 완료 확인 시 저장 매체로부터 완전 복구 불가능하게 파기 처리합니다.</p>
              </motion.div>
            )}
          </div>

          {/* Consent Checkbox #3: Marketing */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedMarketing}
                  onChange={(e) => setAgreedMarketing(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`w-4 h-4 rounded-xs flex items-center justify-center border transition-all ${
                    agreedMarketing
                      ? "bg-[#2C302E] border-[#2C302E] text-white"
                      : "border-stone-300 bg-white"
                  }`}
                >
                  {agreedMarketing && <Check className="w-3 h-3" />}
                </div>
                <span className="font-medium text-[13px] text-stone-800 flex items-center space-x-1">
                  <span>마케팅 정보 수신 동의</span>
                  <span className="text-stone-400 font-light font-sans text-[11px]">(선택)</span>
                </span>
              </label>
              <span className="text-[10px] text-stone-400 select-none font-sans">Optional</span>
            </div>
            <p className="pl-6.5 text-[10.5px] text-stone-400 font-sans leading-normal">
              당사의 신상 아카이브 빈티지 바잉 상품 업데이트 소식, 한정판 빈티지 슬롯 혜택 알림, 쿠폰 등 개인화 프로모션 및 마케팅 소식을 신속히 제공받으실 수 있습니다.
            </p>
          </div>

          {/* Error notice */}
          {errorMsg && (
            <div className="p-3 bg-red-500/10 border-l border-red-500 text-xs text-red-500 font-light flex items-center gap-2 font-sans mt-4">
              <Info className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit buttons */}
          <div className="pt-6 grid grid-cols-2 gap-3.5">
            <button
              type="button"
              onClick={onSignOut}
              className="px-4 py-3 bg-stone-100 hover:bg-stone-200/70 border border-stone-200 text-stone-600 text-xs font-semibold uppercase tracking-widest rounded-xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>취소 (로그아웃)</span>
            </button>
            <button
              type="submit"
              disabled={submitting || !agreedTerms || !agreedPrivacy}
              className={`px-4 py-3 text-xs font-semibold uppercase tracking-widest rounded-xs flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                agreedTerms && agreedPrivacy && !submitting
                  ? "bg-[#8C624E] hover:bg-[#704E3E] text-white shadow-sm"
                  : "bg-stone-200 text-stone-400 border border-stone-200 cursor-not-allowed"
              }`}
            >
              {submitting ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>동의하고 진행</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
