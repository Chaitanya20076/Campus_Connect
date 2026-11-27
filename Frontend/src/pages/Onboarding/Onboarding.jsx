import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { auth, db } from "../../firebase";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  GraduationCap,
  BriefcaseBusiness,
  UserRound,
  Mail,
  Phone,
  CalendarDays,
  Sparkles,
  Users,
  LayoutDashboard,
  Search,
  Rocket,
  Building2,
  ShieldCheck,
  LoaderCircle,
} from "lucide-react";

import { AnimatePresence, motion } from "framer-motion";

import "./Onboarding.css";

const SETUP_DURATION = 15000;

const setupSteps = [
  {
    title: "Creating your profile",
    description: "Setting up your CampusConnect identity",
    icon: UserRound,
    time: 0,
  },
  {
    title: "Personalising your experience",
    description: "Adapting CampusConnect to your interests",
    icon: Sparkles,
    time: 3,
  },
  {
    title: "Preparing your opportunities",
    description: "Getting your discovery experience ready",
    icon: Search,
    time: 6,
  },
  {
    title: "Setting up your workspace",
    description: "Preparing your collaboration space",
    icon: Users,
    time: 10,
  },
  {
    title: "Finalising your dashboard",
    description: "Your CampusConnect journey is almost ready",
    icon: LayoutDashboard,
    time: 13,
  },
];

const initialForm = {
  name: "",
  email: "",
  phone: "",
  age: "",
  gender: "",
  accountType: "",
  college: "",
  company: "",
  reason: "",
};

