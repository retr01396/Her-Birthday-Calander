"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, CheckCircle2, Loader2, MapPin, Plus, Save, Sparkles, Trash2, Trophy, UploadCloud } from "lucide-react";
import { createOrUpdateClubEvent } from "@/app/actions/clubDashboardActions";
import { saveEventFormSchema } from "@/app/actions/eventFormActions";
import { CldUploadWidget } from "next-cloudinary";
import { FormFieldSchema, FieldType } from "@/types/formBuilder";

const defaultSchema: FormFieldSchema[] = [
  {
    id: `field_${Date.now()}_1`,
    type: "text",
    label: "Roll Number or Team Name",
    placeholder: "e.g. 21CS045 or Team Phoenix",
    helpText: "This helps us track registrations for the event.",
    isRequired: true,
  },
];

const fieldTypeLabels: Record<FieldType, string> = {
  text: "Short Answer",
  textarea: "Paragraph",
  radio: "Multiple Choice",
  checkbox: "Checkboxes",
  select: "Dropdown",
  image: "Image Upload",
};

export function CreateClubEventPageClient() {
  const router = useRouter();
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    location: "",
    startDate: new Date().toISOString().slice(0, 10),
    startTime: "18:00",
    capacity: 100,
    showCapacityLimit: true,
    registrationFee: 0,
    imageUrl: "",
    passType: "PASS",
    regType: "INTERNAL",
    requiresApproval: false,
    externalProvider: "MAKEMYPASS",
    externalRegUrl: "",
    isTeamEvent: false,
    minTeamSize: 2,
    maxTeamSize: 4,
    passStrategy: "CAPTAIN_ONLY",
  });
  const [formFields, setFormFields] = useState<FormFieldSchema[]>(defaultSchema);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const eventTitlePreview = useMemo(
    () => eventForm.title.trim() || "New Club Event",
    [eventForm.title]
  );

  const addField = (type: FieldType) => {
    const newField: FormFieldSchema = {
      id: `field_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      type,
      label: `Untitled ${fieldTypeLabels[type]} Question`,
      isRequired: true,
      placeholder: type === "text" || type === "textarea" ? "Type your response..." : undefined,
      options:
        type === "radio" || type === "checkbox" || type === "select"
          ? ["Option 1", "Option 2", "Option 3"]
          : undefined,
    };
    setFormFields((prev) => [...prev, newField]);
  };

  const updateField = (id: string, updates: Partial<FormFieldSchema>) => {
    setFormFields((prev) => prev.map((field) => (field.id === id ? { ...field, ...updates } : field)));
  };

  const removeField = (id: string) => {
    setFormFields((prev) => prev.filter((field) => field.id !== id));
  };

  const addOption = (fieldId: string) => {
    setFormFields((prev) =>
      prev.map((field) => {
        if (field.id !== fieldId || !field.options) return field;
        return {
          ...field,
          options: [...field.options, `Option ${field.options.length + 1}`],
        };
      })
    );
  };

  const updateOption = (fieldId: string, optionIndex: number, value: string) => {
    setFormFields((prev) =>
      prev.map((field) => {
        if (field.id !== fieldId || !field.options) return field;
        const nextOptions = [...field.options];
        nextOptions[optionIndex] = value;
        return { ...field, options: nextOptions };
      })
    );
  };

  const removeOption = (fieldId: string, optionIndex: number) => {
    setFormFields((prev) =>
      prev.map((field) => {
        if (field.id !== fieldId || !field.options) return field;
        if (field.options.length <= 1) return field;
        return {
          ...field,
          options: field.options.filter((_, index) => index !== optionIndex),
        };
      })
    );
  };

  const handlePublishEvent = async () => {
    if (!eventForm.title.trim() || !eventForm.description.trim() || !eventForm.location.trim()) {
      setError("Please complete the event title, description, and location before publishing.");
      return;
    }

    setIsPublishing(true);
    setError(null);

    try {
       const event = await createOrUpdateClubEvent({
        title: eventForm.title.trim(),
        description: eventForm.description.trim(),
        location: eventForm.location.trim(),
        startDate: eventForm.startDate,
        startTime: eventForm.startTime,
        capacity: Number(eventForm.capacity) || 0,
        showCapacityLimit: eventForm.showCapacityLimit,
        imageUrl: eventForm.imageUrl || undefined,
        passType: eventForm.passType,
        registrationFee: Number(eventForm.registrationFee) || 0,
        status: "PUBLISHED",
        requiresApproval: eventForm.regType === "INTERNAL" ? eventForm.requiresApproval : false,
        regType: eventForm.regType as any,
        externalProvider: eventForm.regType === "EXTERNAL" ? eventForm.externalProvider as any : undefined,
        externalRegUrl: eventForm.regType === "EXTERNAL" ? eventForm.externalRegUrl.trim() : undefined,
        isTeamEvent: eventForm.isTeamEvent,
        minTeamSize: Number(eventForm.minTeamSize),
        maxTeamSize: Number(eventForm.maxTeamSize),
        passStrategy: eventForm.isTeamEvent ? eventForm.passStrategy : "CAPTAIN_ONLY",
      });

      if (event.event.id) {
        await saveEventFormSchema(event.event.id, formFields);
      }

      router.push("/club/dashboard");
    } catch (err: any) {
      setError(err.message || "Could not publish the event.");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/club/dashboard")}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              aria-label="Back to dashboard"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
                <Sparkles size={12} />
                Club Event Studio
              </div>
              <h1 className="mt-2 text-xl font-black tracking-tight text-slate-900">Create & Publish Event</h1>
            </div>
          </div>

          <button
            type="button"
            onClick={handlePublishEvent}
            disabled={isPublishing}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isPublishing ? "Publishing..." : "Publish Event"}
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                Event Title
              </label>
              <input
                value={eventForm.title}
                onChange={(e) => setEventForm((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="AI & Robotics Hackathon"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                Description
              </label>
              <textarea
                rows={5}
                value={eventForm.description}
                onChange={(e) => setEventForm((prev) => ({ ...prev, description: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Share the details, agenda, and what attendees can expect."
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  Date
                </label>
                <input
                  type="date"
                  value={eventForm.startDate}
                  onChange={(e) => setEventForm((prev) => ({ ...prev, startDate: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  Time
                </label>
                <input
                  type="time"
                  value={eventForm.startTime}
                  onChange={(e) => setEventForm((prev) => ({ ...prev, startTime: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    value={eventForm.location}
                    onChange={(e) => setEventForm((prev) => ({ ...prev, location: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 py-3 pl-9 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="Main Auditorium"
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  Capacity
                </label>
                <input
                  type="number"
                  min={1}
                  value={eventForm.capacity}
                  onChange={(e) => setEventForm((prev) => ({ ...prev, capacity: Number(e.target.value) || 0 }))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Team Event Configuration */}
            <div>
              <label className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 cursor-pointer">
                <div>
                  <span className="block text-xs font-bold text-slate-700">
                    Team Event
                  </span>
                  <span className="block text-[11px] text-slate-500 mt-0.5">
                    Allow students to register as a team.
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={eventForm.isTeamEvent}
                  onClick={() => setEventForm((prev) => ({ ...prev, isTeamEvent: !prev.isTeamEvent }))}
                  className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                    eventForm.isTeamEvent ? "bg-emerald-500" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
                      eventForm.isTeamEvent ? "left-[22px]" : "left-0.5"
                    }`}
                  />
                </button>
              </label>

              {eventForm.isTeamEvent && (
                <div className="mt-4 grid gap-4 md:grid-cols-3 p-4 rounded-xl border border-primary/20 bg-primary/5">
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                      Min Team Size
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={eventForm.minTeamSize}
                      onChange={(e) => setEventForm((prev) => ({ ...prev, minTeamSize: Number(e.target.value) || 2 }))}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                      Max Team Size
                    </label>
                    <input
                      type="number"
                      min={2}
                      value={eventForm.maxTeamSize}
                      onChange={(e) => setEventForm((prev) => ({ ...prev, maxTeamSize: Number(e.target.value) || 4 }))}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                      Pass Strategy
                    </label>
                    <select
                      value={eventForm.passStrategy}
                      onChange={(e) => setEventForm((prev) => ({ ...prev, passStrategy: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="CAPTAIN_ONLY">Captain Only</option>
                      <option value="INDIVIDUAL">Individual Passes</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Registration Platform: Internal vs External */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                Registration Platform
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() =>
                    setEventForm((prev) => ({ ...prev, regType: "INTERNAL" }))
                  }
                  className={`rounded-xl border-2 p-4 text-left transition ${
                    eventForm.regType === "INTERNAL"
                      ? "border-primary bg-primary/5"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <span className="block text-sm font-bold text-slate-900">
                    AntiGravity (Native)
                  </span>
                  <span className="mt-1 block text-[11px] leading-relaxed text-slate-500">
                    Use our built-in passes, application forms, and ticket scanner.
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setEventForm((prev) => ({ ...prev, regType: "EXTERNAL" }))
                  }
                  className={`rounded-xl border-2 p-4 text-left transition ${
                    eventForm.regType === "EXTERNAL"
                      ? "border-primary bg-primary/5"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <span className="block text-sm font-bold text-slate-900">
                    External Platform
                  </span>
                  <span className="mt-1 block text-[11px] leading-relaxed text-slate-500">
                    Redirect students to MakeMyPass, RSVP, or Google Forms.
                  </span>
                </button>
              </div>
            </div>

            {/* If External: Provider & Link */}
            {eventForm.regType === "EXTERNAL" && (
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                    External Provider
                  </label>
                  <select
                    value={eventForm.externalProvider}
                    onChange={(e) =>
                      setEventForm((prev) => ({ ...prev, externalProvider: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 font-semibold"
                  >
                    <option value="MAKEMYPASS">MakeMyPass (Sync via Webhook)</option>
                    <option value="RSVP">RSVP (Sync via Webhook)</option>
                    <option value="OTHERS">Others (Google Forms / Manual CSV)</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                    Registration Link
                  </label>
                  <input
                    type="url"
                    required
                    value={eventForm.externalRegUrl}
                    onChange={(e) =>
                      setEventForm((prev) => ({ ...prev, externalRegUrl: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="https://makenpass.com/..."
                  />
                </div>
              </div>
            )}

            {/* If Internal: Instant vs Shortlist */}
            {eventForm.regType === "INTERNAL" && (
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  Native Registration Flow
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() =>
                      setEventForm((prev) => ({ ...prev, requiresApproval: false }))
                    }
                    className={`rounded-xl border-2 p-4 text-left transition ${
                      !eventForm.requiresApproval
                        ? "border-primary bg-primary/5"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <span className="block text-sm font-bold text-slate-900">
                      Instant Registration
                    </span>
                    <span className="mt-1 block text-[11px] leading-relaxed text-slate-500">
                      Students register and get their pass immediately.
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setEventForm((prev) => ({ ...prev, requiresApproval: true }))
                    }
                    className={`rounded-xl border-2 p-4 text-left transition ${
                      eventForm.requiresApproval
                        ? "border-primary bg-primary/5"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <span className="block text-sm font-bold text-slate-900">
                      Application &amp; Shortlist
                    </span>
                    <span className="mt-1 block text-[11px] leading-relaxed text-slate-500">
                      Students apply via your form; you review and select who gets a pass.
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Show / hide the capacity bar on the event page */}
            <label className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 cursor-pointer">
              <div>
                <span className="block text-xs font-bold text-slate-700">
                  Show capacity limit to students
                </span>
                <span className="block text-[11px] text-slate-500 mt-0.5">
                  Displays the live seats-filled bar and "Event Full" state on the event page. Registration still closes automatically at the limit.
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={eventForm.showCapacityLimit}
                onClick={() => setEventForm((prev) => ({ ...prev, showCapacityLimit: !prev.showCapacityLimit }))}
                className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                  eventForm.showCapacityLimit ? "bg-emerald-500" : "bg-slate-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
                    eventForm.showCapacityLimit ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </button>
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  Fee (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  step="1"
                  value={eventForm.registrationFee}
                  onChange={(e) => setEventForm((prev) => ({ ...prev, registrationFee: Number(e.target.value) || 0 }))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="0 for free"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  Pass Type
                </label>
                <select
                  value={eventForm.passType}
                  onChange={(e) => setEventForm((prev) => ({ ...prev, passType: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="PASS">Pass</option>
                  <option value="TICKET">Ticket</option>
                  <option value="RSVP">RSVP</option>
                  <option value="FREE">Free Entry</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                Event Poster
              </label>
              {/* Temporary Cloudinary Disable */}
              <div className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm font-semibold text-slate-400">
                <UploadCloud className="h-4 w-4 opacity-50" />
                <span>Image upload is temporarily disabled (Cloudinary not configured)</span>
              </div>
              {eventForm.imageUrl && (
                <img src={eventForm.imageUrl} alt="Event poster" className="mt-3 h-40 w-full rounded-xl object-cover" />
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Preview</p>
                <h2 className="mt-1 text-xl font-black text-slate-900">{eventTitlePreview}</h2>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">
                <Calendar className="h-3.5 w-3.5" />
                {eventForm.startDate}
              </div>
            </div>

            <div className="space-y-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span>
                  {eventForm.startDate} at {eventForm.startTime}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>{eventForm.location || "Location to be announced"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-primary" />
                <span>{eventForm.capacity} seats • {eventForm.registrationFee > 0 ? `₹${eventForm.registrationFee}` : "Free"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                {eventForm.requiresApproval ? "Application Form" : "Registration Form"}
              </p>
              <h3 className="mt-1 text-xl font-black text-slate-900">
                {eventForm.requiresApproval
                  ? "Questions students answer to apply"
                  : "Build custom fields"}
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {(["text", "textarea", "radio", "checkbox", "select", "image"] as FieldType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => addField(type)}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:border-primary hover:bg-primary/5 hover:text-primary"
                >
                  + {fieldTypeLabels[type]}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {formFields.map((field, index) => (
              <div key={field.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {index + 1}
                    </span>
                    <span className="text-sm font-bold text-slate-700">{fieldTypeLabels[field.type]}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeField(field.id)}
                    className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                    aria-label="Remove field"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Question</label>
                    <input
                      value={field.label}
                      onChange={(e) => updateField(field.id, { label: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Type</label>
                    <select
                      value={field.type}
                      onChange={(e) => updateField(field.id, { type: e.target.value as FieldType })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    >
                      {(["text", "textarea", "radio", "checkbox", "select", "image"] as FieldType[]).map((type) => (
                        <option key={type} value={type}>{fieldTypeLabels[type]}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {(field.type === "text" || field.type === "textarea") && (
                  <div className="mt-4">
                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Placeholder</label>
                    <input
                      value={field.placeholder || ""}
                      onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                )}

                {(field.type === "radio" || field.type === "checkbox" || field.type === "select") && (
                  <div className="mt-4 space-y-2">
                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Options</label>
                    {(field.options || ["Option 1"]).map((option, optionIndex) => (
                      <div key={`${field.id}-option-${optionIndex}`} className="flex items-center gap-2">
                        <input
                          value={option}
                          onChange={(e) => updateOption(field.id, optionIndex, e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                        <button
                          type="button"
                          onClick={() => removeOption(field.id, optionIndex)}
                          className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                          aria-label="Remove option"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addOption(field.id)}
                      className="mt-2 inline-flex items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-primary hover:text-primary"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Option
                    </button>
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2">
                  <span className="text-xs font-semibold text-slate-600">Required</span>
                  <input
                    type="checkbox"
                    checked={field.isRequired}
                    onChange={(e) => updateField(field.id, { isRequired: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
