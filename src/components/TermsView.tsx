/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { FileText, CreditCard, Truck, RefreshCw, Mail } from "lucide-react";

export default function TermsView() {
  return (
    <div className="space-y-16 pb-24 animate-fade-in">
      {/* Hero Header */}
      <section className="relative py-20 bg-[#FAF7F0] text-center border-b border-[#FAF7F0] overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/3 right-1/3 w-80 h-80 bg-[#8C624E] rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 space-y-4">
          <span className="text-xs uppercase tracking-[0.45em] text-[#8C624E] font-bold font-mono">Service Agreement</span>
          <h1 className="text-3xl sm:text-5xl font-serif text-[#2C302E]">이용약관</h1>
          <p className="text-xs sm:text-sm text-stone-500 max-w-lg mx-auto leading-relaxed font-light">
            테오도르 빈티지(Theodor Vintage) 플랫폼을 안전하고 합리적으로 이용하기 위해 아래의 핵심 이용 규칙을 고지해 드립니다.
          </p>
        </div>
      </section>

      {/* Main Content Sections */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="bg-white border border-[#8C624E]/10 p-6 sm:p-10 rounded-xs shadow-xs space-y-10">
          
          {/* Section 1 - Payment */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-[#8C624E]">
              <CreditCard className="w-5 h-5 shrink-0" />
              <h2 className="text-lg font-serif font-semibold text-[#2C302E]">1. 대금 결제 수단</h2>
            </div>
            <p className="text-sm font-light text-stone-600 leading-relaxed pl-8">
              테오도르는 모든 한정판 아카이브 상품에 대하여 고전적이고 확실한 가치 거래 및 이중 수수료 예방을 위하여 아래 결제 메커니즘을 지원합니다.
            </p>
            <div className="ml-8 bg-[#FAF7F0] p-4 border border-[#8C624E]/5 rounded-xs inline-block">
              <span className="text-xs font-semibold text-[#8C624E] uppercase tracking-wider block font-mono mb-0.5">Payment Method</span>
              <span className="text-sm font-bold text-stone-800">계좌이체 (무통장 입금 및 다이렉트 이체 지원)</span>
            </div>
          </div>

          {/* Section 2 - Shipping */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-[#8C624E]">
              <Truck className="w-5 h-5 shrink-0" />
              <h2 className="text-lg font-serif font-semibold text-[#2C302E]">2. 포장 및 안전 배송</h2>
            </div>
            <p className="text-sm font-light text-stone-600 leading-relaxed pl-8">
              구매가 완료된 소중한 아카이브 빈티지 수집 의류는 전용 멸균 및 보강 전정 스팀 관리 공정을 거쳐 발송됩니다.
            </p>
            <div className="ml-8 border-l-2 border-[#8C624E]/15 pl-4 space-y-2.5">
              <p className="text-sm text-stone-700 leading-relaxed font-light">
                - 발송 타임프레임: <strong className="text-[#8C624E]">입금 확인 후 1영업일 ~ 3영업일 이내</strong> 신속 발송 완료<br />
                - 발송 추적 및 수령 시점은 배송사의 네트워크 사정에 따라 변동될 수 있습니다.
              </p>
            </div>
          </div>

          {/* Section 3 - Refund/Exchange */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-[#8C624E]">
              <RefreshCw className="w-5 h-5 shrink-0" />
              <h2 className="text-lg font-serif font-semibold text-[#2C302E]">3. 교환 및 환불 정밀 가이드</h2>
            </div>
            <p className="text-sm font-light text-stone-600 leading-relaxed pl-8">
              테오도르 수집품에 대한 정기 반품과 관련된 소비자 권리는 관련 법령을 충실하게 준수하되 빈티지 의상의 특수성을 고려합니다.
            </p>
            <div className="ml-8 space-y-3.5">
              <div className="bg-[#FAF7F0] p-4 border border-[#8C624E]/5 rounded-xs">
                <span className="block text-xs font-semibold text-stone-800 uppercase tracking-wider mb-1 font-mono">환불 신청 프레임</span>
                <span className="text-sm text-stone-600">
                  상품을 <strong>수령하신 날로부터 7일 이내</strong> 접수 및 절차가 개시되어야 합니다.
                </span>
              </div>
              <div className="bg-red-50/50 p-4 border border-red-200/55 rounded-xs">
                <span className="block text-xs font-semibold text-red-700 uppercase tracking-wider mb-1 font-mono">⚠️ 교환 및 환불이 불가능한 경우</span>
                <span className="text-sm text-red-800 leading-relaxed">
                  이벤트 및 고객 감사용으로 특별 배포되는 <strong>C급 나눔 상품, 하자가 사전 고지된 상품</strong>은 어떠한 경우에도 환불 및 보상이 절대 불가능하오니 실장의 기재를 꼼꼼하게 읽어보신 후 신청해주시기 바랍니다.
                </span>
              </div>
            </div>
          </div>

          {/* Section 4 - Contact */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-[#8C624E]">
              <Mail className="w-5 h-5 shrink-0" />
              <h2 className="text-lg font-serif font-semibold text-[#2C302E]">4. 문의 및 분쟁 고충의 해소</h2>
            </div>
            <p className="text-sm font-light text-stone-600 leading-relaxed pl-8 border-b border-[#FAF7F0] pb-6">
              웹 서비스 이용 시 발생하는 제반 고충이나 오류 보고, 가치 분쟁 조정에 관한 상담 메일은 24시간 실시간 모니터링 접수됩니다.
            </p>
            <div className="ml-8 flex items-center space-x-3 bg-stone-50 p-4 border border-stone-200/60 rounded-xs">
              <div className="bg-[#8C624E]/10 p-2 rounded-full text-[#8C624E]">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-xs text-stone-400">약관 관련 분쟁 및 제안 이메일</span>
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
