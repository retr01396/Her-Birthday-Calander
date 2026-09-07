"use client";

import { useState } from "react";
import { FormFieldSchema, FormResponsesPayload } from "@/types/formBuilder";
import { submitEventRegistration } from "@/app/actions/eventFormActions";
import ImageUploader from "@/components/media/ImageUploader";
import {
  Calendar,
  MapPin,
  Building2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Ticket,
  Clock,
  ArrowLeft,
  User,
  Mail,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

interface DynamicFormRendererProps {
  eventId: string;
  eventTitle: string;
  eventDescription: string;
  eventLocation: string;
  eventStartTime: string;
  clubName: string;
  formSchema: FormFieldSchema[];
  studentUser: {
    id: string;
    name: string;
    email: string;
    department?: string | null;
    yearOfStudy?: string | null;
  };
  isAlreadyRegistered?: boolean;
  /** Shortlist events: submission is an application, not an instant pass. */
  requiresApproval?: boolean;
}

export default function DynamicFormRenderer({
  eventId,
  eventTitle,
  eventDescription,
  eventLocation,
  eventStartTime,
  clubName,
  formSchema = [],
  studentUser,
  isAlreadyRegistered = false,
  requiresApproval = false,
}: DynamicFormRendererProps) {
  // State for dynamic responses: { [fieldId]: string | string[] }
  const [responses, setResponses] = useState<FormResponsesPayload>(() => {
    const initial: FormResponsesPayload = {};
    formSchema.forEach((f) => {
      if (f.type === "checkbox") {
        initial[f.id] = [];
      } else {
        initial[f.id] = "";
      }
    });
    return initial;
  });

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(
    isAlreadyRegistered
  );

  // Input change handler
  const handleInputChange = (fieldId: string, value: string) => {
    setResponses((prev) => ({ ...prev, [fieldId]: value }));
    if (validationErrors[fieldId]) {
      setValidationErrors((prev) => {
        const updated = { ...prev };
        delete updated[fieldId];
        return updated;
      });
    }
  };

  // Checkbox toggle handler
  const handleCheckboxToggle = (fieldId: string, option: string) => {
    setResponses((prev) => {
      const current = (prev[fieldId] as string[]) || [];
      const updated = current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option];
      return { ...prev, [fieldId]: updated };
    });
    if (validationErrors[fieldId]) {
      setValidationErrors((prev) => {
        const updated = { ...prev };
        delete updated[fieldId];
        return updated;
      });
    }
  };

  // Validate form client-side
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    for (const field of formSchema) {
      if (field.isRequired) {
        const val = responses[field.id];
        if (
          val === undefined ||
          val === null ||
          val === "" ||
          (Array.isArray(val) && val.length === 0)
        ) {
          errors[field.id] = `"${field.label}" is required.`;
        }
      }
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validateForm()) {
      setErrorMessage("Please complete all required fields highlighted below.");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitEventRegistration(eventId, responses);
      setRegistrationSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to submit registration.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Back Link */}
        <Link
          href={`/`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Dashboard
        </Link>

        {/* Success View */}
        {registrationSuccess ? (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 sm:p-12 text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-inner ${
                requiresApproval
                  ? "bg-amber-100 text-amber-600"
                  : "bg-emerald-100 text-emerald-600"
              }`}
            >
              <CheckCircle2 size={36} />
            </div>

            <div>
              <span
                className={`text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                  requiresApproval
                    ? "bg-amber-50 text-amber-700"
                    : "bg-emerald-50 text-emerald-700"
                }`}
              >
                {requiresApproval ? "Application Submitted" : "Registration Confirmed"}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3">
                {requiresApproval
                  ? `Your Application for ${eventTitle} is In!`
                  : `You're All Set for ${eventTitle}!`}
              </h1>
              <p className="text-sm text-slate-500 max-w-md mx-auto mt-2">
                {requiresApproval
                  ? "The club will review your application. If you're selected, your event pass will appear on your dashboard."
                  : "Your registration pass has been issued. We look forward to seeing you at the event."}
              </p>
            </div>

            {/* Event Summary Box */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-left space-y-3 max-w-lg mx-auto">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <span className="text-xs font-bold text-slate-400 uppercase">
                  {requiresApproval ? "Application Details" : "Event Pass Details"}
                </span>
                <span
                  className={`text-xs font-mono font-bold flex items-center gap-1 ${
                    requiresApproval ? "text-amber-600" : "text-primary"
                  }`}
                >
                  {requiresApproval ? (
                    <>
                      <Clock size={14} /> UNDER REVIEW
                    </>
                  ) : (
                    <>
                      <Ticket size={14} /> ISSUED
                    </>
                  )}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Event Title:</span>
                  <span className="font-bold text-slate-900">{eventTitle}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Hosted By:</span>
                  <span className="font-bold text-slate-900">{clubName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Date & Time:</span>
                  <span className="font-semibold text-slate-800">
                    {new Date(eventStartTime).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Location:</span>
                  <span className="font-semibold text-slate-800">{eventLocation}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/"
                className="w-full sm:w-auto bg-primary text-white font-bold text-xs px-8 py-3.5 rounded-xl hover:bg-blue-700 shadow-md transition-all"
              >
                {requiresApproval ? "Back to Dashboard" : "Go to My Passes"}
              </Link>
            </div>
          </div>
        ) : (
          /* Form View */
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
            {/* Header Banner */}
            <div className="bg-primary p-8 sm:p-10 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-12 translate-x-12 pointer-events-none" />

              <div className="relative z-10 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="bg-white/20 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-md">
                    {requiresApproval ? "Event Application" : "Event Registration"}
                  </span>
                  <span className="text-white/50 text-xs">•</span>
                  <span className="text-white/90 text-xs font-semibold">
                    {clubName}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                  {eventTitle}
                </h1>

                <div className="flex flex-wrap gap-4 text-xs text-white/85 pt-1">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-white/80" />
                    {new Date(eventStartTime).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-white/80" />
                    {eventLocation}
                  </span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 sm:p-10 space-y-8">
              {/* Global Error Banner */}
              {errorMessage && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2.5 animate-in fade-in duration-200">
                  <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Fixed System Student Details */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <User size={14} /> Student Information
                  </h3>
                  <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full">
                    Auto-Filled
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium block">
                      Full Name
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      {studentUser.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium block">
                      Campus Email
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      {studentUser.email}
                    </span>
                  </div>
                  {studentUser.department && (
                    <div>
                      <span className="text-[11px] text-slate-400 font-medium block">
                        Department
                      </span>
                      <span className="text-xs font-semibold text-slate-700">
                        {studentUser.department}
                      </span>
                    </div>
                  )}
                  {studentUser.yearOfStudy && (
                    <div>
                      <span className="text-[11px] text-slate-400 font-medium block">
                        Year of Study
                      </span>
                      <span className="text-xs font-semibold text-slate-700">
                        {studentUser.yearOfStudy}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Dynamic Custom Questions */}
              {formSchema.length > 0 && (
                <div className="space-y-6 border-t border-slate-100 pt-6">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-primary" /> Additional Event Questions
                  </h3>

                  <div className="space-y-6">
                    {formSchema.map((field) => {
                      const hasError = !!validationErrors[field.id];
                      return (
                        <div
                          key={field.id}
                          className="space-y-2 p-5 rounded-2xl bg-white border border-slate-200 transition-all hover:border-slate-300"
                        >
                          <label className="block text-xs font-bold text-slate-900">
                            {field.label}{" "}
                            {field.isRequired ? (
                              <span className="text-red-500 font-bold">*</span>
                            ) : (
                              <span className="text-slate-400 text-[11px] font-normal">
                                (Optional)
                              </span>
                            )}
                          </label>

                          {field.helpText && (
                            <p className="text-[11px] text-slate-500">
                              {field.helpText}
                            </p>
                          )}

                          {/* Short Answer Text */}
                          {field.type === "text" && (
                            <input
                              type="text"
                              value={(responses[field.id] as string) || ""}
                              onChange={(e) =>
                                handleInputChange(field.id, e.target.value)
                              }
                              placeholder={
                                field.placeholder || "Enter your response..."
                              }
                              className={`w-full px-4 py-3 rounded-xl border text-xs font-medium outline-none transition-all ${
                                hasError
                                  ? "border-red-400 focus:ring-2 focus:ring-red-400/20"
                                  : "border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/10"
                              }`}
                            />
                          )}

                          {/* Long Paragraph Textarea */}
                          {field.type === "textarea" && (
                            <textarea
                              rows={4}
                              value={(responses[field.id] as string) || ""}
                              onChange={(e) =>
                                handleInputChange(field.id, e.target.value)
                              }
                              placeholder={
                                field.placeholder || "Write your response..."
                              }
                              className={`w-full px-4 py-3 rounded-xl border text-xs font-medium outline-none transition-all ${
                                hasError
                                  ? "border-red-400 focus:ring-2 focus:ring-red-400/20"
                                  : "border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/10"
                              }`}
                            />
                          )}

                          {/* Dropdown Select */}
                          {field.type === "select" && (
                            <select
                              value={(responses[field.id] as string) || ""}
                              onChange={(e) =>
                                handleInputChange(field.id, e.target.value)
                              }
                              className={`w-full px-4 py-3 rounded-xl border text-xs font-medium outline-none transition-all ${
                                hasError
                                  ? "border-red-400 focus:ring-2 focus:ring-red-400/20"
                                  : "border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/10"
                              }`}
                            >
                              <option value="">-- Choose an Option --</option>
                              {field.options?.map((opt, i) => (
                                <option key={i} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          )}

                          {/* Multiple Choice Radio */}
                          {field.type === "radio" && (
                            <div className="space-y-2.5 pt-1">
                              {field.options?.map((opt, i) => (
                                <label
                                  key={i}
                                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                                >
                                  <input
                                    type="radio"
                                    name={field.id}
                                    checked={
                                      responses[field.id] === opt
                                    }
                                    onChange={() =>
                                      handleInputChange(field.id, opt)
                                    }
                                    className="w-4 h-4 text-primary focus:ring-primary border-slate-300"
                                  />
                                  <span className="text-xs font-medium text-slate-800">
                                    {opt}
                                  </span>
                                </label>
                              ))}
                            </div>
                          )}

                          {/* Checkboxes */}
                          {field.type === "checkbox" && (
                            <div className="space-y-2.5 pt-1">
                              {field.options?.map((opt, i) => {
                                const selectedArr =
                                  (responses[field.id] as string[]) || [];
                                const isChecked = selectedArr.includes(opt);
                                return (
                                  <label
                                    key={i}
                                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() =>
                                        handleCheckboxToggle(field.id, opt)
                                      }
                                      className="w-4 h-4 rounded text-primary focus:ring-primary border-slate-300"
                                    />
                                    <span className="text-xs font-medium text-slate-800">
                                      {opt}
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          )}

                          {/* Image Upload */}
                          {field.type === "image" && (
                            <div
                              className={`rounded-xl transition-all ${
                                hasError ? "ring-2 ring-red-400/30" : ""
                              }`}
                            >
                              <ImageUploader
                                value={
                                  (responses[field.id] as string) || ""
                                }
                                onUploadSuccess={(url) =>
                                  handleInputChange(field.id, url)
                                }
                                buttonLabel="Upload Image"
                                hint="Attach a relevant image (JPG, PNG, WebP)."
                              />
                            </div>
                          )}

                          {hasError && (
                            <p className="text-[11px] text-red-500 font-semibold flex items-center gap-1 mt-1">
                              <AlertCircle size={12} />
                              {validationErrors[field.id]}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Submit Registration Button */}
              <div className="pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-blue-700 text-white font-bold text-sm py-4 rounded-2xl shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      {requiresApproval
                        ? "Submitting Application..."
                        : "Submitting Registration..."}
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      {requiresApproval
                        ? "Submit Application"
                        : "Complete Event Registration"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
