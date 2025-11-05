import React from "react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import TwoFactorAuthForm from "./TwoFactorAuthForm";

export default function LoginForm() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [emailError, setEmailError] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [passwordError, setPasswordError] = React.useState("");
  const [currentStep, setCurrentStep] = React.useState<"login" | "2fa">(
    "login",
  );

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep("2fa");
  };

  const handleBack = () => {
    setCurrentStep("login");
  };

  if (currentStep === "2fa") {
    return <TwoFactorAuthForm onBack={handleBack} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-sm p-8 space-y-6">
        <div className="flex items-center justify-center gap-2">
          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-full" />
          </div>
          <span className="text-lg font-medium text-gray-900">Company</span>
        </div>

        <h1 className="text-center text-2xl font-medium text-gray-900 leading-tight">
          Sign in to your account to
          <br />
          continue
        </h1>

        <form className="space-y-4 flex flex-col gap-2">
          <div>
            <div className="relative">
              <Mail className="h-5 w-5 text-gray-400 absolute top-1/2 -translate-y-1/2 left-3" />
              <input
                type="email"
                placeholder="Email"
                className="block w-full pl-10 pr-3 py-3 bg-gray-50 border-0 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (!e.target.value.includes("@")) {
                    setEmailError("Email должен содержать @");
                  } else {
                    setEmailError("");
                  }
                }}
              />
            </div>
            <p className="text-red-500 text-sm mt-1">{emailError}</p>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (e.target.value.length < 6) {
                  setPasswordError(
                    "Пароль должен содержать минимум 6 символов",
                  );
                } else if (!/[A-Z]/.test(e.target.value)) {
                  setPasswordError(
                    "Пароль должен содержать хотя бы одну заглавную букву",
                  );
                } else {
                  setPasswordError("");
                }
              }}
              placeholder="Password"
              className="block w-full pl-10 pr-10 py-3 bg-gray-50 border-0 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
          {passwordError && (
            <p className="text-red-500 text-sm mt-1">{passwordError}</p>
          )}

          <button
            type="submit"
            disabled={
              !email ||
              !password ||
              !email.includes("@") ||
              password.length < 6 ||
              !/[A-Z]/.test(password)
            }
            className={`w-full ${
              email &&
              password &&
              email.includes("@") &&
              password.length >= 6 &&
              /[A-Z]/.test(password)
                ? "bg-blue-600 text-white cursor-pointer"
                : "bg-gray-100 text-gray-700"
            } font-medium py-3 rounded-lg transition-colors duration-200`}
            onClick={handleLoginSubmit}
          >
            Log in
          </button>
        </form>
      </div>
    </div>
  );
}
