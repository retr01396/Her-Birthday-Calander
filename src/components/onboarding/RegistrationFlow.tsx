import { useState, useEffect } from "react";
import { Step1ProfileDetails } from "./Step1ProfileDetails";
import { StepEmailVerification } from "./StepEmailVerification";
import { Step2OrganizationSelection } from "./Step2OrganizationSelection";

interface RegistrationFlowProps {
  onSuccess: () => void;
  onSwitchToSignIn: () => void;
}

export function RegistrationFlow({ onSuccess, onSwitchToSignIn }: RegistrationFlowProps) {
  // Try to load from sessionStorage
  const loadState = () => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("registrationState");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    return null;
  };

  const initialState = loadState() || {
    step: 1,
    studentDetails: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      department: "",
      graduationYear: "",
      class: "",
    },
    selections: {
      clubIds: [] as string[],
      professionalBodyId: null as string | null,
      applications: {} as Record<string, Record<string, any>>,
    },
    verifiedEmail: "",
    verificationToken: "",
  };

  const [step, setStep] = useState<1 | 2 | 3>(initialState.step);
  const [studentDetails, setStudentDetails] = useState(initialState.studentDetails);
  const [selections, setSelections] = useState(initialState.selections);
  const [verifiedEmail, setVerifiedEmail] = useState(initialState.verifiedEmail || "");
  const [verificationToken, setVerificationToken] = useState(
    initialState.verificationToken || ""
  );

  // Sync to sessionStorage
  useEffect(() => {
    sessionStorage.setItem("registrationState", JSON.stringify({
      step,
      studentDetails,
      selections,
      verifiedEmail,
      verificationToken,
    }));
  }, [step, studentDetails, selections, verifiedEmail, verificationToken]);

  // Updating the email invalidates any previously verified code for an old
  // address — the new address must be verified from scratch.
  const updateStudentDetails = (fields: Partial<typeof studentDetails>) => {
    const next = { ...studentDetails, ...fields };
    setStudentDetails(next);
    if (typeof fields.email === "string" && fields.email !== verifiedEmail) {
      setVerifiedEmail("");
      setVerificationToken("");
    }
  };

  const emailIsVerified =
    studentDetails.email === verifiedEmail && verificationToken !== "";

  const handleSubmit = async () => {
    // Error handling handled inside Step 2
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...studentDetails,
          enrolledClubs: selections.clubIds,
          enrolledProfessionalBody: selections.professionalBodyId,
          clubApplications: selections.applications || {},
          emailVerificationToken: verificationToken,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed.");
      }

      // Clear session storage on success
      sessionStorage.removeItem("registrationState");
      onSuccess();
    } catch (err: any) {
      throw err;
    }
  };

  if (step === 1) {
    return (
      <Step1ProfileDetails
        data={studentDetails}
        updateData={updateStudentDetails}
        onNext={() => setStep(2)}
        onSwitchToSignIn={onSwitchToSignIn}
      />
    );
  }

  if (step === 2) {
    return (
      <StepEmailVerification
        email={studentDetails.email}
        defaultVerified={emailIsVerified}
        onVerified={(token) => {
          setVerifiedEmail(studentDetails.email);
          setVerificationToken(token);
        }}
        onContinue={() => setStep(3)}
        onBack={() => setStep(1)}
        onSwitchToSignIn={onSwitchToSignIn}
      />
    );
  }

  return (
    <Step2OrganizationSelection
      selections={selections}
      updateSelections={(fields) => setSelections({ ...selections, ...fields })}
      onSubmit={handleSubmit}
      onBack={() => setStep(2)}
      studentName={studentDetails.name}
    />
  );
}
