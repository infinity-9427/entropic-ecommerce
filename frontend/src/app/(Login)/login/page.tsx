"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import Link from "next/link";
import Image from "next/image";

const loginSchema = z.object({
  emailOrUsername: z.string().min(1, "Email or username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [formData, setFormData] = useState<LoginForm>({
    emailOrUsername: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<LoginForm>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const validatedData = loginSchema.parse(formData);
      setErrors({});
      
      // TODO: Implement actual authentication
      console.log("Login attempt:", validatedData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<LoginForm> = {};
        error.issues.forEach((issue) => {
          if (issue.path[0]) {
            fieldErrors[issue.path[0] as keyof LoginForm] = issue.message;
          }
        });
        setErrors(fieldErrors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof LoginForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      {/* Login Form */}
      <Card className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl aspect-[3/4] sm:aspect-[4/5] md:aspect-[5/6] lg:aspect-[6/7] xl:aspect-[7/8] 2xl:aspect-[8/9] relative overflow-hidden shadow-2xl border-0">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/bag-login.webp"
            alt="Shopping bag background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/75 to-black/70" />
        </div>

        {/* Form Content */}
        <div className="relative z-10 h-full flex flex-col justify-center">
          <CardHeader className="text-center pb-4 sm:pb-5 md:pb-6 lg:pb-7 xl:pb-8 2xl:pb-10 px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 pt-6 sm:pt-8 md:pt-10 lg:pt-12 xl:pt-14 2xl:pt-16">
            <CardTitle className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold text-white mb-1 sm:mb-2 md:mb-3 lg:mb-4 xl:mb-5 2xl:mb-6 drop-shadow-lg">
              Welcome Back
            </CardTitle>
            <p className="text-white/90 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl drop-shadow-md">
              Sign in to your account
            </p>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 pb-4 sm:pb-6 md:pb-8 lg:pb-10 xl:pb-12 2xl:pb-16 flex-1 flex flex-col justify-center">
            <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-2 md:space-y-3 lg:space-y-3 xl:space-y-4 2xl:space-y-4 flex-1 flex flex-col justify-center">
              <div className="space-y-1">
                <Input
                  id="emailOrUsername"
                  type="text"
                  placeholder="Email or username"
                  value={formData.emailOrUsername}
                  onChange={(e) => handleChange("emailOrUsername", e.target.value)}
                  className={`bg-white/90 border-white/20 text-gray-900 placeholder:text-gray-600 focus:bg-white focus:border-white/40 focus:shadow-none focus:outline-none focus:ring-0 focus:ring-offset-0 hover:shadow-none h-8 sm:h-9 md:h-10 lg:h-11 xl:h-12 2xl:h-14 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl px-3 sm:px-4 md:px-5 lg:px-6 xl:px-7 2xl:px-8 ${errors.emailOrUsername ? "border-red-400" : ""}`}
                  aria-invalid={!!errors.emailOrUsername}
                />
                {errors.emailOrUsername && (
                  <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl text-red-200 bg-red-900/30 px-2 py-1 rounded backdrop-blur-sm">{errors.emailOrUsername}</p>
                )}
              </div>

              <div className="space-y-1">
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    className={`bg-white/90 border-white/20 text-gray-900 placeholder:text-gray-600 focus:bg-white focus:border-white/40 focus:shadow-none focus:outline-none focus:ring-0 focus:ring-offset-0 hover:shadow-none h-8 sm:h-9 md:h-10 lg:h-11 xl:h-12 2xl:h-14 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl px-3 sm:px-4 md:px-5 lg:px-6 xl:px-7 2xl:px-8 pr-8 sm:pr-9 md:pr-10 lg:pr-11 xl:pr-12 2xl:pr-14 ${errors.password ? "border-red-400" : ""}`}
                    aria-invalid={!!errors.password}
                  />
                  <button
                    type="button"
                    className="absolute right-2 sm:right-3 md:right-4 lg:right-5 xl:right-6 2xl:right-7 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <Eye className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7 2xl:h-8 2xl:w-8" />
                    ) : (
                      <EyeOff className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7 2xl:h-8 2xl:w-8" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl text-red-200 bg-red-900/30 px-2 py-1 rounded backdrop-blur-sm">{errors.password}</p>
                )}
              </div>

              <div className="pt-2 sm:pt-2 md:pt-3 lg:pt-3 xl:pt-4 2xl:pt-4">
                <Button
                  type="submit"
                  className="w-full bg-white text-gray-900 hover:bg-white/90 font-semibold h-8 sm:h-9 md:h-10 lg:h-11 xl:h-12 2xl:h-14 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl transition-all duration-200 shadow-lg hover:shadow-xl"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </div>
            </form>

            <div className="mt-3 sm:mt-4 md:mt-5 lg:mt-6 xl:mt-7 2xl:mt-8 text-center space-y-1 sm:space-y-2 md:space-y-2 lg:space-y-3 xl:space-y-3 2xl:space-y-4">
              <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl text-white/90 drop-shadow-md">
                Don't have an account?{" "}
                <Link
                  href="/register"
                  className="text-white font-semibold hover:text-white/80 underline underline-offset-2 transition-colors drop-shadow-sm"
                >
                  Create one
                </Link>
              </p>
              <Link
                href="/"
                className="inline-block text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl text-white/70 hover:text-white/90 transition-colors drop-shadow-sm"
              >
                 Back to Home
              </Link>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
