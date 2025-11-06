import React from "react";
import { ArrowLeft } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

interface TwoFactorAuthFormProps {
  onBack: () => void;
}

export default function TwoFactorAuthForm({ onBack }: TwoFactorAuthFormProps) {
  const [code, setCode] = React.useState(["", "", "", "", "", ""]);
  const inputsRef = React.useRef<(HTMLInputElement | null)[]>([]);
  const [apiError, setApiError] = React.useState("");
  const [isCodeExpired, setIsCodeExpired] = React.useState(false);
  const [hasInvalidCode, setHasInvalidCode] = React.useState(false);

  React.useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsCodeExpired(true);
      setHasInvalidCode(false);
    }, 30_000);

    return () => clearTimeout(timer);
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setHasInvalidCode(false);
    setApiError("");
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    const newCode = pasted.padEnd(6, "").split("").slice(0, 6);
    setCode(newCode);
    setHasInvalidCode(false);
    setApiError("");
    const nextEmpty = newCode.findIndex((d) => !d);
    inputsRef.current[nextEmpty !== -1 ? nextEmpty : 5]?.focus();
  };

  const verifyMutation = useMutation({
    mutationFn: async ({ code }: { code: string }) => {
      const response = await fetch("/api/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Verification failed");
      }
      return response.json();
    },
    onSuccess: () => {
      setHasInvalidCode(false);
      setApiError("");
      alert("Успешная аутентификация!");
    },
    onError: (error: Error) => {
      const message = error.message;
      setApiError(message);
      if (message.includes("Incorrect") || message.includes("Invalid")) {
        setHasInvalidCode(true);
      }
    },
  });

  const requestNewCodeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/request-new-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to request new code");
      return res.json();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join("");
    if (fullCode.length === 6) {
      verifyMutation.mutate({ code: fullCode });
    }
  };

  const fullCode = code.join("");
  const isCodeComplete = fullCode.length === 6;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-sm p-8 space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="p-2 -ml-2 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full" />
            </div>
            <span className="text-lg font-medium text-gray-900">Company</span>
          </div>
          <div className="w-9" />
        </div>

        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">
            Two-Factor Authentication
          </h1>
          <p className="text-gray-600 text-sm">
            Enter the 6-digit code from the Google Authenticator app
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-2 px-4">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputsRef.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className={`
                  w-12 h-14 text-center text-xl font-semibold
                  border-2 rounded-lg outline-none transition-all
                  focus:ring-2 focus:ring-blue-100
                  ${digit ? "border-gray-300" : "border-gray-200"}
                  bg-gray-50
                  ${hasInvalidCode ? "border-red-500 focus:border-red-500" : "focus:border-blue-600"}
                `}
                autoComplete="off"
                disabled={isCodeExpired}
              />
            ))}
          </div>

          {apiError && (
            <p className="text-red-500 text-sm text-center">{apiError}</p>
          )}

          {isCodeExpired ? (
            <button
              type="button"
              onClick={async () => {
                setCode(["", "", "", "", "", ""]);
                setIsCodeExpired(false);
                setApiError("");
                setHasInvalidCode(false);
                await requestNewCodeMutation.mutateAsync();
                inputsRef.current[0]?.focus();
                setTimeout(() => setIsCodeExpired(true), 30_000);
              }}
              disabled={requestNewCodeMutation.isPending}
              className="w-full py-3 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-70 cursor-pointer"
            >
              {requestNewCodeMutation.isPending ? "Requesting..." : "Get new"}
            </button>
          ) : isCodeComplete ? (
            <button
              type="submit"
              disabled={verifyMutation.isPending}
              className="w-full py-3 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-70 cursor-pointer"
            >
              {verifyMutation.isPending ? "Verifying..." : "Continue"}
            </button>
          ) : null}
        </form>
      </div>
    </div>
  );
}
