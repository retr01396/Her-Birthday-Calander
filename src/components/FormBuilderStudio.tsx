"use client";

import { useState } from "react";
import { FormFieldSchema, FieldType } from "@/types/formBuilder";
import { saveEventFormSchema } from "@/app/actions/eventFormActions";
import {
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Save,
  Eye,
  Edit3,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Type,
  AlignLeft,
  CircleDot,
  CheckSquare,
  ChevronDown,
  Loader2,
  ArrowLeft,
  Sparkles,
  ImagePlus,
} from "lucide-react";
import Link from "next/link";

interface FormBuilderStudioProps {
  eventId: string;
  eventTitle: string;
  initialSchema: FormFieldSchema[];
  backUrl?: string;
}

const FIELD_TYPE_LABELS: Record<
  FieldType,
  { label: string; icon: React.ElementType; description: string }
> = {
  text: {
    label: "Short Answer",
    icon: Type,
    description: "Single-line text input",
  },
  textarea: {
    label: "Paragraph",
    icon: AlignLeft,
    description: "Multi-line text area",
  },
  radio: {
    label: "Multiple Choice",
    icon: CircleDot,
    description: "Select one option from a list",
  },
  checkbox: {
    label: "Checkboxes",
    icon: CheckSquare,
    description: "Select multiple options",
  },
  select: {
    label: "Dropdown",
    icon: ChevronDown,
    description: "Select one option from a dropdown",
  },
  image: {
    label: "Image Upload",
    icon: ImagePlus,
    description: "Respondents upload an image (e.g. ID, receipt)",
  },
};

