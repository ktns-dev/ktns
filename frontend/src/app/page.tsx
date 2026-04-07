"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Loader2, Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { LoginAPI } from "@/api/Login/Login"
import { toast } from "sonner"
import Image from "next/image"
import { useRole } from "@/context/RoleContext"
import { motion, AnimatePresence } from "framer-motion"

type FormData = {
  username: string
  password: string
}

interface UserResponse {
  username: string
  email: string
  role: "ADMIN" | "PRINCIPAL" | "TEACHER" | "ACCOUNTANT" | "FEE_MANAGER" | "USER"
  id: number
}

interface LoginResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
  user: UserResponse
}

interface ApiErrorResponse {
  response?: {
    data?: {
      detail?: string
    }
  }
}

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter()
  const { setRole } = useRole()

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      const response: LoginResponse = await LoginAPI(data)
      if (response?.user) {
        // Security: Tokens are now in HTTPOnly cookies (not accessible here)
        // Store full user object to localStorage (persists across refresh)
        localStorage.setItem("user", JSON.stringify(response.user))
        // Also store to sessionStorage for current session
        sessionStorage.setItem("user", JSON.stringify(response.user))
        // Store the user's role for authorization checks
        sessionStorage.setItem("userRole", response.user.role)

        // Update RoleContext's React state directly so ProtectedRoute
        // sees the role immediately on navigation — without waiting for
        // RoleContext's useEffect to re-run
        setRole(response.user.role)

        toast.success("Login Successful!", { position: "top-center" })
        router.push("/dashboard")
      } else {
        toast.error("Invalid credentials, please try again.", { position: "top-center" })
      }
    } catch (error: unknown) {
      const apiError = error as ApiErrorResponse
      toast.error(apiError.response?.data?.detail || "Login failed. Please try again.", { position: "top-center" })
    } finally {
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#f8fafc] font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Decorative Background Elements - Light Theme */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-200/30 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-200/30 blur-[120px] animate-pulse [animation-delay:2s]" />
        <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] rounded-full bg-rose-100/40 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-lg p-6 sm:p-4"
      >
        {/* Light Glassmorphism Card */}
        <div className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] border border-white/60 bg-white/70 backdrop-blur-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)]">
          {/* Subtle Shine Effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/40 pointer-events-none" />

          <div className="relative px-6 py-10 sm:px-12 sm:pt-16 sm:pb-14">
            {/* Header Section */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center text-center mb-8 sm:mb-10"
            >
              <div className="relative group mb-6 sm:mb-8">
                <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 to-blue-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-100 shadow-[0_8px_24px_rgba(0,0,0,0.04)] overflow-hidden">
                  <Image src="/logo.png" alt="logo" width={56} height={56} className="object-contain" priority />
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-2.5 sm:mb-3">
                Welcome <span className="text-indigo-600">Back</span>
              </h1>
              <p className="text-sm text-slate-500 font-medium max-w-[260px] sm:max-w-[280px]">
                Secure access to your institution's management terminal.
              </p>
            </motion.div>

            {/* Form Section */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 sm:space-y-7">
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between px-1">
                  <label htmlFor="username" className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                    Administrator ID
                  </label>
                </div>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    id="username"
                    type="text"
                    placeholder="email or username"
                    className="w-full h-12 sm:h-14 bg-slate-50/50 border border-slate-100 text-slate-900 rounded-xl sm:rounded-2xl px-12 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/40 focus:bg-white transition-all placeholder:text-slate-300"
                    {...register("username", { required: "Admin ID is required" })}
                  />
                  <AnimatePresence>
                    {errors.username && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute -bottom-5 left-1 text-[10px] text-rose-500 font-bold"
                      >
                        {errors.username.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between px-1">
                  <label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                    Security Key
                  </label>
                  <a href="#" className="text-[10px] font-black text-indigo-500/80 hover:text-indigo-600 transition-colors uppercase tracking-wider">
                    Recovery?
                  </a>
                </div>

                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full h-12 sm:h-14 bg-slate-50/50 border border-slate-100 text-slate-900 rounded-xl sm:rounded-2xl px-12 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/40 focus:bg-white transition-all placeholder:text-slate-300"
                    {...register("password", { required: "Security Key is required" })}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 transition-all focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <AnimatePresence>
                    {errors.password && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute -bottom-5 left-1 text-[10px] text-rose-500 font-bold"
                      >
                        {errors.password.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="pt-4 sm:pt-6"
              >
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full h-12 sm:h-14 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-black text-[12px] sm:text-[13px] uppercase tracking-[0.15em] rounded-xl sm:rounded-2xl shadow-[0_12px_24px_-8px_rgba(79,70,229,0.4)] hover:shadow-[0_16px_32px_-8px_rgba(79,70,229,0.5)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden active:scale-[0.98]"
                >
                  <div className="relative flex justify-center items-center gap-3">
                    {isLoading ? (
                      <><Loader2 className="h-5 w-5 animate-spin" /> Authorizing...</>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </div>
                </button>
              </motion.div>
            </form>

            {/* Footer Trust Indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-400"
            >
              <ShieldCheck className="h-4 w-4 text-emerald-500/60" />
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em]">Encrypted Session</span>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
