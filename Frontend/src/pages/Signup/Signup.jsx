import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Eye, EyeOff, Mail, LockKeyhole, UsersRound, MessageCircle,
  Sparkles, CheckCircle2, AlertCircle, LoaderCircle, X
} from "lucide-react";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  getAdditionalUserInfo,
} from "firebase/auth";
import { auth } from "../../firebase";
import "./Signup.css";

const slides = [
  {
    eyebrow: "YOUR NEXT TEAM STARTS HERE.",
    title: <>Build your <span>dream team.</span></>,
    body: "Find people whose skills complement yours and bring your idea to life.",
    note: "The right people make all the difference.",
  },
  {
    eyebrow: "EVERY GREAT IDEA NEEDS A TEAM.",
    title: <>Make teamwork <span>flow.</span></>,
    body: "Share updates, exchange ideas and keep every teammate in sync.",
    note: "One workspace. One team. One big idea.",
  },
  {
    eyebrow: "TURN PLANS INTO PROGRESS.",
    title: <>Create something <span>together.</span></>,
    body: "Organise tasks, track progress and turn your campus ideas into reality.",
    note: "From first brainstorm to final submission.",
  },
];

function authError(error) {
  const messages = {
    "auth/email-already-in-use": "An account with this email already exists. Try signing in.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/weak-password": "Choose a stronger password with at least 6 characters.",
    "auth/operation-not-allowed": "This sign-up method is not enabled in Firebase Authentication.",
    "auth/popup-closed-by-user": "The Google sign-up window was closed before completion.",
    "auth/popup-blocked": "Your browser blocked the Google sign-up popup.",
    "auth/unauthorized-domain": "This domain is not authorized in Firebase Authentication.",
    "auth/network-request-failed": "Network error. Check your internet connection and try again.",
  };
  return messages[error?.code] || error?.message || "Something went wrong. Please try again.";
}

function GoogleMark() {
  return <svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11c-.5 2.5-1.9 4.6-4 6v5h6.5c3.8-3.5 6.1-8.6 6.1-14.7Z"/><path fill="#FF3D00" d="M24 44c5.5 0 10.1-1.8 13.5-4.8l-6.5-5c-1.8 1.2-4.1 2-7 2-5.3 0-9.8-3.6-11.4-8.4H5.9v5.2A20 20 0 0 0 24 44Z"/><path fill="#4CAF50" d="M12.6 27.8a12 12 0 0 1 0-7.6V15H5.9a20 20 0 0 0 0 18l6.7-5.2Z"/><path fill="#1976D2" d="M24 11.8c3 0 5.7 1 7.8 3.1l5.8-5.8A19.3 19.3 0 0 0 24 4 20 20 0 0 0 5.9 15l6.7 5.2c1.6-4.8 6.1-8.4 11.4-8.4Z"/></svg>;
}

