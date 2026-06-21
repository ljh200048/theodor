/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User, Lock, Mail, AlertCircle, LogIn, ChevronRight, HelpCircle } from "lucide-react";
import { motion } from "motion/react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { ActivePage } from "../types";

interface LoginProps {
  setActivePage: (p: ActivePage) => void;
  onLoginSuccess: () => void;
  initialNotice?: string | null;
  onClearNotice?: () => void;
}

export default function LoginView({ setActivePage, onLoginSuccess, initialNotice, onClearNotice }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  React.useEffect(() => {
    console.log("Connected Firebase Project ID:", auth.app?.options?.projectId);
    console.log("Connected Firebase Auth Domain:", auth.app?.options?.authDomain);
    
    // Auto clear notifications after mounting if needed
    return () => {
      if (onClearNotice) onClearNotice();
    };
  }, [onClearNotice]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    
    console.log("Firebase Project ID:", auth.app?.options?.projectId);
    console.log("Firebase Auth Domain:", auth.app?.options?.authDomain);

    if (!cleanEmail || !password.trim()) {
      setErr("이메일과 비밀번호를 모두 입력해 주세요.");
      return;
    }

    setLoading(true);
    setErr("");
    try {
      await signInWithEmailAndPassword(auth, cleanEmail, password);
      onLoginSuccess();
    } catch (error: any) {
      console.error("Login Error Code:", error?.code);
      console.error("Login Error Message:", error?.message);
      
      let errMsg = `로그인에 실패하였습니다. (${error?.message || error?.code})`;
      if (error?.code === "auth/user-not-found") {
        errMsg = "등록되지 않은 사용자입니다. 회원가입을 진행해 주십시오.";
      } else if (error?.code === "auth/wrong-password") {
        errMsg = "비밀번호가 올바르지 않습니다. 다시 입력해 주세요.";
      } else if (error?.code === "auth/invalid-credential") {
        errMsg = "이메일 혹은 비밀번호가 올바르지 않습니다. 정확한 로그인 정보를 확인하세요.";
      } else if (error?.code === "auth/operation-not-allowed") {
        errMsg = "이메일 로그인 방식이 비활성화 상태입니다. Firebase 콘솔에서 이메일/비밀번호 로그인을 활성화해 주세요.";
      } else if (error?.code === "auth/invalid-email") {
        errMsg = "올바르지 않은 이메일 형식입니다.";
      } else if (error?.code === "auth/unauthorized-domain") {
        errMsg = "허용되지 않은 도메인입니다. Firebase OAuth 승인 도메인 설정을 확인해 주세요.";
      } else if (error?.code === "auth/too-many-requests") {
        errMsg = "너무 많은 로그인 시도가 감지되었습니다. 잠시 후 다시 시도하거나 비밀번호를 재설정해 주세요.";
      }
      setErr(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#FAF7F0] border border-[#8C624E]/10 px-8 py-10 shadow-xs rounded-xs space-y-8"
      >
        <div className="text-center space-y-2">
          <span className="text-[10px] uppercase tracking-widest text-[#8C624E] font-medium font-mono">Theodor Member Lock</span>
          <h1 className="text-3xl font-serif text-[#2C302E]">Sign In Shop</h1>
        </div>

        {initialNotice && (
          <div className="text-xs text-[#8C624E] bg-[#FAF7F0] p-4 rounded-xs border border-[#8C624E]/20 flex items-start space-x-2.5 font-sans leading-relaxed">
            <AlertCircle className="w-4 h-4 text-[#8C624E] shrink-0 mt-0.5" />
            <span>{initialNotice}</span>
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-4">
          
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold font-mono block">
              Email Address / 메일 주소
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#FDFBF7] border border-[#8C624E]/10 rounded-xs py-2.5 pl-10 pr-4 text-sm focus:outline-hidden focus:border-[#8C624E] font-light"
                placeholder="name@example.com"
              />
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold font-mono block">
              Password / 비밀번호
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#FDFBF7] border border-[#8C624E]/10 rounded-xs py-2.5 pl-10 pr-4 text-sm focus:outline-hidden focus:border-[#8C624E]"
                placeholder="••••••••"
              />
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {err && (
            <div className="text-xs text-red-700 bg-red-100/50 p-3 rounded-xs border border-red-200/50 flex items-start space-x-2 font-mono">
              <AlertCircle className="w-4 h-4 text-red-750 shrink-0 mt-0.5" />
              <span>{err}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2C302E] hover:bg-[#8C624E] text-[#FAF7F0] transition-colors py-3.5 text-xs uppercase tracking-widest font-semibold flex items-center justify-center space-x-2 rounded-xs cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? "Signing In..." : "Login to Theodor"}</span>
          </button>

        </form>

        {/* Footer links to Signup */}
        <div className="text-center text-xs space-y-4 pt-4 border-t border-stone-200/50">
          <p className="text-stone-500 font-light">
            Don't have an account yet? / 계정이 없으신가요?
          </p>
          <button
            onClick={() => setActivePage("Signup")}
            className="inline-flex items-center space-x-1.5 text-xs text-[#8C624E] font-medium tracking-wider uppercase border-b border-[#8C624E]/40 hover:border-[#8C624E] pb-0.5 focus:outline-hidden"
          >
            <span>Create Shop Account</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Console Config Check Note */}
        <div className="bg-stone-100/50 p-4 border border-stone-200/40 text-[10px] leading-relaxed text-stone-400 font-light rounded-xs space-y-1.5 font-mono">
          <p className="flex items-center space-x-1 font-semibold text-stone-500">
            <HelpCircle className="w-3.5 h-3.5 mr-1 text-[#8C624E]" />
            <span>이메일 비밀번호 로그인 활성화 팁</span>
          </p>
          <p>
            새로 프로비저닝된 프로젝트인 경우, Firebase Console 내에서 '이메일/비밀번호(Email/Password)' 가입 수단이 사전에 활성화되어 있어야 에러 없이 가입이 완료됩니다.
          </p>
        </div>

      </motion.div>
    </div>
  );
}
