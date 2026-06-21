/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ShieldCheck, CalendarClock, Mail, Globe, Sparkles } from "lucide-react";

export default function PrivacyView() {
  return (
    <div className="space-y-16 pb-24 animate-fade-in">
      {/* Hero Header */}
      <section className="relative py-20 bg-[#FAF7F0] text-center border-b border-[#FAF7F0] overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-[#8C624E] rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 space-y-4">
          <span className="text-xs uppercase tracking-[0.45em] text-[#8C624E] font-bold font-mono">Legal & Privacy</span>
          <h1 className="text-3xl sm:text-5xl font-serif text-[#2C302E]">개인정보처리방침</h1>
          <p className="text-xs sm:text-sm text-stone-500 max-w-lg mx-auto leading-relaxed font-light">
            테오도르 빈티지(Theodor Vintage)는 귀하의 개인 정보를 매우 소중하게 여기며, 귀하가 안심하고 서비스를 이용하실 수 있도록 최선을 다하고 있습니다.
          </p>
        </div>
      </section>

      {/* Main Content Sections */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="bg-white border border-[#8C624E]/10 p-6 sm:p-10 rounded-xs shadow-xs space-y-10">
          
          {/* Section 1 */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-[#8C624E]">
              <ShieldCheck className="w-5 h-5 shrink-0" />
              <h2 className="text-lg font-serif font-semibold text-[#2C302E]">1. 수집하는 개인정보 항목</h2>
            </div>
            <p className="text-sm font-light text-stone-600 leading-relaxed pl-8">
              테오도르는 고객님께 맞춤화된 서비스 및 원활한 비대면 에센셜 상품 발송 거래를 위하여 회원가입 및 상품 주문 시 유효하고 최소한의 필수 데이터를 아래와 같이 수집합니다.
            </p>
            <div className="ml-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#FAF7F0] p-4 border border-[#8C624E]/5 rounded-xs">
                <span className="block text-xs font-semibold text-[#8C624E] uppercase tracking-wider mb-1 font-mono">필수 식별 정보</span>
                <span className="text-sm text-stone-700 font-medium">이름, 이메일, 연락처(휴대전화번호)</span>
              </div>
              <div className="bg-[#FAF7F0] p-4 border border-[#8C624E]/5 rounded-xs">
                <span className="block text-xs font-semibold text-[#8C624E] uppercase tracking-wider mb-1 font-mono">맞춤 피팅 및 추천 정보</span>
                <span className="text-sm text-stone-700 font-medium">클라이언트 의류 사이즈</span>
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-[#8C624E]">
              <CalendarClock className="w-5 h-5 shrink-0" />
              <h2 className="text-lg font-serif font-semibold text-[#2C302E]">2. 개인정보의 보유 및 이용 기간</h2>
            </div>
            <p className="text-sm font-light text-stone-600 leading-relaxed pl-8">
              수집된 고객님의 개인정보는 해당 서비스 목적 완료 시 지체 없이 복구 불가능한 형태로 즉각 파기함을 원칙으로 합니다. 단, 관계법령 및 거래 분쟁 해결 보증을 위하여 아래 지정된 의무 보관 목적 기간 동안 데이터를 보존합니다.
            </p>
            <div className="ml-8 border-l-2 border-[#8C624E]/15 pl-4 space-y-2.5 text-sm">
              <div className="flex justify-between py-1.5 border-b border-[#FAF7F0] text-stone-700">
                <span className="font-medium">이용 계약 및 구매, 결제 청약 철회 관련 기록</span>
                <span className="font-semibold text-[#8C624E]">5년 보관</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#FAF7F0] text-stone-700">
                <span className="font-medium">소비자의 계약 불이행, 가입 분쟁 등의 민원 처리 기록</span>
                <span className="font-semibold text-[#8C624E]">3년 보관</span>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-[#8C624E]">
              <Globe className="w-5 h-5 shrink-0" />
              <h2 className="text-lg font-serif font-semibold text-[#2C302E]">3. 플랫폼 운영 주소지</h2>
            </div>
            <p className="text-sm font-light text-stone-600 leading-relaxed pl-8">
              본 웹사이트 및 개인정보처리시스템은 아래 공식 디지털 도메인 주소를 기반으로 보장되어 안전하게 배포 및 통제됩니다.
            </p>
            <div className="ml-8">
              <a 
                href="https://theodor.cloud" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-sm text-[#8C624E] hover:underline font-mono"
              >
                <span>https://theodor.cloud</span>
              </a>
            </div>
          </div>

          {/* Section 4 */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-[#8C624E]">
              <Mail className="w-5 h-5 shrink-0" />
              <h2 className="text-lg font-serif font-semibold text-[#2C302E]">4. 개인정보 보호 담당 실무 및 이의 제기</h2>
            </div>
            <p className="text-sm font-light text-stone-600 leading-relaxed pl-8 border-b border-[#FAF7F0] pb-6">
              개인정보의 열람 청구, 정보 수정 또는 열람 거부 및 파기 등 모든 정보 주체 권리와 관련하여 불편이나 이의가 있으신 경우에는 당 브랜드 담당 부서로 연락해 주시면 접수 후 신속히 응답 조치하도록 하겠습니다.
            </p>
            <div className="ml-8 flex items-center space-x-3 bg-stone-50 p-4 border border-stone-200/60 rounded-xs">
              <div className="bg-[#8C624E]/10 p-2 rounded-full text-[#8C624E]">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-xs text-stone-400">공식 개인정보 담당 이메일</span>
                <a href="mailto:jongminsin81@gmail.com" className="text-sm font-semibold text-stone-800 hover:underline font-mono">
                  jongminsin81@gmail.com
                </a>
              </div>
            </div>
          </div>

        </div>

        <div className="text-center">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="text-xs tracking-widest text-[#8C624E] font-medium font-mono uppercase bg-[#FAF7F0] hover:bg-[#8C624E]/5 px-4 py-2 rounded-xs border border-[#8C624E]/5 transition-all cursor-pointer"
          >
            Back to Top
          </button>
        </div>
      </section>
    </div>
  );
}
