/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { AlertCircle, Calendar, ShieldCheck, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SiteSetting } from "../types";

interface NoticeProps {
  settings: SiteSetting | null;
}

export default function NoticeView({ settings }: NoticeProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const title = settings?.noticeTitle || "theodor_vintage 릴리즈 및 배송 안내";
  const text = settings?.noticeText || "모든 패브릭 빈티지 상품은 정밀 세탁 및 고온 스팀 살균 처리가 완료된 후 정성스레 배송됩니다. 수량이 오직 하나뿐인 빈티지 편집 특성상, 장바구니에 담아두시더라도 결제 완료 선착순으로 완판되오니 이 점 유의 부탁드립니다.";

  const faqItems = [
    {
      q: "모든 상품은 오직 한 개뿐인가요?",
      a: "네, 그렇습니다. theodor_vintage에서 엄선하여 선보이는 모든 의류 및 소품은 전 세계 빈티지 마켓과 경매, 앤틱 시장 등에서 바잉한 단 한 점만 존재하는 리미티드 수집품입니다.",
    },
    {
      q: "빈티지 의류의 위생이나 컨디션 관리는 어떻게 진행되나요?",
      a: "바잉된 의류는 원단에 최적화된 친환경 세탁 및 스팀 고온 특수 특허 살균을 마친 후 쇼룸에 피팅 및 개별 포장 보관됩니다. 수령하신 후 바로 안심하고 착용하셔도 무방할 만큼 엄격한 패키징 프로세스를 준수하고 있습니다.",
    },
    {
      q: "교환 및 환불 정책이 궁금합니다.",
      a: "세월이 머문 빈티지 의류 특성 상 착용 여부 판별이 어렵고 단 한 수량 뿐인 아이템의 구조적 제한으로 인하여 단순 변심 교환/반품은 불가능합니다. 각 제품 상세 하단에 안내된 치수 실측 및 상세 사진, 가죽/니트 에이징 마모 등의 안내 요소를 반드시 체크한 후 신중한 구매 결정을 권장해 드립니다.",
    },
    {
      q: "제품 주문 및 결제 방식은 어떻게 구성되나요?",
      a: "상세 페이지의 [Request Buying] 버튼 클릭 시 공식 이메일 또는 안내된 CS 가이드로 즉시 연결됩니다. 주문 메세지 수신 후 순차적으로 개별 가상계좌 및 입금 방식을 가이드 해드리며, 최종 결제일 기준 익일 안전 포장 배송 처리해 드리고 있습니다.",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      
      {/* Page Title */}
      <div className="text-center space-y-3">
        <span className="text-xs uppercase tracking-[0.4em] text-[#8C624E] font-semibold font-mono">Archive Announcements</span>
        <h1 className="text-4xl font-serif text-[#2C302E]">Announcements & Policies</h1>
        <div className="w-12 h-px bg-[#8C624E]/40 mx-auto mt-4" />
      </div>

      {/* Main Notice Jumbotron */}
      <div className="bg-[#FAF7F0] border-l-4 border-[#8C624E] p-8 sm:p-10 shadow-xs rounded-r-xs space-y-4">
        <div className="flex items-center space-x-2 text-[#8C624E]">
          <Calendar className="w-4 h-4" />
          <span className="text-xs tracking-widest uppercase font-mono font-bold">Latest Release Notice</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-serif text-[#2C302E] leading-relaxed">{title}</h2>
        <p className="text-stone-700 text-sm font-light leading-relaxed whitespace-pre-line pt-2">
          {text}
        </p>
      </div>

      {/* Laundering & Care Notice Card Group */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
        
        <div className="border border-stone-200/60 p-8 space-y-4 bg-white/40">
          <ShieldCheck className="w-8 h-8 text-[#1A3020]" />
          <h3 className="text-lg font-serif text-[#2C302E]">Care & Laundering Guidance</h3>
          <ul className="space-y-2.5 text-xs text-stone-500 font-light leading-snug">
            <li className="flex items-start">
              <span className="mr-2 text-[#1A3020]">&#10004;</span>
              <span><strong>Pure Cotton & Linen:</strong> 수축 현상을 피하기 위하여 이왕이면 30도 이하의 아기 세제 미온수 가벼운 손세탁 또는 울코스 세탁을 강력 고취 드립니다.</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-[#1A3020]">&#10004;</span>
              <span><strong>Vintage Leather & Suede:</strong> 절대 물세탁은 피해주시고 에이징 오염이 깊어졌을 때 가죽 컨디셔너 유분의 클리닝 타월 처리를 해주시거나 전문 레더 크리닝 케어 센터를 방문을 추천드립니다.</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-[#1A3020]">&#10004;</span>
              <span><strong>Knitwear & Premium Wool:</strong> 드라이클리닝 처리가 가장 우수하며, 세탁 시 울 전용 샴푸 중성 처리를 하신 뒤 비틀어 짜지 마시고 눕혀서 서늘하게 자연 바람으로 건조해 주시기 바랍니다.</span>
            </li>
          </ul>
        </div>

        <div className="border border-stone-200/60 p-8 space-y-4 bg-white/40">
          <AlertCircle className="w-8 h-8 text-[#8C624E]" />
          <h3 className="text-lg font-serif text-[#2C302E]">Vintage Shopping Checklist</h3>
          <ul className="space-y-2.5 text-xs text-stone-500 font-light leading-snug">
            <li className="flex items-start">
              <span className="mr-2 text-[#8C624E]">&#183;</span>
              <span>빈티지 의류는 긴 실질적인 소장 역사에 기인하여 새 옷과는 다른 고유한 미완성적인 마모, 자연스러운 워싱 톤, 미세 수선 자국 등이 발견될 수 있습니다.</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-[#8C624E]">&#183;</span>
              <span>어깨 너비나 품 실측 등은 기재된 센티미터 단위를 면밀히 참고해 보셔서, 현재 본인의 평소 최적 의류 핏 측정 사이즈와 직접 비대조 하시는 것이 환불 문제를 미연에 차단할 수 있는 가장 우수한 바잉 노하우입니다.</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-[#8C624E]">&#183;</span>
              <span>품절 여부를 알 수 있게 `SOLD OUT`이 기재된 상품은 단 한 분의 구매자 정산이 완료된 즉시 입금 소화가 진행되었음을 투명하게 나타냅니다.</span>
            </li>
          </ul>
        </div>

      </div>

      {/* FAQ Accordions Section */}
      <div className="space-y-6 pt-10">
        <div className="flex items-center space-x-2 border-b border-stone-200 pb-3 justify-center md:justify-start">
          <HelpCircle className="w-5 h-5 text-[#8C624E]" />
          <h3 className="text-xl font-serif text-[#2C302E]">Frequently Asked Questions</h3>
        </div>

        <div className="space-y-4">
          {faqItems.map((item, idx) => (
            <div key={idx} className="border-b border-stone-200/60 pb-4">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex justify-between items-center text-left py-3 focus:outline-hidden group"
              >
                <span className="text-sm font-medium text-[#2C302E] group-hover:text-[#8C624E] transition-colors pr-4">
                  {item.q}
                </span>
                {openFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-stone-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />
                )}
              </button>

              <AnimatePresence>
                {openFaq === idx && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <p className="text-stone-500 text-xs font-light leading-relaxed pl-2 pr-6 pb-2 pt-1 whitespace-pre-line">
                      {item.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
