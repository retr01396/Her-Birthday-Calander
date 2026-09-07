import { useState } from "react";
import { AlertCircle } from "lucide-react";

interface Step1Props {
  data: any;
  updateData: (fields: Partial<any>) => void;
  onNext: () => void;
  onSwitchToSignIn: () => void;
}

export function Step1ProfileDetails({ data, updateData, onNext, onSwitchToSignIn }: Step1Props) {
  const [error, setError] = useState<string | null>(null);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.email.endsWith("@cce.edu.in")) {
      setError("Please use a valid @cce.edu.in email address.");
      return;
    }
    if ((data.password || "").length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (data.password !== data.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!data.name || !data.department || !data.graduationYear || !data.class) {
      setError("Please fill all required fields.");
      return;
    }
    setError(null);
    onNext();
  };

  return (
    <div className="fixed inset-0 overflow-y-auto bg-[#F8FAFC]" style={{ backgroundImage: "radial-gradient(circle at 50% 0%, rgba(60, 123, 255, 0.05) 0%, transparent 70%)" }}>
      {/* Header */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50 rounded-full bg-white/90 backdrop-blur-md shadow-sm border border-gray-100 px-6 py-4 flex items-center justify-between">
        <a className="text-[#3C7BFF] font-bold text-xl tracking-tight" href="#">CampusHub</a>
        <nav className="hidden md:flex items-center gap-8">
          <span className="text-[#3C7BFF] font-semibold border-b-2 border-[#3C7BFF] pb-1">Onboarding</span>
        </nav>
        <div className="flex items-center gap-4">
           <button onClick={onSwitchToSignIn} className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">Sign In Instead</button>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-6 md:p-10 z-10 w-full max-w-4xl mx-auto pt-32 pb-20 min-h-screen">
        <div className="w-full max-w-2xl">
          {/* Progress Indicator */}
          <div className="mb-8 flex items-center justify-center space-x-2 text-sm font-semibold">
            <span className="text-[#3C7BFF] bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100 shadow-sm">1. Academic Details</span>
            <span className="text-gray-400">→</span>
            <span className="text-gray-500">2. Club Selection</span>
          </div>

          {/* Header text */}
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#1E293B] tracking-tight leading-tight mb-4">
              Welcome! Let’s set up your profile
            </h1>
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed font-medium">
              Enter your university details to personalize your workspace.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6 md:p-8 relative">
            
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
                <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleNext}>
              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-[#1E293B] mb-2" htmlFor="fullName">Full Name</label>
                <input
                  className="w-full bg-gray-50 rounded-xl border border-gray-200 px-4 py-3 text-[#1E293B] focus:bg-white focus:ring-2 focus:ring-[#3C7BFF] focus:border-transparent outline-none transition-all shadow-sm placeholder-gray-400 font-medium"
                  id="fullName" name="fullName" placeholder="e.g. Jane Doe" required type="text"
                  value={data.name || ""} onChange={(e) => updateData({ name: e.target.value })}
                />
              </div>

              {/* Institutional Email */}
              <div>
                <label className="block text-sm font-semibold text-[#1E293B] mb-2" htmlFor="email">Institutional Email</label>
                <input
                  className="w-full bg-gray-50 rounded-xl border border-gray-200 px-4 py-3 text-[#1E293B] focus:bg-white focus:ring-2 focus:ring-[#3C7BFF] focus:border-transparent outline-none transition-all shadow-sm placeholder-gray-400 font-medium"
                  id="email" name="email" placeholder="student@cce.edu.in" required type="email"
                  value={data.email || ""} onChange={(e) => updateData({ email: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-[#1E293B] mb-2" htmlFor="password">Password</label>
                  <input
                    className="w-full bg-gray-50 rounded-xl border border-gray-200 px-4 py-3 text-[#1E293B] focus:bg-white focus:ring-2 focus:ring-[#3C7BFF] focus:border-transparent outline-none transition-all shadow-sm placeholder-gray-400 font-medium"
                    id="password" name="password" placeholder="••••••••" required type="password" minLength={8}
                    value={data.password || ""} onChange={(e) => updateData({ password: e.target.value })}
                  />
                </div>
                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-semibold text-[#1E293B] mb-2" htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    className="w-full bg-gray-50 rounded-xl border border-gray-200 px-4 py-3 text-[#1E293B] focus:bg-white focus:ring-2 focus:ring-[#3C7BFF] focus:border-transparent outline-none transition-all shadow-sm placeholder-gray-400 font-medium"
                    id="confirmPassword" name="confirmPassword" placeholder="••••••••" required type="password"
                    value={data.confirmPassword || ""} onChange={(e) => updateData({ confirmPassword: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Department */}
                <div>
                  <label className="block text-sm font-semibold text-[#1E293B] mb-2" htmlFor="department">Department</label>
                  <div className="relative">
                    <select
                      className="w-full bg-gray-50 rounded-xl border border-gray-200 px-4 py-3 text-[#1E293B] focus:bg-white focus:ring-2 focus:ring-[#3C7BFF] focus:border-transparent outline-none appearance-none transition-all shadow-sm cursor-pointer font-medium"
                      id="department" name="department" required
                      value={data.department || ""} onChange={(e) => updateData({ department: e.target.value, class: "" })}
                    >
                      <option disabled value="">Select Department</option>
                      <option value="CE">Civil Engineering (CE)</option>
                      <option value="CSE">Computer Science & Eng (CSE)</option>
                      <option value="CSDS">Computer Science & Data Science (CSDS)</option>
                      <option value="CSBS">Computer Science & Business Systems (CSBS)</option>
                      <option value="ECE">Electronics & Comm Eng (ECE)</option>
                      <option value="VLSI">Electronics VLSI Design (VLSI)</option>
                      <option value="EEE">Electrical & Electronics Eng (EEE)</option>
                      <option value="ME">Mechanical Engineering (ME)</option>
                    </select>
                  </div>
                </div>
                {/* Graduation Year */}
                <div>
                  <label className="block text-sm font-semibold text-[#1E293B] mb-2" htmlFor="gradYear">Graduation Year</label>
                  <div className="relative">
                    <select
                      className="w-full bg-gray-50 rounded-xl border border-gray-200 px-4 py-3 text-[#1E293B] focus:bg-white focus:ring-2 focus:ring-[#3C7BFF] focus:border-transparent outline-none appearance-none transition-all shadow-sm cursor-pointer font-medium"
                      id="gradYear" name="gradYear" required
                      value={data.graduationYear || ""} onChange={(e) => updateData({ graduationYear: e.target.value })}
                    >
                      <option disabled value="">Select Year</option>
                      {Array.from({length: 6}, (_, i) => new Date().getFullYear() + i).map(y => (
                        <option key={y} value={y.toString()}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Class / Division */}
              <div>
                <label className="block text-sm font-semibold text-[#1E293B] mb-2" htmlFor="classDivision">Class / Division</label>
                <div className="relative">
                  <select
                    className="w-full bg-gray-50 rounded-xl border border-gray-200 px-4 py-3 text-[#1E293B] focus:bg-white focus:ring-2 focus:ring-[#3C7BFF] focus:border-transparent outline-none appearance-none transition-all shadow-sm cursor-pointer font-medium disabled:opacity-50"
                    id="classDivision" name="classDivision" required disabled={!data.department}
                    value={data.class || ""} onChange={(e) => updateData({ class: e.target.value })}
                  >
                    <option disabled value="">Select Class</option>
                    {data.department === "CSE" ? (
                      <>
                        <option value="CSE-A">CSE-A</option>
                        <option value="CSE-B">CSE-B</option>
                        <option value="CSE-C">CSE-C</option>
                        <option value="CSE-D">CSE-D</option>
                      </>
                    ) : data.department ? (
                      <option value={data.department}>{data.department}</option>
                    ) : null}
                  </select>
                </div>
              </div>

              {/* Footer / CTA */}
              <div className="pt-6 mt-6 border-t border-gray-100 flex justify-end">
                <button
                  className="w-full md:w-auto px-8 py-3.5 bg-[#3C7BFF] text-white font-bold rounded-full shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 hover:bg-blue-600"
                  type="submit"
                >
                  Continue to Club Selection
                  <span className="transform transition-transform">→</span>
                </button>
              </div>
            </form>
          </div>

          <div className="mt-8 flex justify-center items-center gap-4 text-sm text-gray-500 font-medium">
            <span className="flex items-center gap-1.5">Secure</span>
            <span className="">•</span>
            <span className="">University Verified</span>
          </div>
        </div>
      </main>
    </div>
  );
}