export default function Signup() {
  const navigate = useNavigate();
  const [slideIndex, setSlideIndex] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", text: "" });
  const [step, setStep] = useState("details");
  const [otp, setOtp] = useState("");
  const [resendSeconds, setResendSeconds] = useState(0);

  // Configure VITE_API_BASE_URL when the frontend and API are hosted separately.
  // In local development, the Vite proxy should forward /api to the Express backend.
  const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

  useEffect(() => {
    const timer = window.setInterval(() => setSlideIndex((n) => (n + 1) % slides.length), 5000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (resendSeconds <= 0) return undefined;
    const timer = window.setInterval(() => setResendSeconds((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [resendSeconds]);

  const clearFeedback = () => setFeedback({ type: "", text: "" });

  const handleSignup = async (event) => {
    event.preventDefault();
    clearFeedback();

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setFeedback({ type: "error", text: "Enter your email address to continue." });
      return;
    }
    if (password.length < 6) {
      setFeedback({ type: "error", text: "Your password must contain at least 6 characters." });
      return;
    }
    if (password !== confirmPassword) {
      setFeedback({ type: "error", text: "Your passwords don't match. Please check them." });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.success === false) {
        throw new Error(data.message || "We couldn't send your verification code. Please try again.");
      }
      setEmail(cleanEmail);
      setOtp("");
      setStep("verify");
      setResendSeconds(Number(data.resendAfterSeconds) || 45);
      setFeedback({ type: "success", text: `We've sent a 6-digit verification code to ${cleanEmail}.` });
    } catch (error) {
      setFeedback({ type: "error", text: error.message || "Unable to send the OTP. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    clearFeedback();
    if (!/^\d{6}$/.test(otp)) {
      setFeedback({ type: "error", text: "Enter the 6-digit code sent to your email." });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.success !== true) {
        throw new Error(data.message || "That code is invalid or expired. Please try again.");
      }

      // Firebase account is created only after the backend confirms the OTP.
      await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
      navigate("/onboarding", { replace: true, state: { onboardingRequired: true } });
    } catch (error) {
      setFeedback({ type: "error", text: authError(error) });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendSeconds > 0 || loading) return;
    clearFeedback();
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.success === false) {
        throw new Error(data.message || "We couldn't resend the code. Please try again.");
      }
      setOtp("");
      setResendSeconds(Number(data.resendAfterSeconds) || 45);
      setFeedback({ type: "success", text: "A fresh verification code has been sent." });
    } catch (error) {
      setFeedback({ type: "error", text: error.message || "Unable to resend the code." });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    clearFeedback();
    setGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, provider);
      const additionalInfo = getAdditionalUserInfo(result);
      if (additionalInfo?.isNewUser) {
        navigate("/onboarding", { replace: true, state: { onboardingRequired: true } });
      } else {
        navigate("/student-dashboard", { replace: true });
      }
    } catch (error) {
      setFeedback({ type: "error", text: authError(error) });
    } finally {
      setGoogleLoading(false);
    }
  };

  const current = slides[slideIndex];

  return (
    <main className="cc-signup-page">
      <section className="cc-signup-showcase" aria-label="CampusConnect team workspace preview">
        <div className="cc-signup-grid" />
        <div className="cc-signup-orb cc-signup-orb-one" />
        <div className="cc-signup-orb cc-signup-orb-two" />
        <Link to="/" className="cc-signup-brand">
          <span className="cc-signup-brand-icon"><UsersRound size={23} /><Sparkles size={11} className="cc-signup-brand-sparkle" /></span>
          <span>Campus<span>Connect</span></span>
        </Link>

        <div className="cc-signup-showcase-content">
          <div className="cc-signup-kicker"><i />
            <AnimatePresence mode="wait">
              <motion.span key={current.eyebrow}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: .3 }}>
                {current.eyebrow}
              </motion.span>
            </AnimatePresence>
          </div>

          <div className="cc-signup-headline-wrap">
            <AnimatePresence mode="wait">
              <motion.div key={slideIndex}
                initial={{ opacity: 0, y: 18, x: 12 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                exit={{ opacity: 0, y: -12, x: -10 }}
                transition={{ duration: .45, ease: [0.22, 1, .36, 1] }}>
                <h1>{current.title}</h1>
                <p>{current.body}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="cc-signup-visual-stage">
            <AnimatePresence mode="wait">
              {slideIndex === 0 && (
                <motion.div key="team-scene" className="cc-scene-card cc-team-scene"
                  initial={{ opacity: 0, y: 24, scale: .96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -18, scale: .97 }}
                  transition={{ duration: .48 }}>
                  <div className="cc-scene-topline">
                    <span><i /> TEAM FORMATION</span><small>Finding your people</small>
                  </div>
                  <div className="cc-team-scene-flow">
                    <div className="cc-scene-connector" />
                    {[
                      ["A", "Alex", "Frontend", "avatar-peach"],
                      ["M", "Maya", "UI / UX", "avatar-blue"],
                      ["R", "Rohan", "Backend", "avatar-lilac"],
                    ].map(([initial, name, role, color], index) => (
                      <motion.div className="cc-scene-member" key={name}
                        animate={{ y: [0, index === 1 ? 5 : -5, 0] }}
                        transition={{ duration: 3 + index * .35, repeat: Infinity }}>
                        <span className={`cc-person-avatar ${color}`}>{initial}</span>
                        <b>{name}</b><small>{role}</small>
                      </motion.div>
                    ))}
                    <motion.div className="cc-scene-member cc-scene-open-role"
                      animate={{ y: [0, 5, 0] }} transition={{ duration: 3.3, repeat: Infinity }}>
                      <span className="cc-person-avatar avatar-empty"><Sparkles size={17}/></span>
                      <b>Your role</b><small>Join the team</small>
                    </motion.div>
                  </div>
                  <div className="cc-scene-match-row">
                    <span><CheckCircle2 size={14}/> Skills coming together</span>
                    <strong>92% match</strong>
                  </div>
                  <div className="cc-scene-tags"><span>Frontend</span><span>UI / UX</span><span>Backend</span><span>AI / ML</span></div>
                </motion.div>
              )}

              {slideIndex === 1 && (
                <motion.div key="workspace-scene" className="cc-scene-card cc-workspace-scene"
                  initial={{ opacity: 0, y: 24, scale: .96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -18, scale: .97 }}
                  transition={{ duration: .48 }}>
                  <div className="cc-workspace-titlebar">
                    <span className="cc-workspace-app-icon"><MessageCircle size={16}/></span>
                    <span><b>VisionX Workspace</b><small><i/> 4 members online</small></span>
                    <span className="cc-chat-menu">•••</span>
                  </div>
                  <div className="cc-workspace-channel"><span>#</span> general <small>Team conversation</small></div>
                  <motion.div className="cc-workspace-msg"
                    initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: .25, duration: .4 }}>
                    <span className="cc-workspace-avatar avatar-blue">M</span>
                    <div><small>Maya · 2:41 PM</small><p>I've shared the new wireframes ✨</p></div>
                  </motion.div>
                  <motion.div className="cc-workspace-msg cc-workspace-msg-you"
                    initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: .65, duration: .4 }}>
                    <span className="cc-workspace-avatar avatar-peach">C</span>
                    <div><small>You · 2:42 PM</small><p>Looks great! I'll connect the API.</p></div>
                  </motion.div>
                  <motion.div className="cc-workspace-typing"
                    animate={{ opacity: [.45, 1, .45] }} transition={{ duration: 1.8, repeat: Infinity }}>
                    <span/><span/><span/> Rohan is typing
                  </motion.div>
                  <div className="cc-workspace-input"><span>Message your team...</span><b><ArrowRight size={14}/></b></div>
                </motion.div>
              )}

              {slideIndex === 2 && (
                <motion.div key="project-scene" className="cc-scene-card cc-project-scene"
                  initial={{ opacity: 0, y: 24, scale: .96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -18, scale: .97 }}
                  transition={{ duration: .48 }}>
                  <div className="cc-scene-topline"><span><i/> PROJECT BOARD</span><small>CampusConnect · Sprint 02</small></div>
                  <div className="cc-project-board-head"><b>Build something brilliant.</b><span>3 tasks in progress</span></div>
                  <div className="cc-project-columns">
                    <div className="cc-project-column"><label>TO DO <b>2</b></label><div className="cc-project-task"><i className="task-orange"/> <b>Research & ideas</b><small>Alex · Planning</small></div><div className="cc-project-task"><i className="task-purple"/> <b>Design system</b><small>Maya · Design</small></div></div>
                    <div className="cc-project-column"><label>IN PROGRESS <b>2</b></label><div className="cc-project-task"><i className="task-green"/> <b>Build the frontend</b><small>You · Development</small><div className="cc-task-progress"><i/></div></div><div className="cc-project-task"><i className="task-blue"/> <b>API integration</b><small>Rohan · Backend</small></div></div>
                  </div>
                  <div className="cc-project-footer"><span><UsersRound size={14}/> Everyone moving together</span><strong>WEEK 02</strong></div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="cc-signup-bottom">
            <div className="cc-signup-avatar-stack"><span>C</span><span>M</span><span>R</span><span>+</span></div>
            <p>{current.note}</p>
            <div className="cc-scene-pagination">
              {slides.map((_, index) => <button type="button" key={index}
                className={index === slideIndex ? "active" : ""}
                onClick={() => setSlideIndex(index)}
                aria-label={`Show showcase ${index + 1}`} />)}
            </div>
          </div>
        </div>
        <div className="cc-signup-footer"><span>DISCOVER.</span><i/><span>CONNECT.</span><i/><span>COLLABORATE.</span></div>
      </section>

      <section className="cc-signup-panel">
        <div className="cc-signup-panel-inner">
          <Link to="/" className="cc-signup-back"><ArrowLeft size={16}/><span>Back to home</span></Link>
          <Link to="/" className="cc-signup-mobile-brand"><span className="cc-signup-brand-icon"><UsersRound size={22}/><Sparkles size={10} className="cc-signup-brand-sparkle"/></span><span>Campus<span>Connect</span></span></Link>
          <header className="cc-signup-heading">
            <div className="cc-signup-pill"><i/> YOUR NEXT CHAPTER STARTS HERE.</div>
            <h2>Join the <span>community.</span></h2>
            <p>Start with the basics. Complete your profile after signing up.</p>
          </header>

          {step === "details" ? (
            <form className="cc-signup-form" onSubmit={handleSignup}>
              <div className="cc-signup-field">
                <label htmlFor="cc-signup-email">Email address</label>
                <div className="cc-signup-input">
                  <Mail size={17}/>
                  <input id="cc-signup-email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={e=>{setEmail(e.target.value);clearFeedback();}} required />
                </div>
              </div>

              <div className="cc-signup-field">
                <label htmlFor="cc-signup-password">Password</label>
                <div className="cc-signup-input">
                  <LockKeyhole size={16}/>
                  <input id="cc-signup-password" type={showPassword?"text":"password"} autoComplete="new-password" placeholder="At least 6 characters" minLength={6} value={password} onChange={e=>{setPassword(e.target.value);clearFeedback();}} required />
                  <button type="button" className="cc-signup-eye" onClick={()=>setShowPassword(v=>!v)} aria-label={showPassword?"Hide password":"Show password"}>{showPassword?<EyeOff size={16}/>:<Eye size={16}/>}</button>
                </div>
              </div>

              <div className="cc-signup-field">
                <label htmlFor="cc-signup-confirm">Confirm password</label>
                <div className="cc-signup-input">
                  <LockKeyhole size={16}/>
                  <input id="cc-signup-confirm" type={showConfirm?"text":"password"} autoComplete="new-password" placeholder="Re-enter your password" minLength={6} value={confirmPassword} onChange={e=>{setConfirmPassword(e.target.value);clearFeedback();}} required />
                  <button type="button" className="cc-signup-eye" onClick={()=>setShowConfirm(v=>!v)} aria-label={showConfirm?"Hide password":"Show password"}>{showConfirm?<EyeOff size={16}/>:<Eye size={16}/>}</button>
                </div>
              </div>

              {feedback.text && <div className={`cc-signup-feedback ${feedback.type}`} role="alert">{feedback.type==="success"?<CheckCircle2 size={16}/>:<AlertCircle size={16}/>}<span>{feedback.text}</span><button type="button" onClick={clearFeedback} aria-label="Dismiss message"><X size={14}/></button></div>}

              <button className="cc-signup-submit" type="submit" disabled={loading||googleLoading}>
                {loading?<><LoaderCircle size={17} className="cc-signup-spinner"/> Sending verification code...</>:<>Next: Verify email <ArrowRight size={17}/></>}
              </button>
            </form>
          ) : (
            <form className="cc-signup-form cc-signup-otp-form" onSubmit={handleVerifyOtp}>
              <div className="cc-signup-otp-intro">
                <span className="cc-signup-otp-icon"><Mail size={23}/></span>
                <h3>Check your inbox</h3>
                <p>We've sent a 6-digit verification code to <strong>{email}</strong>. Enter it below to verify your email.</p>
              </div>
              <div className="cc-signup-field">
                <label htmlFor="cc-signup-otp">Email verification code</label>
                <div className="cc-signup-input cc-signup-otp-input">
                  <input id="cc-signup-otp" type="text" inputMode="numeric" autoComplete="one-time-code" placeholder="000000" maxLength={6} pattern="[0-9]{6}" value={otp} onChange={e=>{setOtp(e.target.value.replace(/\D/g, "").slice(0,6));clearFeedback();}} required />
                </div>
              </div>
              {feedback.text && <div className={`cc-signup-feedback ${feedback.type}`} role="alert">{feedback.type==="success"?<CheckCircle2 size={16}/>:<AlertCircle size={16}/>}<span>{feedback.text}</span><button type="button" onClick={clearFeedback} aria-label="Dismiss message"><X size={14}/></button></div>}
              <button className="cc-signup-submit" type="submit" disabled={loading||otp.length!==6}>
                {loading?<><LoaderCircle size={17} className="cc-signup-spinner"/> Verifying email...</>:<>Verify & create account <ArrowRight size={17}/></>}
              </button>
              <div className="cc-signup-otp-actions">
                <button type="button" onClick={handleResendOtp} disabled={loading||resendSeconds>0}>{resendSeconds>0?`Resend code in ${resendSeconds}s`:"Resend code"}</button>
                <button type="button" onClick={()=>{setStep("details");setOtp("");clearFeedback();}} disabled={loading}>Change email</button>
              </div>
              <p className="cc-signup-otp-hint">Didn't receive it? Check your spam folder before requesting another code.</p>
            </form>
          )}

          {step === "details" && <><div className="cc-signup-divider"><span>OR CONTINUE WITH</span></div>
          <button className="cc-signup-google" type="button" onClick={handleGoogleSignup} disabled={loading||googleLoading}>{googleLoading?<LoaderCircle size={17} className="cc-signup-spinner"/>:<GoogleMark/>}{googleLoading?"Connecting to Google...":"Continue with Google"}</button></>}
          <div className="cc-signup-signin">Already have an account? <Link to="/login">Sign in <ArrowRight size={14}/></Link></div>
          <p className="cc-signup-legal">By joining, you become part of a community built to discover, connect and collaborate.</p>
        </div>
        <div className="cc-signup-corner">CC<span>.</span></div>
      </section>
    </main>
  );
}