export default function FormBuilderStudio({
  eventId,
  eventTitle,
  initialSchema,
  backUrl = "/club/dashboard",
}: FormBuilderStudioProps) {
  const [fields, setFields] = useState<FormFieldSchema[]>(
    initialSchema && initialSchema.length > 0
      ? initialSchema
      : [
          {
            id: `field_${Date.now()}_1`,
            type: "text",
            label: "T-Shirt Size or Roll Number",
            placeholder: "e.g. XL or 21CS045",
            helpText: "Provide additional details for logistics",
            isRequired: true,
          },
        ]
  );

  const [activeTab, setActiveTab] = useState<"builder" | "preview">("builder");
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Helper to trigger toast
  const showToast = (type: "success" | "error", text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Add field
  const handleAddField = (type: FieldType) => {
    const newField: FormFieldSchema = {
      id: `field_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      type,
      label: `Untitled ${FIELD_TYPE_LABELS[type].label} Question`,
      isRequired: true,
      placeholder: type === "text" || type === "textarea" ? "Type your response..." : undefined,
      options:
        type === "radio" || type === "checkbox" || type === "select"
          ? ["Option 1", "Option 2", "Option 3"]
          : undefined,
    };
    setFields((prev) => [...prev, newField]);
  };

  // Update field property
  const handleUpdateField = (
    id: string,
    updates: Partial<FormFieldSchema>
  ) => {
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  };

  // Delete field
  const handleDeleteField = (id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
  };

  // Move field
  const handleMoveField = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === fields.length - 1)
    )
      return;

    const newIndex = direction === "up" ? index - 1 : index + 1;
    const updated = [...fields];
    const [movedItem] = updated.splice(index, 1);
    updated.splice(newIndex, 0, movedItem);
    setFields(updated);
  };

  // Option handlers for choice fields
  const handleAddOption = (fieldId: string) => {
    setFields((prev) =>
      prev.map((f) => {
        if (f.id === fieldId) {
          const currentOptions = f.options || [];
          return {
            ...f,
            options: [...currentOptions, `Option ${currentOptions.length + 1}`],
          };
        }
        return f;
      })
    );
  };

  const handleUpdateOption = (
    fieldId: string,
    optIndex: number,
    val: string
  ) => {
    setFields((prev) =>
      prev.map((f) => {
        if (f.id === fieldId && f.options) {
          const updated = [...f.options];
          updated[optIndex] = val;
          return { ...f, options: updated };
        }
        return f;
      })
    );
  };

  const handleDeleteOption = (fieldId: string, optIndex: number) => {
    setFields((prev) =>
      prev.map((f) => {
        if (f.id === fieldId && f.options) {
          if (f.options.length <= 1) return f; // Keep at least one
          const updated = f.options.filter((_, i) => i !== optIndex);
          return { ...f, options: updated };
        }
        return f;
      })
    );
  };

  // Save Schema
  const handleSave = async () => {
    setIsSaving(true);
    setToastMessage(null);
    try {
      await saveEventFormSchema(eventId, fields);
      showToast("success", "Form schema saved successfully!");
    } catch (err: any) {
      showToast("error", err.message || "Failed to save form schema.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Toast Feedback */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border animate-in slide-in-from-bottom-5 duration-300 ${
            toastMessage.type === "success"
              ? "bg-emerald-950 text-emerald-200 border-emerald-800/50"
              : "bg-red-950 text-red-200 border-red-800/50"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 size={20} className="text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertCircle size={20} className="text-red-400 flex-shrink-0" />
          )}
          <span className="text-sm font-semibold">{toastMessage.text}</span>
        </div>
      )}

      {/* Top Navigation Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href={backUrl}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Back"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-primary/10 text-primary text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Form Studio
                </span>
                <span className="text-slate-400 text-xs">•</span>
                <span className="text-slate-500 text-xs truncate max-w-[200px] sm:max-w-xs font-medium">
                  {eventTitle}
                </span>
              </div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight">
                Event Registration Form Builder
              </h1>
            </div>
          </div>

          {/* Controls Header */}
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
              <button
                type="button"
                onClick={() => setActiveTab("builder")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === "builder"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Edit3 size={14} />
                Builder
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === "preview"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Eye size={14} />
                Preview
              </button>
            </div>

            {/* Save Button */}
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="bg-primary hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={15} />
                  Save Schema
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-8">
        {activeTab === "builder" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Form Builder Questions List */}
            <div className="lg:col-span-8 space-y-6">
              {/* Header Info */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Form Questions ({fields.length})
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Configure custom questions for students registering for this event.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold text-slate-400 block uppercase">
                    System Fields
                  </span>
                  <span className="text-xs font-semibold text-slate-600">
                    Name, Email (Auto-filled)
                  </span>
                </div>
              </div>

              {fields.length === 0 ? (
                <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
                  <Sparkles size={36} className="mx-auto text-slate-300 mb-3" />
                  <h3 className="text-sm font-bold text-slate-700">
                    No Custom Questions Added
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Students will only provide basic profile details unless you add custom question fields below.
                  </p>
                </div>
              ) : (
                fields.map((field, idx) => {
                  const Icon = FIELD_TYPE_LABELS[field.type]?.icon || Type;
                  return (
                    <div
                      key={field.id}
                      className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 hover:border-slate-300 transition-all group"
                    >
                      {/* Field Card Header */}
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 text-xs font-black flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                            <Icon size={13} className="text-primary" />
                            {FIELD_TYPE_LABELS[field.type]?.label}
                          </span>
                        </div>

                        {/* Order & Delete Actions */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleMoveField(idx, "up")}
                            disabled={idx === 0}
                            className="p-1.5 text-slate-400 hover:text-slate-800 disabled:opacity-20 transition-colors"
                            title="Move Up"
                          >
                            <MoveUp size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveField(idx, "down")}
                            disabled={idx === fields.length - 1}
                            className="p-1.5 text-slate-400 hover:text-slate-800 disabled:opacity-20 transition-colors"
                            title="Move Down"
                          >
                            <MoveDown size={15} />
                          </button>
                          <div className="w-px h-4 bg-slate-200 mx-1" />
                          <button
                            type="button"
                            onClick={() => handleDeleteField(field.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                            title="Delete Question"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      {/* Question Label */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                          Question Label *
                        </label>
                        <input
                          type="text"
                          value={field.label}
                          onChange={(e) =>
                            handleUpdateField(field.id, {
                              label: e.target.value,
                            })
                          }
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary text-sm font-medium outline-none transition-all"
                          placeholder="e.g. What is your T-Shirt Size?"
                        />
                      </div>

                      {/* Options Configuration for Choice Fields */}
                      {(field.type === "radio" ||
                        field.type === "checkbox" ||
                        field.type === "select") && (
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                            Answer Choices
                          </label>
                          {field.options?.map((opt, optIdx) => (
                            <div
                              key={optIdx}
                              className="flex items-center gap-2"
                            >
                              <span className="text-slate-400 text-xs font-mono w-4">
                                {optIdx + 1}.
                              </span>
                              <input
                                type="text"
                                value={opt}
                                onChange={(e) =>
                                  handleUpdateOption(
                                    field.id,
                                    optIdx,
                                    e.target.value
                                  )
                                }
                                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:border-primary outline-none"
                                placeholder={`Option ${optIdx + 1}`}
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteOption(field.id, optIdx)
                                }
                                className="text-slate-400 hover:text-red-500 p-1 text-xs"
                                title="Remove Option"
                              >
                                &times;
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => handleAddOption(field.id)}
                            className="mt-1 text-xs text-primary font-bold hover:underline flex items-center gap-1"
                          >
                            + Add Option
                          </button>
                        </div>
                      )}

                    {/* Placeholder & Helper Text for Inputs */}
                    {(field.type === "text" || field.type === "textarea") && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                            Placeholder Text
                          </label>
                          <input
                            type="text"
                            value={field.placeholder || ""}
                            onChange={(e) =>
                              handleUpdateField(field.id, {
                                placeholder: e.target.value,
                              })
                            }
                            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-primary outline-none"
                            placeholder="e.g. Enter details here..."
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                            Help Text / Subtext
                          </label>
                          <input
                            type="text"
                            value={field.helpText || ""}
                            onChange={(e) =>
                              handleUpdateField(field.id, {
                                helpText: e.target.value,
                              })
                            }
                            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-primary outline-none"
                            placeholder="e.g. Provide accurate size"
                          />
                        </div>
                      </div>
                    )}

                    {/* Helper Text for Image Upload fields */}
                    {field.type === "image" && (
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                          Help Text / Subtext
                        </label>
                        <input
                          type="text"
                          value={field.helpText || ""}
                          onChange={(e) =>
                            handleUpdateField(field.id, {
                              helpText: e.target.value,
                            })
                          }
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-primary outline-none"
                          placeholder="e.g. Upload a clear photo of your ID card"
                        />
                      </div>
                    )}

                      {/* IsRequired Toggle */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs text-slate-500 flex items-center gap-1.5">
                          <HelpCircle size={13} className="text-slate-400" />
                          Require student response to proceed
                        </span>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={field.isRequired}
                            onChange={(e) =>
                              handleUpdateField(field.id, {
                                isRequired: e.target.checked,
                              })
                            }
                            className="w-4 h-4 rounded text-primary focus:ring-primary border-slate-300"
                          />
                          <span className="text-xs font-bold text-slate-700">
                            Required Field
                          </span>
                        </label>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Right Sidebar: Add Questions Palette */}
            <div className="lg:col-span-4 space-y-4">
              <div className="sticky top-24 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Add Question Fields
                </h3>

                <div className="space-y-2">
                  {(Object.keys(FIELD_TYPE_LABELS) as FieldType[]).map(
                    (type) => {
                      const item = FIELD_TYPE_LABELS[type];
                      const Icon = item.icon;
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => handleAddField(type)}
                          className="w-full p-3 rounded-xl border border-slate-200 hover:border-primary/50 hover:bg-primary/5 text-left transition-all group flex items-start gap-3"
                        >
                          <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-primary group-hover:text-white text-slate-600 transition-colors">
                            <Icon size={16} />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 group-hover:text-primary block">
                              + {item.label}
                            </span>
                            <span className="text-[11px] text-slate-500 block leading-tight">
                              {item.description}
                            </span>
                          </div>
                        </button>
                      );
                    }
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 leading-relaxed">
                  💡 <strong>Tip:</strong> Changes made here take effect immediately upon saving. Existing responses are preserved.
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Preview Mode Component */
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl border border-slate-200 shadow-lg space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <span className="bg-emerald-100 text-emerald-700 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-block mb-2">
                Form Live Preview
              </span>
              <h2 className="text-2xl font-black text-slate-900">
                {eventTitle}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Student Registration Preview Form
              </p>
            </div>

            {/* Mock System Pre-filled fields */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                System Auto-Filled Student Data
              </span>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block">Student Name:</span>
                  <span className="font-semibold text-slate-800">
                    Alex Rivera (Preview User)
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Email:</span>
                  <span className="font-semibold text-slate-800">
                    alex@university.edu
                  </span>
                </div>
              </div>
            </div>

            {/* Render Preview Custom Questions */}
            <div className="space-y-5">
              {fields.length === 0 ? (
                <p className="text-center text-slate-400 text-xs py-8">
                  No custom questions added yet.
                </p>
              ) : (
                fields.map((field, idx) => (
                  <div key={field.id} className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800">
                      {field.label}{" "}
                      {field.isRequired && (
                        <span className="text-red-500">*</span>
                      )}
                    </label>
                    {field.helpText && (
                      <p className="text-[11px] text-slate-500 mb-1">
                        {field.helpText}
                      </p>
                    )}

                    {field.type === "text" && (
                      <input
                        type="text"
                        disabled
                        placeholder={field.placeholder || "Your answer"}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs outline-none cursor-not-allowed"
                      />
                    )}

                    {field.type === "textarea" && (
                      <textarea
                        disabled
                        rows={3}
                        placeholder={field.placeholder || "Your response..."}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs outline-none cursor-not-allowed"
                      />
                    )}

                    {field.type === "select" && (
                      <select
                        disabled
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs outline-none cursor-not-allowed"
                      >
                        <option value="">-- Select an option --</option>
                        {field.options?.map((opt, i) => (
                          <option key={i}>{opt}</option>
                        ))}
                      </select>
                    )}

                    {field.type === "radio" && (
                      <div className="space-y-2 pt-1">
                        {field.options?.map((opt, i) => (
                          <label
                            key={i}
                            className="flex items-center gap-2.5 text-xs text-slate-700 cursor-not-allowed"
                          >
                            <input
                              type="radio"
                              disabled
                              name={field.id}
                              className="w-4 h-4 text-primary"
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {field.type === "checkbox" && (
                      <div className="space-y-2 pt-1">
                        {field.options?.map((opt, i) => (
                          <label
                            key={i}
                            className="flex items-center gap-2.5 text-xs text-slate-700 cursor-not-allowed"
                          >
                            <input
                              type="checkbox"
                              disabled
                              className="w-4 h-4 rounded text-primary border-slate-300"
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {field.type === "image" && (
                      <div className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-[11px] text-slate-500">
                        <ImagePlus size={15} className="text-slate-400" />
                        Image upload area (respondents attach an image here)
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <button
              disabled
              className="w-full bg-slate-200 text-slate-400 font-bold text-xs py-3.5 rounded-xl cursor-not-allowed"
            >
              Submit Registration (Preview Mode)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
