/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Instagram, Send, Sparkles, X, Mail, Phone, Clock, FileText, RefreshCw, ShieldAlert } from "lucide-react";
import { SiteSetting } from "../types";
import Logo from "./Logo";

interface FooterProps {
  settings: SiteSetting | null;
  setActivePage: (p: any) => void;
}

type PolicyType = "privacy" | "terms" | "refund" | "contact" | null;

export default function Footer({ settings, setActivePage }: FooterProps) {
  const instagram = settings?.instagramUrl || "https://instagram.com/theodor_vintage";
  const contact = settings?.contactUrl || "mailto:jongminsin81@gmail.com";
  const [activeModal, setActiveModal] = useState<PolicyType>(null);

  const openModal = (type: PolicyType) => {
    setActiveModal(type);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setActiveModal(null);
    document.body.style.overflow = "unset";
  };

  return (
    <footer className="bg-[#2C302E] text-[#FAF7F0] border-t border-[#1C1F1D] py-16 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        
        {/* Brand Brief */}
        <div className="space-y-4">
          <button 
            onClick={() => setActivePage("Home")} 
            className="flex items-center space-x-3 text-left hover:opacity-90 transition-opacity focus:outline-hidden cursor-pointer"
            title="theodor_vintage"
          >
            <Logo className="h-14 w-auto" />
            <span className="text-xl font-serif font-medium tracking-widest text-[#FAF7F0] lowercase">theodor_vintage</span>
          </button>
          <p className="text-sm text-[#FAF7F0]/60 max-w-sm font-light leading-relaxed">
            Curated vintage pieces for your own mood. We travel worldwide to collect authentic designs from past decades, keeping stories and aesthetics alive.
          </p>
          <div className="flex space-x-4 pt-2">
            <a
              href={instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FAF7F0]/60 hover:text-[#FAF7F0] transition-colors p-2 bg-[#FAF7F0]/5 hover:bg-[#FAF7F0]/10 rounded-full"
              id="footer-insta-btn"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              href={contact}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FAF7F0]/60 hover:text-[#FAF7F0] transition-colors p-2 bg-[#FAF7F0]/5 hover:bg-[#FAF7F0]/10 rounded-full"
              id="footer-email-btn"
            >
              <Send className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Directory links */}
        <div className="space-y-4">
          <h4 className="text-xs uppercase tracking-widest text-[#FAF7F0]/40 font-semibold">Store Directory</h4>
          <ul className="space-y-2.5 text-sm font-light">
            <li>
              <button onClick={() => setActivePage("Home")} className="hover:text-[#8C624E] text-[#FAF7F0]/80 transition-colors cursor-pointer text-left">
                Home / Main
              </button>
            </li>
            <li>
              <button onClick={() => setActivePage("Shop")} className="hover:text-[#8C624E] text-[#FAF7F0]/80 transition-colors cursor-pointer text-left">
                Collection Shop
              </button>
            </li>
            <li>
              <button onClick={() => setActivePage("About")} className="hover:text-[#8C624E] text-[#FAF7F0]/80 transition-colors cursor-pointer text-left">
                Branding Story
              </button>
            </li>
            <li>
              <button onClick={() => setActivePage("Notice")} className="hover:text-[#8C624E] text-[#FAF7F0]/80 transition-colors cursor-pointer text-left">
                Shop Announcement
              </button>
            </li>
          </ul>
        </div>

        {/* Curation Info */}
        <div className="space-y-4 text-xs tracking-wide text-[#FAF7F0]/50 font-light leading-6">
          <h4 className="text-xs uppercase tracking-widest text-[#FAF7F0]/40 font-semibold mb-2">Theodor Office</h4>
          <p>theodor_vintage, CEO: Theodor L. | Business No: 120-vintage-88</p>
          <p>Address: 1106 2-sunhwan-ro, Heungdeok-gu, Cheongju-si, Chungcheongbuk-do, South Korea</p>
          <p>CS: AM11:00 - PM17:00 (Weekend and Holiday Off)</p>
          <p className="flex items-center space-x-1 pt-1 text-[#8C624E]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated with sustainable values and vintage soul.</span>
          </p>
        </div>

      </div>

      <div className="max-w-7xl mx-auto border-t border-[#FAF7F0]/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-[#FAF7F0]/40 font-light space-y-4 md:space-y-0">
        <div>
          &copy; {new Date().getFullYear()} theodor_vintage. All rights reserved. Registered in Cloud Instance.
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center">
          <button 
            onClick={() => setActivePage("Privacy")} 
            className="hover:text-[#FAF7F0] transition-colors cursor-pointer font-medium hover:underline text-[11px] sm:text-xs"
          >
            개인정보처리방침
          </button>
          <button 
            onClick={() => setActivePage("Terms")} 
            className="hover:text-[#FAF7F0] transition-colors cursor-pointer font-medium hover:underline text-[11px] sm:text-xs"
          >
            이용약관
          </button>
          <button 
            onClick={() => openModal("refund")} 
            className="hover:text-[#FAF7F0] transition-colors cursor-pointer font-medium hover:underline text-[11px] sm:text-xs"
          >
            환불/교환 정책
          </button>
          <button 
            onClick={() => openModal("contact")} 
            className="hover:text-[#FAF7F0] transition-colors cursor-pointer font-medium hover:underline text-[11px] sm:text-xs flex items-center space-x-1"
          >
            <Mail className="w-3.5 h-3.5 inline mr-0.5" />
            <span>고객문의</span>
          </button>
        </div>
      </div>

      {/* Styled Interactive Policy Modal Backdrop Overlay */}
      {activeModal && (
        <div 
          onClick={closeModal}
          className="fixed inset-0 bg-[#2C302E]/80 backdrop-blur-xs flex items-center justify-center z-[999] p-4 transition-all animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FDFBF7] border border-[#8C624E]/15 rounded-sm max-w-lg w-full max-h-[80vh] overflow-y-auto flex flex-col shadow-2xl relative animate-scale-up"
          >
            {/* Header */}
            <div className="p-6 sticky top-0 bg-[#FDFBF7] border-b border-[#FAF7F0] flex items-center justify-between">
              <div className="flex items-center space-x-2 text-[#8C624E]">
                {activeModal === "privacy" && <ShieldAlert className="w-5 h-5" />}
                {activeModal === "terms" && <FileText className="w-5 h-5" />}
                {activeModal === "refund" && <RefreshCw className="w-5 h-5" />}
                {activeModal === "contact" && <Mail className="w-5 h-5" />}
                
                <h3 className="font-serif font-bold text-sm uppercase tracking-wider text-[#2C302E]">
                  {activeModal === "privacy" && "개인정보처리방침 (Privacy Policy)"}
                  {activeModal === "terms" && "이용약관 (Terms of Use)"}
                  {activeModal === "refund" && "환불 및 교환 정책 (Refund & Exchange)"}
                  {activeModal === "contact" && "고객문의 (Customer Support)"}
                </h3>
              </div>
              
              <button 
                onClick={closeModal}
                className="text-stone-400 hover:text-stone-700 p-1.5 hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
                title="닫기"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Contents */}
            <div className="p-6 sm:p-8 overflow-y-auto text-xs sm:text-sm text-stone-600 font-sans leading-relaxed space-y-5">
              {activeModal === "privacy" && (
                <div className="space-y-4">
                  <p className="text-stone-500 italic pb-2 border-b border-[#FAF7F0]">
                    테오도르 빈티지(theodor_vintage)는 이용자의 소중한 개인정보를 안전하게 보호하며 관련 법령을 엄격히 준수합니다.
                  </p>
                  <div>
                    <h4 className="font-bold text-[#2C302E] mb-1 font-serif text-xs uppercase tracking-wider">1. 개인정보 수집 및 목적</h4>
                    <p className="pl-3 border-l-2 border-[#8C624E]/20">
                      - 수집 항목: 성명, 연락처(휴대전화번호), 배송지 주소, 전자우편(이메일), 구매 내역 및 결제 증빙 정보<br />
                      - 수집 목적: 구매 상품 발송, 주문 내역 관리, 대금 결제 정산, 고객 문의에 대한 신속한 응답 및 비대면 상담 서비스 제공
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#2C302E] mb-1 font-serif text-xs uppercase tracking-wider">2. 보유 및 이용기간</h4>
                    <p className="pl-3 border-l-2 border-[#8C624E]/20">
                      - 원칙적으로 개인정보의 수집 목적이 달성되면 즉시 파기합니다.<br />
                      - 다만, 전자상거래 등에서의 소비자보호에 관한 법률 등 관계법령에 근거하여 계약 및 청약철회, 대금 결재 관련 기록은 최대 5년간 엄격히 보관됩니다.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#2C302E] mb-1 font-serif text-xs uppercase tracking-wider">3. 정보주체의 권리 및 관리책임자</h4>
                    <p className="pl-3 border-l-2 border-[#8C624E]/20">
                      이용자는 언제든지 본인의 개인정보에 대하여 열람, 수정, 파기 요청을 하실 수 있으며, 개인정보 보호책임자 메일(<span className="font-mono text-[#8C624E]">jongminsin81@gmail.com</span>)로 이의 제기 및 요청을 전달하시는 경우 신속하게 처리해 드립니다.
                    </p>
                  </div>
                </div>
              )}

              {activeModal === "terms" && (
                <div className="space-y-4">
                  <p className="text-stone-500 italic pb-2 border-b border-[#FAF7F0]">
                    테오도르 빈티지 서비스 이용 약관은 당사 및 회원 여러분 간의 상호 고귀한 신의와 원칙을 정의합니다.
                  </p>
                  <div>
                    <h4 className="font-bold text-[#2C302E] mb-1 font-serif text-xs uppercase tracking-wider">1. 목적 및 거래 규정</h4>
                    <p className="pl-3 border-l-2 border-[#8C624E]/20">
                      본 약관은 테오도르(theodor_vintage)가 운영하는 아카이브 의류 온라인 유통 서비스의 기본 이용 조건과 절차를 명문화합니다.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#2C302E] mb-1 font-serif text-xs uppercase tracking-wider">2. 빈티지 의류의 성질</h4>
                    <p className="pl-3 border-l-2 border-[#8C624E]/20">
                      - 테오도르에서 매매 중개되거나 판매 대행되는 아카이브 의류들은 기성 제조품과 달리, 이미 세월을 한 번 통과해 나온 수집품 형태의 빈티지 의류입니다.<br />
                      - 이에 기인한 에이징(미세 상처, 탈색, 사용 흔적)은 제품 불량으로 취급되지 않으며, 독자적인 아카이브 가치로 간주됩니다.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#2C302E] mb-1 font-serif text-xs uppercase tracking-wider">3. 회원 규약 및 면책</h4>
                    <p className="pl-3 border-l-2 border-[#8C624E]/20">
                      부정한 인증 정보 도용, 반복적인 이상 행동, 허위 거래 발생 시 이용 자격이 영구 정지될 수 있으며 정보통신망법에 의거하여 형사적인 불이익을 당할 수 있습니다.
                    </p>
                  </div>
                </div>
              )}

              {activeModal === "refund" && (
                <div className="space-y-4">
                  <p className="text-stone-500 italic pb-2 border-b border-[#FAF7F0]">
                    테오도르 빈티지의 의류들은 오직 세상에 단 하나뿐인 희귀 빈티지 아카이브로 구성되어 있습니다.
                  </p>
                  <div className="bg-amber-50/50 p-4 border border-amber-200/50 rounded-xs space-y-2">
                    <p className="font-semibold text-[#8C624E] text-[11px] uppercase tracking-wider font-mono">⚠️ 반드시 확인해 주세요</p>
                    <p className="text-stone-600 text-xs leading-relaxed">
                      모든 제품이 희귀 셀렉션 및 아카이브 의상으로 구성되어 있어, 세월의 흐름에 따른 미세한 자연 에이징 흔적이 당연히 수반됩니다. 단순 변심(소재 불만족, 실측 오차, 주관적인 변색 등)으로 인한 환불 및 교환은 원칙적으로 불가합니다.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#2C302E] mb-1 font-serif text-xs uppercase tracking-wider">교환 및 환불 가능 경우</h4>
                    <p className="pl-3 border-l-2 border-[#8C624E]/20">
                      - 제품 입고 시 검수 단계에서 통보되지 않았던 찢어짐이나 치명적인 손궤가 발생해 착용이 전면 불가능한 경우<br />
                      - 판매 상품 사양과 전적으로 다른 패키지나 잘못된 규격이 수령되었을 경우<br />
                      - 상기 명시된 하자는 <strong>상품 수령 이후 24시간 이내</strong> 즉시 <span className="font-bold font-mono text-[#8C624E]">jongminsin81@gmail.com</span> 으로 소장하신 사진과 상세 이유를 첨부하여 접수하셔야 환불 또는 적립금 전환으로 구제를 해 드립니다.
                    </p>
                  </div>
                </div>
              )}

              {activeModal === "contact" && (
                <div className="space-y-5">
                  <p className="text-stone-500 italic pb-2 border-b border-[#FAF7F0]">
                    소장 연도, 착용 사이즈 확인, 커스텀 바잉 제안, 주문 변경 등 사사로운 이야기도 언제나 깊이 경청합니다.
                  </p>
                  
                  <div className="grid grid-cols-1 gap-3">
                    <a 
                      href={`mailto:jongminsin81@gmail.com`}
                      className="bg-stone-50 hover:bg-stone-100 border border-stone-200/60 p-4 rounded-xs flex items-center space-x-3 transition-colors text-left cursor-pointer"
                    >
                      <div className="bg-[#8C624E]/10 p-2.5 rounded-full text-[#8C624E]">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-stone-800 text-xs">공식 이메일 문의 접수</h4>
                        <p className="text-[11px] text-stone-500 mt-0.5">jongminsin81@gmail.com</p>
                      </div>
                    </a>

                    <div className="bg-stone-50 border border-stone-200/60 p-4 rounded-xs flex items-center space-x-3 text-left">
                      <div className="bg-[#8C624E]/10 p-2.5 rounded-full text-[#8C624E]">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-stone-800 text-xs">고객안내 센터 운영 시간</h4>
                        <p className="text-[11px] text-stone-500 mt-0.5">평일 오전 11:00 - 오후 17:00 (주말 & 공휴일 휴무)</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-stone-400 text-center font-light pt-2">
                    접수된 메일은 24시간 이내에 담당자가 친절하게 회신 드리고 있습니다.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-stone-50 border-t border-[#FAF7F0] flex justify-end">
              <button 
                onClick={closeModal}
                className="bg-[#2C302E] hover:bg-[#8C624E] text-[#FAF7F0] text-xs font-semibold py-2 px-5 rounded-xs cursor-pointer transition-colors"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}

