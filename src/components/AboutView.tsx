/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Sparkles, Calendar, Heart, ShieldAlert, BadgeCheck } from "lucide-react";
import { motion } from "motion/react";

export default function AboutView() {
  const steps = [
    {
      title: "01 / Premium Sourcing",
      desc: "유행을 단지 쫓지 않는 고유한 안목으로, 파리, 도쿄, 밀라노 등의 클래식 마켓과 수집가 채널을 통해 역사와 디자인 가치를 지닌 의류만을 개별 실사 셀렉팅합니다.",
      icon: Calendar,
    },
    {
      title: "02 / Rigorous Inspection",
      desc: "단추 분실, 실밥 해짐, 오염 여부를 철저하게 다각도로 정밀 검수하고 미세한 하자 요소가 발견되는 부분은 숙련된 명장의 정밀 편직 보강 처리를 먼저 거칩니다.",
      icon: ShieldAlert,
    },
    {
      title: "03 / Eco-Laundering & Sterilization",
      desc: "원단을 헤치지 않는 최고급 친환경 오가닉 세제를 활용한 손세탁 및 저온 풍량 건조, 그리고 150도 가량의 특허 받은 복사 스팀 가스 살균 소독을 완료하여 냄새와 세균 로스를 전격 제거합니다.",
      icon: BadgeCheck,
    },
    {
      title: "04 / Custom Sizing & Archiving",
      desc: "평면 측정뿐만 아니라 마네킹 입체 피팅을 전개하여 실장 치수를 정교하게 측정해 표기합니다. 상품에 깃든 역사적인 오리진 뉘앙스 정보와 코디네이션을 함께 정밀 기록합니다.",
      icon: Sparkles,
    },
  ];

  return (
    <div className="space-y-24 pb-24">
      
      {/* Hero Header */}
      <section className="relative py-24 sm:py-32 bg-[#FAF7F0] text-center border-b border-[#FAF7F0] overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#8C624E] rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#1A3020] rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 space-y-6">
          <span className="text-xs uppercase tracking-[0.45em] text-[#8C624E] font-bold font-mono">Boutique Brand Origin</span>
          <h1 className="text-4xl sm:text-6xl font-serif text-[#2C302E]">Our Story & Philosophy</h1>
          <p className="text-sm sm:text-base text-stone-500 max-w-xl mx-auto leading-relaxed font-light">
            한 옷에 담긴 흘러간 시간과 소박하면서도 깊이 있는 패브릭 무늬를 새로운 소유자의 감각과 결합해 단 하나의 특별한 이야기를 창조하는 수집 예술, 디오도어 빈티지입니다.
          </p>
        </div>
      </section>

      {/* Philosophy with layout columns */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-6">
          <span className="text-xs uppercase tracking-widest text-[#8C624E] font-mono">Why we care</span>
          <h2 className="text-3xl sm:text-4.5xl font-serif text-[#2C302E] leading-tight font-medium">
            “Curated vintage pieces for your own mood.”
          </h2>
          <div className="space-y-4 text-stone-600 font-light text-sm leading-relaxed">
            <p>
              동시대의 스파 브랜드와 패스트 패션은 우리에게 무한한 선택지를 주는 것처럼 보이지만, 사실은 일주일에 한 번씩 수십만 벌의 유행을 강제 주입하여 개성을 평균화시키고 있을 뿐입니다.
            </p>
            <p>
              Theodor Vintage는 수십 년 전, 누군가의 진실한 자부심이자 추억이었을 엄격한 테일러 디테일, 단단한 패브릭, 독창적인 무드를 정밀 수집합니다. 옷에 고인 빛깔과 상처는 어설픈 모방이 불가능한 우수한 예술품이 됩니다.
            </p>
            <p>
              우리는 단지 중고 의류를 상업 판매하는 것에 그치지 않고, 옷을 복원하는 친환경적인 태도, 가치 보전에 동조하는 빈티지적 삶의 방식 자체를 지지하며 새로운 소장품 컬렉팅을 안내합니다.
            </p>
          </div>
        </div>

        <div className="relative aspect-4/3 bg-stone-100 p-3 border border-[#8C624E]/10">
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=850&q=80"
            alt="vintage items curation shop cabinet"
            className="w-full h-full object-cover filter contrast-102 hover:opacity-95 transition-opacity"
            referrerPolicy="no-referrer"
          />
        </div>
      </section>

      {/* Sourcing / Curation Procedure Steps Grid */}
      <section className="bg-[#FAF7F0] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-3">
            <span className="text-xs uppercase tracking-widest text-[#8C624E] font-mono">Curator Standard</span>
            <h2 className="text-3xl font-serif text-[#2C302E] tracking-wide font-medium">Strict Quality Control</h2>
            <p className="text-xs text-stone-500 font-light max-w-sm mx-auto">
              고객 여러분께서 의류를 수령하시고 바로 입으실 수 있도록 거치는 프리미엄 전정 케어 공정입니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={idx} className="bg-[#FDFBF7] p-8 border border-stone-200/50 shadow-xs space-y-4">
                  <div className="w-10 h-10 bg-[#8C624E]/10 rounded-full flex items-center justify-center">
                    <Icon className="w-5 h-5 text-[#8C624E]" />
                  </div>
                  <h3 className="text-lg font-serif text-[#2C302E] font-medium">{step.title}</h3>
                  <p className="text-stone-500 text-xs font-light leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
}
