"use client";

import React from "react";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: "success" | "error" | "info";
  primaryButtonText?: string;
  onPrimaryAction?: () => void;
}

export default function FeedbackModal({
  isOpen,
  onClose,
  title,
  message,
  type = "success",
  primaryButtonText = "OK",
  onPrimaryAction,
}: FeedbackModalProps) {
  if (!isOpen) return null;

  const handleAction = () => {
    if (onPrimaryAction) {
      onPrimaryAction();
    }
    onClose();
  };

  const getIcon = () => {
    switch (type) {
      case "error":
        return <AlertCircle className="w-12 h-12 text-rose-500" />;
      case "info":
        return <Info className="w-12 h-12 text-blue-500" />;
      case "success":
      default:
        return <CheckCircle className="w-12 h-12 text-emerald-500" />;
    }
  };

  const getBgGlow = () => {
    switch (type) {
      case "error":
        return "bg-rose-500/10 border-rose-500/20";
      case "info":
        return "bg-blue-500/10 border-blue-500/20";
      case "success":
      default:
        return "bg-emerald-500/10 border-emerald-500/20";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-surface border border-border-subtle rounded-2xl shadow-xl overflow-hidden p-6 text-center text-on-surface">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted hover:text-on-surface transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center border mb-4 ${getBgGlow()}`}>
          {getIcon()}
        </div>

        <h3 className="text-xl font-bold text-on-surface mb-2">{title}</h3>
        <p className="text-muted text-sm mb-6 leading-relaxed">{message}</p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={handleAction}
            className="w-full py-2.5 px-5 bg-primary hover:bg-primary-container text-white font-medium rounded-xl shadow-sm transition duration-150 active:scale-95"
          >
            {primaryButtonText}
          </button>
        </div>
      </div>
    </div>
  );
}
