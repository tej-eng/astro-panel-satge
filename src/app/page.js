"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setCredentials, logoutSuccess } from "@/app/redux/slice/authSlice";
import { useLoginMutation } from "./redux/slice/loginSlice";
import styles from "@/app/login/login.module.css";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { GrFormView, GrFormViewHide } from "react-icons/gr";

export default function LoginForm() {
  // State
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Hooks
  const router = useRouter();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();



  // Handlers
  const handleMobileChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
    setMobile(value);
  };

  const handlePasswordChange = (e) => setPassword(e.target.value);

  const handleShowPassword = () => setShowPassword((prev) => !prev);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (typeof window !== "undefined") localStorage.clear();
    dispatch(logoutSuccess());

    console.log("Attempting login with:", { mobile, password });

    try {
      const result = await login({ mobile, password }).unwrap();
     

      if (result?.access_token) {
        dispatch(setCredentials({ accessToken: result.access_token, user: result.user }));

        if (typeof window !== "undefined") {
          console.log("Login successful, storing tokens in localStorage",result);
          localStorage.setItem("accessToken", result.access_token);
          localStorage.setItem("USER", result.user.id);
          localStorage.setItem("frontendJWT", result.jwt_token);

        }

        toast.success("SignIN successful!");

        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 100);
      } else {
        console.log("Login failed (no access_token):", result);
        setError(result.message || "Invalid credentials.");
      }
    } catch (err) {
      console.log("Login error caught:", err);
      const errMsg = err?.data?.message || err?.error || "SignIN failed. Please check your credentials.";
      setError(errMsg);
    }
  };



  // Render
  return (
    <div className={styles.nboby}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerInner}>
            <div className={styles.mobileHeader}>
              <div className={styles.logo}>
                <Image src="/logo.png" alt="Logo" width={130} height={50} className={styles.logoImage} />
              </div>
            </div>
            <nav className={styles.navLinks}>
              <Link href="#contact" className={styles.profile}>
                <Image src="/user2.png" width={35} height={35} alt="User Icon" className={styles.profileImage} />
                <h5 className={styles.signInText}>SignIN</h5>
              </Link>
            </nav>
          </div>
        </header>
        <div className={styles.loginContainer}>
          <div className={styles.loginBox}>
            <h2>SignIN</h2>
            <span>Enter your credentials.</span>
          </div>
          <form onSubmit={handleSubmit} autoComplete="off">
            <label htmlFor="mobile">Phone Number:</label>
            <input
              type="text"
              id="mobile"
              name="mobile"
              value={mobile}
              required
              maxLength={10}
              pattern="[0-9]{10}"
              inputMode="numeric"
              onChange={handleMobileChange}
              placeholder="Enter phone number"
              autoComplete="off"
            />
            <label htmlFor="password">Password:</label>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={password}
                required
                onChange={handlePasswordChange}
                placeholder="Enter password"
                autoComplete="off"
                style={{ paddingRight: '2.5rem', width: '100%' }}
                className={styles.input}
              />
              <span
                onClick={handleShowPassword}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '33%',
                  transform: 'translateY(-50%)',
                  cursor: 'pointer',
                  color: '#888',
                  fontSize: '1.6rem',
                  userSelect: 'none',
                  zIndex: 2,
                  background: 'transparent',
                  padding: 0,
                  border: 'none',
                  outline: 'none',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={0}
              >
                {showPassword ? <GrFormView className="font-semibold" /> : <GrFormViewHide className="font-semibold" />}
              </span>
            </div>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <button type="submit" disabled={isLoading}>
              {isLoading ? "Signing in..." : "SignIN"}
            </button>
            <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.95rem', color: '#555', fontWeight: 500 }}>
              By signing in, you agree to our <Link href="https://webdemonew.dhwaniastro.co.in/terms-and-conditions-for-astrologer" style={{ color: '#7e60bf', fontWeight: 500, textDecoration: 'underline' }}>terms and conditions</Link>
              <br />
              <span style={{ color: '#222' }}>Don't have an account?</span>
              <Link href="https://docs.google.com/forms/d/1VDdBy2ZPtnXu0ok9V4o0m9M78bk0jdtZ9L5qFmRVY_w/viewform?edit_requested=true#responses" style={{ color: '#7e60bf', fontWeight: 600, marginLeft: 6, textDecoration: 'underline' }}>Sign Up</Link>
            </div>
          </form>
        </div>
        <footer className={styles.footer}>
          <div className={styles.footerBox}>
            <p className={styles.footerText}>
              Copyright &copy; 2023-2025. Made with ❤️ by Dhwani Astro.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
