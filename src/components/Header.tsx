/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Menu, X, User, Heart, Settings, LogOut, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ActivePage } from "../types";
import { User as FirebaseUser } from "firebase/auth";

interface HeaderProps {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  user: FirebaseUser | null;
  isAdmin: boolean;
  onLogout: () => Promise<void>;
  setDetailedProductId: (id: string | null) => void;
}

export default function Header({
  activePage,
  setActivePage,
  user,
  isAdmin,
  onLogout,
  setDetailedProductId,
}: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navItems: { label: string; value: ActivePage }[] = [
    { label: "Home", value: "Home" },
    { label: "Shop", value: "Shop" },
    { label: "About", value: "About" },
    { label: "Notice", value: "Notice" },
  ];

  const handleNav = (page: ActivePage) => {
    setDetailedProductId(null);
    setActivePage(page);
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-[#FAF7F0] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Brand Logo - Vintage display typography */}
          <div className="flex-1 flex justify-start">
            <button
              onClick={() => handleNav("Home")}
              className="text-2xl md:text-3xl font-serif tracking-widest text-[#2C302E] hover:opacity-80 transition-opacity focus:outline-hidden"
              id="brand-logo"
            >
              theodor_vintage
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-10">
            {navItems.map((item) => (
              <button
                key={item.value}
                onClick={() => handleNav(item.value)}
                className={`text-sm tracking-widest uppercase transition-colors duration-200 focus:outline-hidden ${
                  activePage === item.value
                    ? "text-[#8C624E] font-medium border-b border-[#8C624E]"
                    : "text-[#2C302E]/70 hover:text-[#2C302E]"
                }`}
                id={`nav-${item.value.toLowerCase()}`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Utilities (Auth, MyPage, Admin) */}
          <div className="hidden md:flex flex-1 justify-end items-center space-x-6">
            {isAdmin && (
              <button
                onClick={() => handleNav("Admin")}
                className={`flex items-center space-x-1 text-xs uppercase tracking-widest px-3 py-1.5 border border-[#1A3020]/20 rounded-xs text-[#1A3020] hover:bg-[#1A3020]/5 transition-all focus:outline-hidden ${
                  activePage === "Admin" ? "bg-[#1A3020]/10 border-[#1A3020]" : ""
                }`}
                id="btn-nav-admin"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            )}

            {user ? (
              <>
                <button
                  onClick={() => handleNav("MyPage")}
                  className={`flex items-center space-x-2 text-sm tracking-widest text-[#2C302E]/80 hover:text-[#2C302E] transition-colors focus:outline-hidden ${
                    activePage === "MyPage" ? "text-[#8C624E] font-medium" : ""
                  }`}
                  id="btn-nav-mypage"
                >
                  <User className="w-4 h-4 text-[#8C624E]" />
                  <span>My Page</span>
                </button>
                <button
                  onClick={onLogout}
                  className="flex items-center space-x-1 text-xs uppercase tracking-widest text-red-700/80 hover:text-red-700 transition-colors focus:outline-hidden"
                  id="btn-nav-logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => handleNav("Login")}
                className={`flex items-center space-x-1 text-sm tracking-widest text-[#2C302E]/70 hover:text-[#2C302E] transition-colors focus:outline-hidden ${
                  activePage === "Login" || activePage === "Signup" ? "text-[#8C624E]" : ""
                }`}
                id="btn-nav-login"
              >
                <User className="w-4 h-4" />
                <span>Login</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <div className="md:hidden flex items-center space-x-4">
            {isAdmin && (
              <button
                onClick={() => handleNav("Admin")}
                className={`p-1.5 border border-[#1A3020]/25 rounded-full text-[#1A3020] ${
                  activePage === "Admin" ? "bg-[#1A3020]/10" : ""
                }`}
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-[#2C302E] focus:outline-hidden p-1"
              aria-label="Toggle menu"
              id="mobile-menu-toggle"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-[#FAF7F0] bg-[#FDFBF7]"
          >
            <div className="px-4 pt-4 pb-6 space-y-3 shadow-inner">
              {navItems.map((item) => (
                <button
                  key={item.value}
                  onClick={() => handleNav(item.value)}
                  className={`block w-full text-left py-2.5 px-3 text-sm tracking-widest uppercase rounded-sm transition-colors ${
                    activePage === item.value
                      ? "bg-[#FAF7F0] text-[#8C624E] font-medium"
                      : "text-[#2C302E]/80 hover:bg-[#FAF7F0]/50"
                  }`}
                >
                  {item.label}
                </button>
              ))}

              <div className="border-t border-[#FAF7F0] my-3 pt-3">
                {user ? (
                  <div className="space-y-2">
                    <button
                      onClick={() => handleNav("MyPage")}
                      className={`flex items-center w-full text-left py-2.5 px-3 text-sm tracking-widest rounded-sm ${
                        activePage === "MyPage"
                          ? "bg-[#FAF7F0] text-[#8C624E] font-medium"
                          : "text-[#2C302E]/80"
                      }`}
                    >
                      <User className="w-4 h-4 mr-2 text-[#8C624E]" />
                      My Page
                    </button>
                    <button
                      onClick={async () => {
                        await onLogout();
                        setIsOpen(false);
                      }}
                      className="flex items-center w-full text-left py-2.5 px-3 text-sm tracking-widest text-red-700/80 rounded-sm hover:bg-red-500/5"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleNav("Login")}
                    className={`flex items-center w-full text-left py-2.5 px-3 text-sm tracking-widest rounded-sm ${
                      activePage === "Login" || activePage === "Signup"
                        ? "bg-[#FAF7F0] text-[#8C624E] font-medium"
                        : "text-[#2C302E]/80"
                    }`}
                  >
                    <User className="w-4 h-4 mr-2 text-[#8C624E]" />
                    Login / Join Shop
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
