/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { Search, Filter, Sparkles, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { motion } from "motion/react";
import { Product, ActivePage } from "../types";

interface ShopViewProps {
  products: Product[];
  setActivePage: (p: ActivePage) => void;
  setDetailedProductId: (id: string | null) => void;
}

export default function ShopView({ products, setActivePage, setDetailedProductId }: ShopViewProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCondition, setSelectedCondition] = useState("All");
  const [hideSoldOut, setHideSoldOut] = useState(false);
  const [onlyRecommended, setOnlyRecommended] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "price-asc" | "price-desc">("newest");

  // Filter Categories
  const categories = ["All", "Tops", "Dresses", "Outerwear", "Accessories", "Shoes"];
  // Filter Conditions
  const conditions = [
    { value: "All", label: "All Grades" },
    { value: "S", label: "S: Mint Grade" },
    { value: "A", label: "A: Great Grade" },
    { value: "B", label: "B: Clean Grade" },
  ];

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search query filter
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      
      // Brand synonyms & store-related branding words
      const brandSynonyms = ["씨오도어", "테오도르", "theodor", "theodore", "빈티지", "vintage"];
      const isExactBrand = brandSynonyms.includes(q);
      
      if (isExactBrand) {
        // If searching precisely for the brand, display all items (do not filter out any products)
      } else {
        // For compound searches (e.g., "씨오도어 자켓"), clean up brand terms to isolate the core search intent
        let parsedQuery = q;
        brandSynonyms.forEach(syn => {
          parsedQuery = parsedQuery.replace(syn, "").trim();
        });
        
        const finalQuery = parsedQuery || q;
        
        result = result.filter((p) => {
          const nameLower = p.name.toLowerCase();
          const descLower = p.description.toLowerCase();
          const catLower = p.category.toLowerCase();
          
          const matches = nameLower.includes(finalQuery) || 
                          descLower.includes(finalQuery) ||
                          catLower.includes(finalQuery);
                          
          // Korean-English product type and category terminology translations
          let matchesKorean = false;
          if (
            finalQuery.includes("자켓") || 
            finalQuery.includes("아우터") || 
            finalQuery.includes("코트") || 
            finalQuery.includes("블레이저") ||
            finalQuery.includes("外套")
          ) {
            matchesKorean = catLower === "outerwear" || nameLower.includes("blazer") || nameLower.includes("coat") || nameLower.includes("jacket");
          }
          if (
            finalQuery.includes("원피스") || 
            finalQuery.includes("드레스") || 
            finalQuery.includes("치마") ||
            finalQuery.includes("스커트")
          ) {
            matchesKorean = catLower === "dresses" || nameLower.includes("dress") || nameLower.includes("skirt");
          }
          if (
            finalQuery.includes("티") || 
            finalQuery.includes("티셔츠") || 
            finalQuery.includes("탑") || 
            finalQuery.includes("상의") || 
            finalQuery.includes("린넨") ||
            finalQuery.includes("셔츠")
          ) {
            matchesKorean = catLower === "tops" || nameLower.includes("tee") || nameLower.includes("shirt") || nameLower.includes("linen") || nameLower.includes("set-up");
          }
          if (
            finalQuery.includes("신발") || 
            finalQuery.includes("부츠") || 
            finalQuery.includes("슈즈") ||
            finalQuery.includes("스니커즈")
          ) {
            matchesKorean = catLower === "shoes" || nameLower.includes("boots") || nameLower.includes("shoes") || nameLower.includes("sneakers");
          }
          if (
            finalQuery.includes("악세") || 
            finalQuery.includes("악세사리") || 
            finalQuery.includes("목걸이") || 
            finalQuery.includes("주얼리") || 
            finalQuery.includes("펜던트")
          ) {
            matchesKorean = catLower === "accessories" || nameLower.includes("necklace") || nameLower.includes("pendant") || nameLower.includes("jewelry");
          }
          
          return matches || matchesKorean;
        });
      }
    }

    // Category filter
    if (selectedCategory !== "All") {
      result = result.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Condition grade filter
    if (selectedCondition !== "All") {
      result = result.filter((p) => p.condition.startsWith(selectedCondition));
    }

    // Recommended toggle
    if (onlyRecommended) {
      result = result.filter((p) => p.isRecommended);
    }

    // Hide Sold Out toggle
    if (hideSoldOut) {
      result = result.filter((p) => !p.isSoldOut);
    }

    // Sort operations
    if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.createdAt as any).getTime() - new Date(a.createdAt as any).getTime());
    } else if (sortBy === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [products, search, selectedCategory, selectedCondition, hideSoldOut, onlyRecommended, sortBy]);

  const viewProduct = (id: string) => {
    setDetailedProductId(id);
    setActivePage("ProductDetail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const formattedPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW" }).format(price);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* 1. Header & Search Banner */}
      <div className="text-center space-y-4 mb-16">
        <span className="text-xs uppercase tracking-[0.4em] text-[#8C624E] font-semibold font-mono">Theodor Catalogue</span>
        <h1 className="text-4xl sm:text-5xl font-serif text-[#2C302E]">Current Collections</h1>
        <p className="text-sm text-[#2C302E]/60 max-w-lg mx-auto font-light leading-relaxed">
          Theodor Vintage selects only unique textiles with emotional appeal. Explore our fine condition vintage selections.
        </p>

        {/* Floating Search Bar */}
        <div className="max-w-md mx-auto relative mt-6">
          <input
            type="text"
            placeholder="Search items, fabrics, or moods..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#FAF7F0] border border-[#8C624E]/15 rounded-full py-3.5 pl-12 pr-6 text-sm text-[#2C302E] placeholder-[#2C302E]/40 focus:outline-hidden focus:ring-1 focus:ring-[#8C624E]/50 focus:border-[#8C624E]/50 transition-all font-light"
          />
          <Search className="w-5 h-5 text-[#2C302E]/30 absolute left-4 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-4 gap-10 items-start">
        
        {/* 2. Left Filter Sidebar Panel (Desktop) */}
        <div className="space-y-8 bg-[#FAF7F0] p-6 lg:p-8 border border-[#8C624E]/5 rounded-xs lg:sticky lg:top-24 mb-8 lg:mb-0">
          <div className="flex items-center space-x-2 text-[#2C302E] font-medium border-b border-stone-200 pb-3">
            <SlidersHorizontal className="w-4 h-4 text-[#8C624E]" />
            <span className="text-sm uppercase tracking-wider">Refine Archive</span>
          </div>

          {/* Category List */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-stone-500 font-semibold mb-2">Category</h4>
            <div className="flex flex-wrap lg:flex-col gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-left text-xs tracking-widest px-3 py-2 rounded-sm transition-all focus:outline-hidden ${
                    selectedCategory === cat
                      ? "bg-[#2D4236] text-[#FAF7F0] lg:pl-4 font-semibold"
                      : "text-stone-600 hover:bg-stone-250/40"
                  }`}
                >
                  {cat === "All" ? "All Collections" : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Condition Grades */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-stone-500 font-semibold mb-2">Condition Grade</h4>
            <div className="flex flex-wrap gap-2 lg:flex-col">
              {conditions.map((cond) => (
                <button
                  key={cond.value}
                  onClick={() => setSelectedCondition(cond.value)}
                  className={`text-left text-xs tracking-widest px-3 py-2 rounded-sm transition-all focus:outline-hidden ${
                    selectedCondition === cond.value
                      ? "bg-[#8C624E] text-[#FAF7F0] lg:pl-4 font-semibold"
                      : "text-stone-600 hover:bg-stone-250/40"
                  }`}
                >
                  {cond.label}
                </button>
              ))}
            </div>
          </div>

          {/* Status Switches */}
          <div className="space-y-3 border-t border-stone-200 pt-5">
            <h4 className="text-xs uppercase tracking-widest text-stone-500 font-semibold mb-3">Status Options</h4>
            
            <label className="flex items-center space-x-3 text-xs tracking-wider cursor-pointer text-stone-600">
              <input
                type="checkbox"
                checked={hideSoldOut}
                onChange={(e) => setHideSoldOut(e.target.checked)}
                className="rounded-xs border-stone-300 text-[#8C624E] focus:ring-[#8C624E]"
              />
              <span>In Stock Only</span>
            </label>

            <label className="flex items-center space-x-3 text-xs tracking-wider cursor-pointer text-stone-600 pt-1">
              <input
                type="checkbox"
                checked={onlyRecommended}
                onChange={(e) => setOnlyRecommended(e.target.checked)}
                className="rounded-xs border-stone-300 text-[#1A3020] focus:ring-[#1A3020]"
              />
              <span className="flex items-center text-stone-600">
                <Sparkles className="w-3 h-3 text-[#1A3020] mr-1" />
                Curator Recommended
              </span>
            </label>
          </div>

          {/* Count Reset helper */}
          {(selectedCategory !== "All" || selectedCondition !== "All" || onlyRecommended || hideSoldOut || search) && (
            <button
              onClick={() => {
                setSelectedCategory("All");
                setSelectedCondition("All");
                setOnlyRecommended(false);
                setHideSoldOut(false);
                setSearch("");
              }}
              className="w-full py-2.5 text-center text-[10px] uppercase tracking-widest font-mono font-bold text-[#8C624E] border border-[#8C624E]/20 hover:bg-white transition-colors focus:outline-hidden"
            >
              Clear All Filters
            </button>
          )}
        </div>

        {/* 3. Catalog Products Panel */}
        <div className="lg:col-span-3 space-y-8">
          
          {/* Top Sort / Counter row */}
          <div className="flex flex-col sm:flex-row justify-between items-center bg-[#FAF7F0]/40 px-5 py-3 border border-[#8C624E]/5 rounded-xs gap-4">
            <div className="text-xs text-stone-500 tracking-wider">
              Showing <span className="font-semibold text-stone-800">{filteredProducts.length}</span> individual items
            </div>

            <div className="flex items-center space-x-2">
              <ArrowUpDown className="w-4 h-4 text-[#8C624E]/70" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent border-0 text-xs tracking-wider text-stone-700 font-medium focus:ring-0 cursor-pointer focus:outline-hidden py-1"
              >
                <option value="newest">Release: Newest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 border border-stone-200/50 rounded-xs space-y-4">
              <Search className="w-8 h-8 text-stone-300 mx-auto" />
              <p className="text-sm text-stone-500 font-light">
                No unique items match your search. Try other grade tags or categories.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory("All");
                  setSelectedCondition("All");
                  setHideSoldOut(false);
                  setOnlyRecommended(false);
                  setSearch("");
                }}
                className="text-xs uppercase tracking-widest text-[#8C624E] border-b border-[#8C624E]"
              >
                Reset catalog
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((p) => (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => viewProduct(p.id)}
                  className="group cursor-pointer flex flex-col h-full bg-[#FAF7F0]/10 border border-[#8C624E]/5 hover:border-[#8C624E]/15 p-3.5 transition-colors"
                >
                  <div className="relative aspect-3/4 overflow-hidden bg-stone-100 mb-4 border border-[#FAF7F0]">
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />

                    {/* Sold out Overlay */}
                    {p.isSoldOut && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white border border-white px-4 py-1.5 text-xs tracking-widest uppercase">
                          Sold out
                        </span>
                      </div>
                    )}

                    {/* Recommended badge */}
                    {p.isRecommended && !p.isSoldOut && (
                      <div className="absolute top-3 left-3 bg-[#1A3020] text-white px-2.5 py-1 text-[10px] tracking-widest uppercase flex items-center space-x-1 font-mono font-medium">
                        <Sparkles className="w-3 h-3" />
                        <span>Curated</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5 flex-1 flex flex-col justify-between">
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-stone-400 font-mono">
                        <span>{p.category}</span>
                        <span>{p.condition.split(":")[0]} Grade</span>
                      </div>
                      <h3 className="text-base font-serif text-[#2C302E] font-medium leading-5 group-hover:text-[#8C624E] transition-colors">
                        {p.name}
                      </h3>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-stone-200/45">
                      <div className="flex flex-col">
                        <span className="text-xs text-stone-500 tracking-wider">Size {p.size}</span>
                        {!p.isSoldOut && (
                          <span className="text-[9px] text-[#2D4236] font-semibold mt-0.5 font-mono">
                            {p.stockCount !== undefined ? `${p.stockCount} left` : "1 left"}
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-semibold text-[#8C624E]">
                        {formattedPrice(p.price)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
