import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, Mail, Sparkles,
  UsersRound, CheckCircle2, AlertCircle, RotateCw
} from "lucide-react";
import {
  GoogleAuthProvider, sendPasswordResetEmail,
  signInWithEmailAndPassword, signInWithPopup
} from "firebase/auth";

// Assumes src/firebase.js exports: export const auth = getAuth(app)
import { auth } from "../../firebase";
import "./Login.css";

const messages = [
  { eyebrow: "YOUR CAMPUS. YOUR COMMUNITY.", title: <>Welcome <span>back.</span></>, body: "Your next opportunity is closer than you think.", note: "Good to see you again" },
  { eyebrow: "IDEAS ARE BETTER TOGETHER.", title: <>Time to <span>connect.</span></>, body: "Find people who bring a different skill to your next big idea.", note: "Your people are out there" },
  { eyebrow: "MAKE YOUR NEXT MOVE COUNT.", title: <>Discover. <span>Build.</span> Grow.</>, body: "Find hackathons, workshops and experiences worth showing up for.", note: "A new opportunity awaits" },
  { eyebrow: "GREAT THINGS START WITH A TEAM.", title: <>You belong <span>here.</span></>, body: "Pick up where you left off and make something meaningful.", note: "Let's make it happen" },
];

function getAuthMessage(error) {
  const errors = {
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/user-disabled": "This account has been disabled. Contact support.",
    "auth/user-not-found": "No account was found with this email address.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/invalid-credential": "Email or password is incorrect. Please try again.",
    "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
    "auth/network-request-failed": "Network error. Check your internet connection.",
    "auth/popup-closed-by-user": "Google sign-in was closed before completion.",
    "auth/popup-blocked": "Your browser blocked the Google sign-in popup.",
    "auth/unauthorized-domain": "This domain is not authorized in Firebase Authentication.",
    "auth/operation-not-allowed": "This sign-in method is not enabled in Firebase.",
  };
  return errors[error?.code] || error?.message || "Something went wrong. Please try again.";
}

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", text: "" });

  useEffect(() => {
    const timer = window.setInterval(
      () => setMessageIndex((index) => (index + 1) % messages.length),
      4600
    );
    return () => window.clearInterval(timer);
  }, []);

  const clearFeedback = () => setFeedback({ type: "", text: "" });

  const handleLogin = async (event) => {
    event.preventDefault();
    clearFeedback();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigate("/student-dashboard", { replace: true });
    } catch (error) {
      setFeedback({ type: "error", text: getAuthMessage(error) });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    clearFeedback();
    setGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      await signInWithPopup(auth, provider);
      navigate("/student-dashboard", { replace: true });
    } catch (error) {
      setFeedback({ type: "error", text: getAuthMessage(error) });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleReset = async () => {
    clearFeedback();
    if (!email.trim()) {
      setFeedback({ type: "error", text: "Enter your email address first. We'll send the reset link there." });
      return;
    }
    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setFeedback({ type: "success", text: "Password reset link sent. Check your inbox and spam folder." });
    } catch (error) {
      setFeedback({ type: "error", text: getAuthMessage(error) });
    } finally {
      setResetLoading(false);
    }
  };

  const current = messages[messageIndex];

  return (
    <main className="cc-login-page">
      <section className="cc-login-showcase" aria-label="CampusConnect welcome">
        <div className="cc-showcase-grid" />
        <div className="cc-showcase-orb cc-orb-one" />
        <div className="cc-showcase-orb cc-orb-two" />
        <div className="cc-showcase-orb cc-orb-three" />

        <Link to="/" className="cc-login-brand">
          <span className="cc-login-brand-icon">
            <UsersRound size={23} />
            <Sparkles size={11} className="cc-brand-sparkle" />
          </span>
          <span>Campus<span>Connect</span></span>
        </Link>

        <div className="cc-showcase-main">
          <div className="cc-showcase-kicker">
            <span className="cc-kicker-line" />
            <AnimatePresence mode="wait">
              <motion.span key={current.eyebrow}
                initial={{ opacity: 0, y: 9, filter: "blur(5px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0)" }}
                exit={{ opacity: 0, y: -9, filter: "blur(5px)" }}
                transition={{ duration: 0.4 }}>
                {current.eyebrow}
              </motion.span>
            </AnimatePresence>
          </div>

          <div className="cc-showcase-heading-wrap">
            <AnimatePresence mode="wait">
              <motion.div key={messageIndex} className="cc-showcase-message"
                initial={{ opacity: 0, y: 32, rotateX: -12, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, rotateX: 0, filter: "blur(0)" }}
                exit={{ opacity: 0, y: -22, rotateX: 8, filter: "blur(6px)" }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
                <h1>{current.title}</h1>
                <p>{current.body}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="cc-showcase-progress">
            {messages.map((item, index) => (
              <span key={item.eyebrow} className={index === messageIndex ? "active" : ""} />
            ))}
          </div>

          <motion.div className="cc-floating-note cc-note-one"
            animate={{ y: [0, -9, 0], rotate: [0, 1.2, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
            <span className="cc-note-icon"><UsersRound size={16} /></span>
            <span><strong>Find your people</strong><small>Build your next team</small></span>
            <i className="cc-note-pulse" />
          </motion.div>

          <motion.div className="cc-floating-note cc-note-two"
            animate={{ y: [0, 8, 0], rotate: [0, -1.2, 0] }}
            transition={{ duration: 5.8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}>
            <span className="cc-note-icon cc-note-icon-light"><Sparkles size={16} /></span>
            <span><strong>Something exciting awaits</strong><small>Discover your next opportunity</small></span>
          </motion.div>

          <div className="cc-showcase-bottom">
            <div className="cc-avatar-stack"><span>C</span><span>V</span><span>+</span></div>
            <p>{current.note}</p>
          </div>
        </div>

        <div className="cc-showcase-footer"><span>DISCOVER.</span><i /><span>CONNECT.</span><i /><span>COLLABORATE.</span></div>
      </section>

      <section className="cc-login-panel">
        <div className="cc-login-panel-inner">
          <Link to="/" className="cc-login-back-link">
            <ArrowLeft size={16} />
            <span>Back to home</span>
          </Link>

          <Link to="/" className="cc-login-mobile-brand">
            <span className="cc-login-brand-icon"><UsersRound size={22} /><Sparkles size={10} className="cc-brand-sparkle" /></span>
            <span>Campus<span>Connect</span></span>
          </Link>

          <header className="cc-login-heading">
            <div className="cc-login-welcome-pill"><span /> YOUR CAMPUS JOURNEY CONTINUES</div>
            <h2>Welcome <span>back</span></h2>
            <p>Sign in to pick up where your next big idea begins.</p>
          </header>

          <form className="cc-login-form" onSubmit={handleLogin}>
            <label htmlFor="cc-login-email">Email address</label>
            <div className="cc-login-input-wrap">
              <Mail size={18} />
              <input id="cc-login-email" type="email" autoComplete="email"
                placeholder="you@example.com" value={email}
                onChange={(e) => { setEmail(e.target.value); clearFeedback(); }} required />
            </div>

            <div className="cc-password-label-row">
              <label htmlFor="cc-login-password">Password</label>
              <button type="button" className="cc-forgot-button" onClick={handleReset} disabled={resetLoading}>
                {resetLoading ? "Sending link..." : "Forgot password?"}
              </button>
            </div>
            <div className="cc-login-input-wrap">
              <LockKeyhole size={18} />
              <input id="cc-login-password" type={showPassword ? "text" : "password"}
                autoComplete="current-password" placeholder="Enter your password"
                value={password} onChange={(e) => { setPassword(e.target.value); clearFeedback(); }} required />
              <button type="button" className="cc-password-toggle"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Hide password" : "Show password"}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {feedback.text && (
              <motion.div className={`cc-login-feedback ${feedback.type}`}
                initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} role="alert">
                {feedback.type === "success" ? <CheckCircle2 size={17} /> : <AlertCircle size={17} />}
                <span>{feedback.text}</span>
              </motion.div>
            )}

            <button className="cc-login-submit" type="submit" disabled={loading || googleLoading}>
              {loading ? <><RotateCw size={17} className="cc-spin-icon" /> Signing you in...</> :
                <>Enter CampusConnect <ArrowRight size={18} /></>}
            </button>
          </form>

          <div className="cc-login-divider"><span>OR CONTINUE WITH</span></div>

          <button className="cc-google-button" type="button" onClick={handleGoogle}
            disabled={googleLoading || loading}>
            {googleLoading ? <RotateCw size={18} className="cc-spin-icon" /> :
              <svg viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" transform="translate(0 5)" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.74 7.18l7.72 5.99c4.5-4.15 7.06-10.26 7.06-17.64Z" transform="translate(0 -1)" />
                <path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.53 2.56 10.78l7.97-6.19Z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.81l-7.72-5.99c-2.14 1.44-4.88 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 40.62 14.62 48 24 48Z" transform="translate(0 -5)" />
              </svg>}
            {googleLoading ? "Connecting to Google..." : "Continue with Google"}
          </button>

          <div className="cc-login-signup"><span>Don't have an account?</span><Link to="/signup">Sign up <ArrowRight size={15} /></Link></div>
          <p className="cc-login-terms">By continuing, you agree to CampusConnect's <Link to="/terms">Terms</Link> and <Link to="/privacy">Privacy Policy</Link>.</p>
        </div>
        <div className="cc-login-panel-corner">CC<span>.</span></div>
      </section>
    </main>
  );
}
