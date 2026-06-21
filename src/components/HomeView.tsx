/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ArrowRight, BookOpen, Star, Instagram, Mail, Sparkles, AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import { Product, SiteSetting, ActivePage, MoodCard } from "../types";

interface HomeViewProps {
  products: Product[];
  settings: SiteSetting | null;
  moodCards: MoodCard[];
  setActivePage: (p: ActivePage) => void;
  setDetailedProductId: (id: string | null) => void;
}

export default function HomeView({
  products,
  settings,
  moodCards,
  setActivePage,
  setDetailedProductId,
}: HomeViewProps) {
  const heroUrl = settings?.heroImageUrl || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80";
  const title = settings?.noticeTitle || "theodor_vintage 가을 시즌 안내";
  const text = settings?.noticeText || "새로 드롭된 가을 아카이브 아이팀들을 지금 컬렉션 숍에서 감상하실 수 있습니다.";
  const instagram = settings?.instagramUrl || "https://instagram.com/theodor_vintage";
  const contact = settings?.contactUrl || "mailto:jongminsin81@gmail.com";

  // New Drop: Last 3 sorted by creation
  const newDrops = [...products]
    .sort((a, b) => new Date(b.createdAt as any).getTime() - new Date(a.createdAt as any).getTime())
    .slice(0, 3);

  // Recommended Vintage
  const recommended = products.filter((p) => p.isRecommended).slice(0, 4);

  // Filter and sort active cards
  const activeMoodCards = [...moodCards]
    .filter((c) => c.isActive)
    .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));

  const viewProduct = (id: string) => {
    setDetailedProductId(id);
    setActivePage("ProductDetail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const formattedPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW" }).format(price);
  };

  return (
    <div className="space-y-20 pb-20">
      
      {/* 1. HERO BANNER */}
      <section className="relative h-[80vh] w-full flex items-center justify-center overflow-hidden bg-stone-900">
        <div className="absolute inset-0 z-0">
          <img
            src={heroUrl}
            alt="theodor_vintage banner"
            className="w-full h-full object-cover opacity-60 filter grayscale-10 scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-linear-to-t from-[#FDFBF7] via-transparent to-black/30" />
        </div>

        <div className="relative z-10 text-center max-w-4xl px-4 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="space-y-6"
          >
            <span className="text-xs tracking-[0.4em] text-white/80 uppercase font-light">The Aesthetic Curation</span>
            <h1 className="text-5xl md:text-7xl lg:text-8xl italic font-serif-vintage tracking-wider text-white">
              theodor_vintage
            </h1>
            <p className="text-lg md:text-xl font-serif text-[#FAF7F0]/95 max-w-xl mx-auto italic font-light tracking-wide">
              “Curated vintage pieces for your own mood.”
            </p>
            <div className="pt-6">
              <button
                onClick={() => setActivePage("Shop")}
                className="inline-flex items-center space-x-2 bg-[#FAF7F0] text-[#2C302E] font-medium tracking-widest text-xs uppercase px-8 py-4 shadow-xl hover:bg-[#8C624E] hover:text-white transition-all cursor-pointer rounded-xs"
                id="hero-shop-btn"
              >
                <span>Browse Collections</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. TODAY'S NOTICE & EVENT CONTAINER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-[#FAF7F0] border border-[#8C624E]/10 p-6 sm:p-10 rounded-xs space-y-8 shadow-xs"
        >
          {/* Today's Notice Section */}
          <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${settings?.isEventActive ? "pb-8 border-b border-[#8C624E]/10" : ""}`}>
            <div className="space-y-2.5 max-w-4xl text-left">
              <span className="inline-flex items-center text-xs uppercase tracking-widest text-[#8C624E] font-semibold font-mono">
                <AlertCircle className="w-3.5 h-3.5 mr-1.5" />
                TODAY'S NOTICE
              </span>
              <h3 className="text-lg sm:text-xl font-serif text-[#2C302E] leading-snug">{title}</h3>
              <p className="text-sm text-[#2C302E]/70 font-light leading-relaxed">
                {text}
              </p>
            </div>
            <button
              onClick={() => setActivePage("Notice")}
              className="inline-flex items-center space-x-1.5 text-xs text-[#8C624E] uppercase tracking-widest border-b border-[#8C624E]/30 pb-0.5 hover:border-[#8C624E] font-semibold transition-all shrink-0 cursor-pointer"
            >
              <span>Read Full Notice</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Active Event Slot (If Active is True) */}
          {settings?.isEventActive && (
            <div className="pt-2">
              <div className="relative overflow-hidden bg-[#2D4236] text-white p-6 sm:p-8 rounded-xs flex flex-col md:flex-row justify-between items-stretch gap-6 md:gap-8 shadow-2xs">
                {/* Elegant pattern */}
                <div className="absolute inset-0 z-0 opacity-5 bg-[radial-gradient(#FAF7F0_1px,transparent_1px)] [background-size:16px_16px]" />
                
                <div className="relative z-10 flex-1 flex flex-col justify-between space-y-4 md:space-y-6">
                  <div className="space-y-3 text-left">
                    <div className="flex items-center space-x-2">
                      <span className="inline-block bg-[#8C624E] text-[#FAF7F0] text-[9px] uppercase tracking-[0.2em] font-bold px-2.5 py-1 font-mono rounded-2xs">
                        CURRENT EVENT
                      </span>
                      {settings.eventBadge && (
                        <span className="inline-block bg-[#FAF7F0]/15 text-[#FAF7F0] text-[9px] uppercase tracking-[0.15em] font-light px-2.5 py-1 font-mono rounded-2xs">
                          {settings.eventBadge}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-serif tracking-wide leading-tight font-medium">
                      {settings.eventTitle || "Special Archive Event"}
                    </h3>
                    {settings.eventText && (
                      <p className="text-xs sm:text-sm text-[#FAF7F0]/80 font-light leading-relaxed max-w-2xl whitespace-pre-line">
                        {settings.eventText}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 text-left">
                    {settings.eventLink ? (
                      <a
                        href={settings.eventLink}
                        target={settings.eventLink.startsWith("http") ? "_blank" : "_self"}
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 bg-[#FAF7F0] hover:bg-[#8C624E] text-[#2C302E] hover:text-white transition-all text-xs font-semibold uppercase tracking-widest px-6 py-3 rounded-xs"
                      >
                        <span>View Event Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <button
                        onClick={() => setActivePage("Shop")}
                        className="inline-flex items-center space-x-2 bg-[#FAF7F0] hover:bg-[#8C624E] text-[#2C302E] hover:text-white transition-all text-xs font-semibold uppercase tracking-widest px-6 py-3 rounded-xs cursor-pointer"
                      >
                        <span>Explore Event Items</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {settings.eventImageUrl && (
                  <div className="relative z-10 w-full md:w-[260px] lg:w-[320px] aspect-[16/10] md:aspect-[4/3] rounded-xs overflow-hidden border border-[#FAF7F0]/15 shadow-md shrink-0 group">
                    <img
                      src={settings.eventImageUrl}
                      alt={settings.eventTitle || "Event banner"}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500" />
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </section>

      {/* 3. NEW DROP SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-10 border-b border-[#FAF7F0] pb-6">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-[0.25em] text-[#8C624E] font-mono">Recent Release</span>
            <h2 className="text-3xl font-serif text-[#2C302E] tracking-wide">New Drop</h2>
          </div>
          <button
            onClick={() => setActivePage("Shop")}
            className="text-xs uppercase tracking-widest text-[#2C302E]/60 hover:text-[#8C624E] transition-colors flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {newDrops.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group cursor-pointer"
              onClick={() => viewProduct(product.id)}
            >
              <div className="relative aspect-3/4 overflow-hidden mb-4 bg-stone-100 border border-[#FAF7F0]">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                
                {product.isSoldOut && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-white border border-white px-4 py-1.5 text-xs tracking-widest uppercase">
                      Sold out
                    </span>
                  </div>
                )}
                
                {product.isRecommended && !product.isSoldOut && (
                  <div className="absolute top-3 left-3 bg-[#1A3020] text-white px-2.5 py-1 text-[10px] tracking-widest uppercase flex items-center space-x-1 font-mono">
                    <Sparkles className="w-3 h-3" />
                    <span>Curation</span>
                  </div>
                )}
              </div>
              <div className="space-y-1.5 text-center">
                <span className="text-[10px] uppercase tracking-widest text-[#2C302E]/50 font-mono">
                  {product.category} &middot; Size {product.size}
                </span>
                <h3 className="text-base font-medium text-[#2C302E] font-serif group-hover:text-[#8C624E] transition-colors">
                  {product.name}
                </h3>
                <p className="text-sm font-semibold text-[#8C624E]">
                  {formattedPrice(product.price)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. RECOMMENDATIONS (BENTO/FLEX) */}
      <section className="bg-[#FAF7F0] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2 mb-16">
            <span className="text-xs uppercase tracking-[0.3em] text-[#8C624E] font-mono">Curator's Choice</span>
            <h2 className="text-3.5xl font-serif text-[#2C302E] tracking-wide font-medium">Recommended Vintage</h2>
            <div className="w-12 h-px bg-[#8C624E]/40 mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {recommended.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="group cursor-pointer space-y-3 bg-[#FDFBF7] p-3 border border-[#8C624E]/5 shadow-xs"
                onClick={() => viewProduct(product.id)}
              >
                <div className="aspect-square relative overflow-hidden bg-stone-100">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  {product.isSoldOut && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white text-[10px] border border-white px-3 py-1 font-mono tracking-widest uppercase">
                        SOLD
                      </span>
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] uppercase tracking-widest font-mono text-stone-400">
                    {product.condition.split(":")[0]} Condition
                  </span>
                  <h3 className="text-sm font-medium text-[#2C302E] truncate font-serif">
                    {product.name}
                  </h3>
                  <p className="text-xs font-semibold text-[#8C624E]">
                    {formattedPrice(product.price)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. ABOUT BRAND INTRO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <span className="text-xs uppercase tracking-[0.34em] text-[#8C624E] font-mono flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#1A3020]" />
            <span>brand philosophy</span>
          </span>
          <h2 className="text-4xl font-serif text-[#2C302E] leading-tight">
            About <span className="italic font-normal">theodor_vintage</span>
          </h2>
          <div className="space-y-4 text-[#2C302E]/80 text-sm font-light leading-relaxed">
            <p>
              우리는 가치 있는 빈티지 피스들이 단지 낡고 오래된 옷이 아닌, 한 사람의 고유한 분위기와 무드를 완성하는 개성 어린 하나의 조각이라고 대합니다.
            </p>
            <p>
              동시대의 획일화된 패션에서 소외된, 고유한 패브릭 짜임, 세월 속에서 자연스럽게 가공된 색감, 그리고 이전 소유자의 숨결이 머문 수작업 스티치 등을 세밀히 분석하여 가장 완벽한 상태로 세탁/살균하여 선보입니다.
            </p>
            <p className="text-[#1A3020] font-normal italic font-serif">
              "Curated with strict ethics and nostalgic eye."
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => setActivePage("About")}
              className="inline-flex items-center space-x-2 text-xs uppercase tracking-widest text-[#8C624E] border-b border-[#8C624E] pb-1 hover:text-[#2C302E] hover:border-[#2C302E] transition-all cursor-pointer font-medium"
            >
              <span>Our Full Curation Story</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="relative aspect-4/3 bg-stone-200 border border-[#FAF7F0] p-4"
        >
          <img
            src="https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80"
            alt="theodor curation studio"
            className="w-full h-full object-cover filter contrast-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute -bottom-6 -left-6 bg-[#1A3020] text-white p-6 hidden sm:block max-w-[240px] shadow-lg">
            <p className="font-serif italic text-base">"A piece from history, curated uniquely for your custom mood."</p>
          </div>
        </motion.div>
      </section>

      {/* 6. INSTAGRAM ARCHIVE PREVIEW GRID */}
      <section id="instagram-archive-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center space-y-3 mb-10">
          <span className="text-xs uppercase tracking-[0.3em] font-mono text-[#8C624E]">Social Archive</span>
          <h2 className="text-3.5xl font-serif text-[#2C302E] tracking-wide font-medium">@theodor_vintage</h2>
          <p className="text-xs text-[#2C302E]/60 max-w-md mx-auto leading-relaxed">
            인스타그램 피드에서 제안하는 감각적인 빈티지 레이어링과 아날로그 무드 아카이브를 만나보세요. 이미지를 클릭하면 공식 채널로 이동합니다.
          </p>
          <div className="w-12 h-px bg-[#8C624E]/20 mx-auto mt-2" />
        </div>

        <div id="instagram-feed-grid" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {activeMoodCards.map((post, idx) => (
            <motion.a
              key={post.id || idx}
              id={`instagram-archive-item-${idx}`}
              href={post.linkUrl || instagram}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05, duration: 0.5 }}
              className="group relative aspect-square bg-[#FAF7F0] overflow-hidden border border-[#8C624E]/5 block rounded-xs shadow-xs hover:shadow-md transition-all duration-300"
            >
              <img
                src={post.imageUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&q=80"}
                alt={post.title || `Instagram vintage mood ${idx + 1}`}
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500 filter brightness-[0.98] contrast-[1.02]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-[#1A3020]/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-3 text-center">
                <Instagram className="w-5 h-5 text-[#FAF7F0] mb-2 transform scale-90 group-hover:scale-100 transition-transform duration-300" />
                <span className="text-[10px] text-[#FAF7F0]/90 uppercase tracking-widest font-mono font-semibold">
                  {post.title}
                </span>
                <span className="text-[9px] text-[#FAF7F0]/80 mt-1 font-sans font-medium line-clamp-1">
                  {post.tags}
                </span>
                <span className="text-[9px] text-[#FAF7F0]/50 mt-1 font-mono tracking-wider">
                  View Card
                </span>
              </div>
            </motion.a>
          ))}
        </div>
      </section>

      {/* 7. INSTAGRAM / CONTACT SECTION */}
      <section className="bg-[#1A3020] text-[#FAF7F0] py-16 text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          <h2 className="text-2xl sm:text-3.5xl font-serif text-[#FAF7F0] tracking-wide font-light">Join the Theodor Vintage Archive</h2>
          <p className="text-sm text-[#FAF7F0]/70 font-light max-w-xl mx-auto leading-relaxed">
            인스타그램 팔로우를 통해 매주 진행되는 드롭 스포일러와 전 세계 빈티지 마켓 바잉 일정을 가장 먼저 확인해 보세요.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            <a
              href={instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center space-x-2 bg-[#FAF7F0] text-[#1A3020] hover:bg-[#8C624E] hover:text-white transition-colors tracking-widest text-xs uppercase px-8 py-3.5 font-medium w-full sm:w-auto"
            >
              <Instagram className="w-4 h-4" />
              <span>Instagram @theodor_vintage</span>
            </a>
            <a
              href={contact}
              className="inline-flex items-center justify-center space-x-2 border border-[#FAF7F0]/30 text-[#FAF7F0] hover:bg-white/10 hover:border-[#FAF7F0] transition-colors tracking-widest text-xs uppercase px-8 py-3.5 font-medium w-full sm:w-auto"
            >
              <Mail className="w-4 h-4" />
              <span>Inquire via Email</span>
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
