/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Instagram, Send, Sparkles } from "lucide-react";
import { SiteSetting } from "../types";

interface FooterProps {
  settings: SiteSetting | null;
  setActivePage: (p: any) => void;
}

export default function Footer({ settings, setActivePage }: FooterProps) {
  const instagram = settings?.instagramUrl || "https://instagram.com/theodor_vintage";
  const contact = settings?.contactUrl || "mailto:jongminsin81@gmail.com";

  return (
    <footer className="bg-[#2C302E] text-[#FAF7F0] border-t border-[#1C1F1D] py-16 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        
        {/* Brand Brief */}
        <div className="space-y-4">
          <h3 className="text-xl font-serif tracking-widest text-[#FAF7F0]">theodor_vintage</h3>
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
              <button onClick={() => setActivePage("Home")} className="hover:text-[#8C624E] text-[#FAF7F0]/80 transition-colors">
                Home / Main
              </button>
            </li>
            <li>
              <button onClick={() => setActivePage("Shop")} className="hover:text-[#8C624E] text-[#FAF7F0]/80 transition-colors">
                Collection Shop
              </button>
            </li>
            <li>
              <button onClick={() => setActivePage("About")} className="hover:text-[#8C624E] text-[#FAF7F0]/80 transition-colors">
                Branding Story
              </button>
            </li>
            <li>
              <button onClick={() => setActivePage("Notice")} className="hover:text-[#8C624E] text-[#FAF7F0]/80 transition-colors">
                Shop Announcement
              </button>
            </li>
          </ul>
        </div>

        {/* Curation Info */}
        <div className="space-y-4 text-xs tracking-wide text-[#FAF7F0]/50 font-light leading-6">
          <h4 className="text-xs uppercase tracking-widest text-[#FAF7F0]/40 font-semibold mb-2">Boutique Office</h4>
          <p>theodor_vintage, CEO: Theodor L. | Business No: 120-vintage-88</p>
          <p>Address: Seongsu-dong, Seoul, Rep. of Korea</p>
          <p>CS: AM11:00 - PM17:00 (Weekend and Holiday Off)</p>
          <p className="flex items-center space-x-1 pt-1 text-[#8C624E]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated with sustainable values and vintage soul.</span>
          </p>
        </div>

      </div>

      <div className="max-w-7xl mx-auto border-t border-[#FAF7F0]/10 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-[#FAF7F0]/40 font-light space-y-4 sm:space-y-0">
        <div>
          &copy; {new Date().getFullYear()} theodor_vintage. All rights reserved. Registered in Cloud Instance.
        </div>
        <div className="flex space-x-6">
          <button className="hover:text-[#FAF7F0] transition-colors">Terms of Use</button>
          <button className="hover:text-[#FAF7F0] transition-colors">Privacy Policy</button>
        </div>
      </div>
    </footer>
  );
}
