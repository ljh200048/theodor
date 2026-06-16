/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User, Lock, Mail, AlertCircle, LogIn, ChevronRight, HelpCircle } from "lucide-react";
import { motion } from "motion/react";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../firebase";
import { ActivePage } from "../types";

interface LoginProps {
  setActivePage: (p: ActivePage) => void;
  onLoginSuccess: () => void;
}

export default function LoginView({ setActivePage, onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErr("이메일과 비밀번호를 모두 입력해 주세요.");
      return;
    }

    setLoading(true);
    setErr("");
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      onLoginSuccess();
    } catch (error: any) {
      console.error("Login email error:", error);
      let errMsg = "로그인에 실패했습니다. 이메일 혹은 비밀번호를 다시 확인해 주세요.";
      if (error.code === "auth/user-not-found") {
        errMsg = "등록되지 않은 사용자입니다. 회원가입을 진행해 주십시오.";
      } else if (error.code === "auth/wrong-password") {
        errMsg = "비밀번호가 올바르지 않습니다.";
      } else if (error.code === "auth/operation-not-allowed") {
        errMsg = "이메일 로그인 방식이 비활성화 상태입니다. Firebase 콘솔에서 활성화가 필요합니다.";
      }
      setErr(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErr("");
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      onLoginSuccess();
    } catch (error: any) {
      console.error("Google login error:", error);
      setErr("Google 소셜 로그인에 실패했습니다. 다시 시도해 주세요.");
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
          <span className="text-[10px] uppercase tracking-widest text-[#8C624E] font-medium font-mono">Boutique Member Lock</span>
          <h1 className="text-3xl font-serif text-[#2C302E]">Sign In Shop</h1>
        </div>

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

        {/* Separator line */}
        <div className="relative flex items-center justify-center py-2">
          <div className="w-full border-t border-stone-200" />
          <span className="absolute bg-[#FAF7F0] px-3 text-[10px] uppercase tracking-widest text-stone-400 font-mono">Or</span>
        </div>

        {/* Google OAuth Option */}
        <button
          onClick={handleGoogleLogin}
          type="button"
          disabled={loading}
          className="w-full transition-colors bg-white hover:bg-stone-50 border border-stone-200 py-3 text-xs tracking-widest text-stone-700 flex items-center justify-center space-x-2 rounded-xs cursor-pointer shadow-2xs font-medium"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22-.19-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Footer links to Signup */}
        <div className="text-center text-xs space-y-4 pt-2 border-t border-stone-200/50">
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
            새로 프로비저닝된 프로젝트인 경우, Firebase Console 내에서 '이메일/비밀번호(Email/Password)' 가입 수단이 사전에 활성화되어 있어야 에러 없이 가입이 완료됩니다. 소셜 로그인은 구글 팝업이 즉각 지원됩니다.
          </p>
        </div>

      </motion.div>
    </div>
  );
}