export default function Onboarding() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [form, setForm] = useState(initialForm);

  const [collegeStatus, setCollegeStatus] = useState("idle");
  const [collegeMessage, setCollegeMessage] = useState("");
  const [collegeSources, setCollegeSources] = useState([]);

  const [stage, setStage] = useState("form");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [setupProgress, setSetupProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);

  // Restore Firebase authentication and load an existing profile.
  useEffect(() => {
    let active = true;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!active) return;

      if (!currentUser) {
        navigate("/login", { replace: true });
        return;
      }

      setUser(currentUser);

      try {
        const userRef = doc(db, "users", currentUser.uid);
        const snapshot = await getDoc(userRef);

        if (!active) return;

        if (snapshot.exists()) {
          const saved = snapshot.data();

          if (saved.onboardingCompleted) {
            navigate("/dashboard", { replace: true });
            return;
          }

          setForm((previous) => ({
            ...previous,
            name: saved.name || currentUser.displayName || "",
            email: currentUser.email || "",
            phone: saved.phone || "",
            age: saved.age ? String(saved.age) : "",
            gender: saved.gender || "",
            accountType: saved.accountType || "",
            college: saved.college || "",
            company: saved.company || "",
            reason: saved.reason || "",
          }));

          if (saved.collegeVerified && saved.college) {
            setCollegeStatus("verified");
            setCollegeMessage("College Registered ✅");
          }
        } else {
          setForm((previous) => ({
            ...previous,
            name: currentUser.displayName || "",
            email: currentUser.email || "",
          }));
        }
      } catch (err) {
        console.error("Profile loading error:", err);
        if (active) {
          setError("Unable to load your profile. Please try again.");
        }
      } finally {
        if (active) setAuthLoading(false);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [navigate]);

  // Run the 15-second setup timeline.
  useEffect(() => {
    if (stage !== "setup") return;

    const startedAt = Date.now();

    const interval = window.setInterval(() => {
      const elapsed = (Date.now() - startedAt) / 1000;
      const progress = Math.min(
        100,
        Math.round((elapsed / (SETUP_DURATION / 1000)) * 100)
      );

      setSetupProgress(progress);

      let currentStep = 0;

      setupSteps.forEach((step, index) => {
        if (elapsed >= step.time) currentStep = index;
      });

      setActiveStep(currentStep);

      if (elapsed >= SETUP_DURATION / 1000) {
        window.clearInterval(interval);
        navigate("/dashboard", { replace: true });
      }
    }, 100);

    return () => window.clearInterval(interval);
  }, [stage, navigate]);

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setError("");

    if (field === "college") {
      setCollegeStatus("idle");
      setCollegeMessage("");
      setCollegeSources([]);
    }
  };

  // Verify the college through the existing backend's Tavily integration.
  const verifyCollege = async () => {
    const collegeName = form.college.trim();

    if (collegeName.length < 3) {
      setCollegeStatus("not-found");
      setCollegeMessage("Enter a valid college name first.");
      return;
    }

    setCollegeStatus("checking");
    setCollegeMessage("Searching credible sources...");
    setCollegeSources([]);

    try {
      const response = await fetch("/api/institutions/verify-college", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          collegeName,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "College verification failed."
        );
      }

      if (data.verified) {
        setCollegeStatus("verified");
        setCollegeMessage("College Registered ✅");
        setCollegeSources(data.sources || []);
      } else {
        setCollegeStatus("not-found");
        setCollegeMessage(
          data.message || "College could not be verified."
        );
      }
    } catch (err) {
      console.error("College verification error:", err);
      setCollegeStatus("error");
      setCollegeMessage(
        err.message || "Unable to verify right now. Please try again."
      );
    }
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      return "Please enter your full name.";
    }

    if (!form.email.trim()) {
      return "Your Firebase email could not be found. Please sign in again.";
    }

    const phoneDigits = form.phone.replace(/\D/g, "");

    if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      return "Please enter a valid phone number.";
    }

    const age = Number(form.age);

    if (!Number.isInteger(age) || age < 16 || age > 100) {
      return "Please enter a valid age between 16 and 100.";
    }

    if (!form.gender) {
      return "Please select your gender.";
    }

    if (!form.accountType) {
      return "Please select your account type.";
    }

    if (form.accountType === "student") {
      if (!form.college.trim()) {
        return "Please enter your college name.";
      }

      if (collegeStatus !== "verified") {
        return "Please verify your college before continuing.";
      }
    }

    if (form.accountType === "professional") {
      if (!form.company.trim()) {
        return "Please enter the company you work at.";
      }
    }

    if (!form.reason.trim()) {
      return "Please tell us why you want to join CampusConnect.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    setSaving(true);

    try {
      const userRef = doc(db, "users", user.uid);
      const existing = await getDoc(userRef);

      const profileData = {
        uid: user.uid,
        name: form.name.trim(),
        email: user.email,
        phone: form.phone.trim(),
        age: Number(form.age),
        gender: form.gender,
        accountType: form.accountType,
        reason: form.reason.trim(),
        college:
          form.accountType === "student"
            ? form.college.trim()
            : null,
        company:
          form.accountType === "professional"
            ? form.company.trim()
            : null,
        collegeVerified:
          form.accountType === "student",
        onboardingCompleted: true,
        updatedAt: serverTimestamp(),
      };

      if (!existing.exists()) {
        profileData.createdAt = serverTimestamp();
      }

      await setDoc(userRef, profileData, { merge: true });

      setStage("setup");
      setSetupProgress(0);
      setActiveStep(0);
    } catch (err) {
      console.error("Onboarding save error:", err);
      setError(
        err.message || "Unable to save your profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <main className="cc-onboarding-loading">
        <LoaderCircle className="cc-spin" size={32} />
        <p>Preparing your profile...</p>
      </main>
    );
  }

  const isStudent = form.accountType === "student";
  const isProfessional = form.accountType === "professional";

  return (
    <main className="cc-onboarding-page">
      <div className="cc-onboarding-decoration cc-onboarding-decoration-one" />
      <div className="cc-onboarding-decoration cc-onboarding-decoration-two" />

      <header className="cc-onboarding-header">
        <button
          type="button"
          className="cc-onboarding-back"
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={17} />
          Back to home
        </button>

        <div className="cc-onboarding-brand">
          <span className="cc-onboarding-brand-icon">
            <Users size={20} />
          </span>
          <span>
            Campus<span>Connect</span>
          </span>
        </div>

        <span className="cc-onboarding-step-label">
          PROFILE SETUP
        </span>
      </header>

      <AnimatePresence mode="wait">
        {stage === "form" ? (
          <motion.section
            key="onboarding-form"
            className="cc-onboarding-content"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35 }}
          >
            <div className="cc-onboarding-heading">
              <span className="cc-onboarding-eyebrow">
                <Sparkles size={15} />
                LET'S GET YOU STARTED
              </span>

              <h1>
                Let's make this
                <span> personal.</span>
              </h1>

              <p>
                Tell us a little about yourself so we can build
                your CampusConnect experience.
              </p>
            </div>

            <form
              className="cc-onboarding-card"
              onSubmit={handleSubmit}
            >
              <div className="cc-onboarding-section-heading">
                <div>
                  <h2>Personal information</h2>
                  <p>Your details help us personalise your profile.</p>
                </div>
                <UserRound size={21} />
              </div>

              <div className="cc-onboarding-grid">
                <div className="cc-field">
                  <label htmlFor="cc-name">Full name</label>
                  <input
                    id="cc-name"
                    type="text"
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="Enter your full name"
                    maxLength={80}
                    required
                  />
                </div>

                <div className="cc-field">
                  <label htmlFor="cc-email">Email address</label>
                  <div className="cc-input-with-icon">
                    <Mail size={17} />
                    <input
                      id="cc-email"
                      type="email"
                      value={form.email}
                      readOnly
                    />
                  </div>
                  <small>Connected to your Firebase account</small>
                </div>

                <div className="cc-field">
                  <label htmlFor="cc-phone">Phone number</label>
                  <div className="cc-input-with-icon">
                    <Phone size={17} />
                    <input
                      id="cc-phone"
                      type="tel"
                      value={form.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      placeholder="+91 98765 43210"
                      maxLength={18}
                      required
                    />
                  </div>
                </div>

                <div className="cc-field">
                  <label htmlFor="cc-age">Age</label>
                  <div className="cc-input-with-icon">
                    <CalendarDays size={17} />
                    <input
                      id="cc-age"
                      type="number"
                      min="16"
                      max="100"
                      value={form.age}
                      onChange={(e) => updateField("age", e.target.value)}
                      placeholder="Your age"
                      required
                    />
                  </div>
                </div>

                <div className="cc-field cc-field-full">
                  <label htmlFor="cc-gender">Gender</label>
                  <select
                    id="cc-gender"
                    value={form.gender}
                    onChange={(e) => updateField("gender", e.target.value)}
                    required
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div className="cc-onboarding-divider" />

              <div className="cc-onboarding-section-heading">
                <div>
                  <h2>How do you identify?</h2>
                  <p>Choose the profile that best describes you.</p>
                </div>
                <Building2 size={21} />
              </div>

              <div className="cc-account-type-grid">
                <button
                  type="button"
                  className={`cc-account-type ${isStudent ? "selected" : ""}`}
                  onClick={() => {
                    updateField("accountType", "student");
                    updateField("company", "");
                  }}
                >
                  <span className="cc-account-type-icon">
                    <GraduationCap size={23} />
                  </span>
                  <span>
                    <strong>Student</strong>
                    <small>Currently studying at a college</small>
                  </span>
                  {isStudent && <Check size={19} />}
                </button>

                <button
                  type="button"
                  className={`cc-account-type ${isProfessional ? "selected" : ""}`}
                  onClick={() => {
                    updateField("accountType", "professional");
                    updateField("college", "");
                    setCollegeStatus("idle");
                    setCollegeMessage("");
                    setCollegeSources([]);
                  }}
                >
                  <span className="cc-account-type-icon">
                    <BriefcaseBusiness size={22} />
                  </span>
                  <span>
                    <strong>Working professional</strong>
                    <small>Currently working at a company</small>
                  </span>
                  {isProfessional && <Check size={19} />}
                </button>
              </div>

              <AnimatePresence mode="wait">
                {isStudent && (
                  <motion.div
                    key="student-fields"
                    className="cc-conditional-field"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="cc-field">
                      <label htmlFor="cc-college">College / University</label>

                      <div className="cc-college-input-row">
                        <input
                          id="cc-college"
                          type="text"
                          value={form.college}
                          onChange={(e) => updateField("college", e.target.value)}
                          placeholder="Enter your college's full name"
                          maxLength={150}
                        />

                        <button
                          type="button"
                          className="cc-verify-button"
                          onClick={verifyCollege}
                          disabled={
                            collegeStatus === "checking" ||
                            form.college.trim().length < 3
                          }
                        >
                          {collegeStatus === "checking" ? (
                            <LoaderCircle size={16} className="cc-spin" />
                          ) : (
                            <ShieldCheck size={16} />
                          )}
                          {collegeStatus === "checking"
                            ? "Checking"
                            : "Verify"}
                        </button>
                      </div>

                      {collegeStatus !== "idle" && (
                        <div
                          className={`cc-college-status ${collegeStatus}`}
                          role="status"
                        >
                          {collegeStatus === "checking" && (
                            <LoaderCircle size={16} className="cc-spin" />
                          )}

                          {collegeStatus === "verified" && (
                            <Check size={16} />
                          )}

                          {collegeStatus === "not-found" && (
                            <ShieldCheck size={16} />
                          )}

                          {collegeStatus === "error" && (
                            <ShieldCheck size={16} />
                          )}

                          <span>{collegeMessage}</span>
                        </div>
                      )}

                      {collegeStatus === "verified" &&
                        collegeSources.length > 0 && (
                          <div className="cc-college-sources">
                            <small>Supporting sources</small>
                            {collegeSources.map((source, index) => (
                              <a
                                key={`${source.url}-${index}`}
                                href={source.url}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {source.title || source.domain}
                              </a>
                            ))}
                          </div>
                        )}

                      <small>
                        We check credible online sources using CampusConnect's
                        Tavily-powered verification.
                      </small>
                    </div>
                  </motion.div>
                )}

                {isProfessional && (
                  <motion.div
                    key="professional-fields"
                    className="cc-conditional-field"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="cc-field">
                      <label htmlFor="cc-company">Company / Organisation</label>
                      <div className="cc-input-with-icon">
                        <BriefcaseBusiness size={17} />
                        <input
                          id="cc-company"
                          type="text"
                          value={form.company}
                          onChange={(e) => updateField("company", e.target.value)}
                          placeholder="Where do you currently work?"
                          maxLength={150}
                          required
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="cc-onboarding-divider" />

              <div className="cc-field">
                <label htmlFor="cc-reason">
                  Why do you want to join CampusConnect?
                </label>

                <textarea
                  id="cc-reason"
                  value={form.reason}
                  onChange={(e) => updateField("reason", e.target.value)}
                  placeholder="Tell us what you're looking for — events, teammates, collaboration, networking..."
                  rows={4}
                  maxLength={500}
                  required
                />

                <small className="cc-character-count">
                  {form.reason.length}/500
                </small>
              </div>

              {error && (
                <div className="cc-onboarding-error" role="alert">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="cc-onboarding-submit"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <LoaderCircle size={18} className="cc-spin" />
                    Saving your profile...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <p className="cc-onboarding-privacy">
                Your profile is stored securely under your unique Firebase UID.
              </p>
            </form>
          </motion.section>
        ) : (
          <motion.section
            key="onboarding-setup"
            className="cc-setup-content"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="cc-setup-icon">
              <Rocket size={31} />
            </div>

            <span className="cc-onboarding-eyebrow">
              <Sparkles size={15} />
              BUILDING YOUR EXPERIENCE
            </span>

            <h1>
              Getting everything
              <span> ready.</span>
            </h1>

            <p>
              We're preparing your CampusConnect experience.
              This will only take a few moments.
            </p>

            <div className="cc-setup-progress">
              <div className="cc-setup-progress-meta">
                <span>Setting up your account</span>
                <strong>{setupProgress}%</strong>
              </div>

              <div className="cc-setup-progress-track">
                <motion.div
                  animate={{ width: `${setupProgress}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>
            </div>

            <div className="cc-setup-timeline">
              {setupSteps.map((step, index) => {
                const Icon = step.icon;
                const completed = index < activeStep;
                const active = index === activeStep;

                return (
                  <div
                    className={`cc-setup-step ${
                      completed ? "completed" : ""
                    } ${active ? "active" : ""}`}
                    key={step.title}
                  >
                    <div className="cc-setup-step-icon">
                      {completed ? (
                        <Check size={17} />
                      ) : (
                        <Icon size={17} />
                      )}
                    </div>

                    <div>
                      <strong>{step.title}</strong>
                      <small>{step.description}</small>
                    </div>

                    {active && (
                      <LoaderCircle
                        size={17}
                        className="cc-spin cc-setup-spinner"
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <span className="cc-setup-footer">
              Please keep this page open while we finish.
            </span>
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  );
}