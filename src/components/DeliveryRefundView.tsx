/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Truck, RotateCcw, AlertTriangle, Mail, RefreshCw, Layers } from "lucide-react";

export default function DeliveryRefundView() {
  return (
    <div className="space-y-16 pb-24 animate-fade-in">
      {/* Hero Header */}
      <section className="relative py-20 bg-[#FAF7F0] text-center border-b border-[#FAF7F0] overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-[#8C624E] rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 space-y-4">
          <span className="text-xs uppercase tracking-[0.45em] text-[#8C624E] font-bold font-mono">Service Policy</span>
          <h1 className="text-3xl sm:text-5xl font-serif text-[#2C302E]">배송 및 환불 안내</h1>
          <p className="text-xs sm:text-sm text-stone-500 max-w-lg mx-auto leading-relaxed font-light">
            테오도르 빈티지(Theodor Vintage)의 안전하고 친절한 배송 및 교환/환불 세부 정책을 공지합니다.
          </p>
        </div>
      </section>

      {/* Main Content Sections */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="bg-white border border-[#8C624E]/10 p-6 sm:p-10 rounded-xs shadow-xs space-y-10">
          
          {/* Section 1: 배송 안내 */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-[#8C624E]">
              <Truck className="w-5 h-5 shrink-0" />
              <h2 className="text-lg font-serif font-semibold text-[#2C302E]">1. 배송 안내 (Shipping Policy)</h2>
            </div>
            <div className="text-sm font-light text-stone-600 leading-relaxed pl-8 space-y-4">
              <p>
                입금이 완료된 주문 건에 한하여 순차적으로 상품 준비 및 검수가 개시되며, 아래 일정에 따라 정밀 배송 처리가 완료됩니다.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-[#FAF7F0] p-4 border border-[#8C624E]/5 rounded-xs">
                  <span className="block text-xs font-semibold text-[#8C624E] uppercase tracking-wider mb-1 font-mono">배송 기간</span>
                  <span className="text-sm text-stone-700 font-medium">
                    입금 확인 후 1~3 영업일 이내 발송되며, 발송 후 배송 완료까지 약 2~5 영업일이 소요됩니다.
                  </span>
                </div>
                <div className="bg-[#FAF7F0] p-4 border border-[#8C624E]/5 rounded-xs">
                  <span className="block text-xs font-semibold text-[#8C624E] uppercase tracking-wider mb-1 font-mono">배송비 요금</span>
                  <span className="text-sm text-stone-700 font-medium">
                    기본 배송비는 <strong>3,000원</strong>입니다. 단, 제주도, 도서 산간 등 일부 교통이 불편한 지역은 추가 배송비가 발생할 수 있습니다.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: 환불 및 청약철회 */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-[#8C624E]">
              <RotateCcw className="w-5 h-5 shrink-0" />
              <h2 className="text-lg font-serif font-semibold text-[#2C302E]">2. 교환 및 환불 (Return & Refund)</h2>
            </div>
            <div className="text-sm font-light text-stone-600 leading-relaxed pl-8 space-y-3">
              <p>
                빈티지 및 아카이브 의류는 각 아이템 고유의 특성을 가지고 있습니다. 상품 보호와 안전한 보상 거래를 위해 다음 규정을 준수합니다.
              </p>
              <div className="bg-stone-50 border border-stone-100 p-4 rounded-xs text-sm text-stone-700 space-y-2">
                <div className="flex items-start space-x-2">
                  <span className="text-[#8C624E] font-bold">•</span>
                  <span>상품 수령 후 <strong>7일 이내</strong>에 Q&A 게시판 혹은 담당 이메일로 환불 신청이 완료되어야 합니다.</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-[#8C624E] font-bold">•</span>
                  <span>단순 변심에 의한 환불 시 발생하는 배송 비용은 고객 부담(왕복 배송비 적용)입니다.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: 교환/환불 불가 대상 */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-red-700">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h2 className="text-lg font-serif font-semibold text-[#2C302E]">3. 교환/환불 불가 예외조항</h2>
            </div>
            <p className="text-sm font-light text-stone-600 leading-relaxed pl-8">
              초기 나눔 활성화 제도의 무상 혹은 실비 수준 품목은 한정 수량 자원 및 배송 낭비를 줄이기 위해 교환/환불이 엄격하게 제한됩니다.
            </p>
            <div className="ml-8 bg-red-50/50 p-4 border border-red-200/50 rounded-xs flex items-start space-x-3">
              <Layers className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="block text-xs font-semibold text-red-600 uppercase tracking-wider mb-1 font-mono">무상 나눔 유의사항</span>
                <span className="text-sm text-stone-700 font-bold">
                  C급 나눔 상품은 제품 노후화 및 실비 환원 목적으로 제공되므로 어떠한 사유로도 교환 및 환불이 불가능합니다.
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: 고객 문의 창구 */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-[#1A3020]">
              <Mail className="w-5 h-5 shrink-0" />
              <h2 className="text-lg font-serif font-semibold text-[#2C302E]">4. 신속한 처리 및 문의 안내</h2>
            </div>
            <p className="text-sm font-light text-stone-600 leading-relaxed pl-8 border-b border-[#FAF7F0] pb-6">
              배송 누락, 주소지 오입력, 주문 정보 정정, 청약 철회 및 기타 배송 상의 문제가 발생한 경우 아래의 고객센터 창구로 메일을 남겨주시면 영업일 기준 24시간 내 친절하고 원활한 피드백을 안내해 드립니다.
            </p>
            
            <div className="ml-8 flex items-center space-x-3 bg-stone-50 p-4 border border-stone-200/60 rounded-xs">
              <div className="bg-[#8C624E]/10 p-2 rounded-full text-[#8C624E]">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-xs text-stone-400">공식 고객지원 이메일</span>
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
