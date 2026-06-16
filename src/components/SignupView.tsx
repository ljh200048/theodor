/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User, Lock, Mail, AlertCircle, ChevronLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../firebase";
import { ActivePage } from "../types";

interface SignupProps {
  setActivePage: (p: ActivePage) => void;
  onSignupSuccess: () => void;
}

export default function SignupView({ setActivePage, onSignupSuccess }: SignupProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password || !name.trim()) {
      setErr("모든 필수 입력 사항을 작성해 주세요.");
      return;
    }
    if (password.length < 6) {
      setErr("비밀번호는 최소 6자 이상으로 설정해 주세요.");
      return;
    }
    if (password !== confirmPassword) {
      setErr("비밀번호 확인란이 일치하지 않습니다.");
      return;
    }

    setLoading(true);
    setErr("");
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: name.trim(),
        });
      }
      setSuccess(true);
      setTimeout(() => {
        onSignupSuccess();
      }, 2000);
    } catch (error: any) {
      console.error("Signup error:", error);
      let errMsg = "회원가입에 실패했습니다. 형식과 연결을 확인해 주십시오.";
      if (error.code === "auth/email-already-in-use") {
        errMsg = "이미 가입되어 사용 중인 이메일 주소입니다.";
      } else if (error.code === "auth/invalid-email") {
        errMsg = "올바르지 않은 이메일 형식입니다.";
      } else if (error.code === "auth/operation-not-allowed") {
        errMsg = "이메일 로그인 방식이 비활성화 상태입니다. Firebase 콘솔 설정이 필요합니다.";
      }
      setErr(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#FAF7F0] border border-[#8C624E]/10 px-8 py-10 shadow-xs rounded-xs space-y-6"
      >
        
        {/* Back link */}
        <button
          onClick={() => setActivePage("Login")}
          className="inline-flex items-center space-x-1.5 text-[10px] uppercase tracking-widest text-stone-400 hover:text-[#8C624E] border border-stone-200 bg-white/50 px-2.5 py-1.5 rounded-sm transition-colors focus:outline-hidden"
        >
          <ChevronLeft className="w-3 h-3" />
          <span>Back to Login</span>
        </button>

        <div className="text-center space-y-2">
          <span className="text-[10px] uppercase tracking-widest text-[#8C624E] font-medium font-mono">Boutique Register</span>
          <h1 className="text-3xl font-serif text-[#2C302E]">Create Account</h1>
        </div>

        <AnimatePresence>
          {success ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-10 space-y-4 font-mono text-stone-600"
            >
              <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-6 h-6 animate-bounce" />
              </div>
              <p className="text-sm font-semibold text-[#1A3020]">회원 가입이 완료되었습니다!</p>
              <p className="text-xs text-stone-400 font-light">잠시 후 상점 멤버 세션을 시작합니다.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold font-mono block">
                  Curation Name / 가입 성함 *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#FDFBF7] border border-[#8C624E]/10 rounded-xs py-2 px-9 text-sm focus:outline-hidden focus:border-[#8C624E] font-light"
                    placeholder="Theodor"
                  />
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold font-mono block">
                  Email Address / 메일 주소 *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#FDFBF7] border border-[#8C624E]/10 rounded-xs py-2 px-9 text-sm focus:outline-hidden focus:border-[#8C624E] font-light"
                    placeholder="name@example.com"
                  />
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold font-mono block">
                  Password / 비밀번호 *
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#FDFBF7] border border-[#8C624E]/10 rounded-xs py-2 px-9 text-sm focus:outline-hidden focus:border-[#8C624E]"
                    placeholder="최소 6자 이상"
                  />
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold font-mono block">
                  Confirm Password / 비밀번호 확인 *
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#FDFBF7] border border-[#8C624E]/10 rounded-xs py-2 px-9 text-sm focus:outline-hidden focus:border-[#8C624E]"
                    placeholder="비밀번호 재입력"
                  />
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
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
                className="w-full bg-[#2D4236] hover:bg-[#8C624E] text-[#FAF7F0] transition-colors py-3.5 text-xs uppercase tracking-widest font-semibold flex items-center justify-center space-x-2 rounded-xs cursor-pointer shadow-xs"
              >
                <span>{loading ? "Registering..." : "Submit Join Form"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </form>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
}
