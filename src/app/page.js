"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/app/redux/slice/authSlice";
import { useMutation } from "@apollo/client/react";

import styles from "@/app/login/login.module.css";
import PhoneInput from "./login/PhoneInput";

import { toast } from "react-toastify";
import client, { authTokenVar } from "../../utils/apolloClient";
import { gql } from "@apollo/client";
import Image from "next/image";
import Link from "next/link";

// ================= GRAPHQL =================

const REQUEST_OTP = gql`
  mutation ($contactNo: String!) {
    requestAstrologerOtp(contactNo: $contactNo) {
      message
    }
  }
`;

const VERIFY_OTP = gql`
  mutation ($contactNo: String!, $otp: String!) {
    verifyAstrologerOtp(contactNo: $contactNo, otp: $otp) {
      accessToken
      astrologer {
        id
        name
        contactNo
      }
    }
  }
`;

// ================= COMPONENT =================

export default function LoginForm() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [requestOtp] = useMutation(REQUEST_OTP);
  const [verifyOtp] = useMutation(VERIFY_OTP);

  const getOtpBtnRef = useRef(null);
  const verifyBtnRef = useRef(null);

  const [otpSent, setOtpSent] = useState(1);
  const [otp, setOtp] = useState(["", "", "", ""]);

  const [phoneData, setPhoneData] = useState({
    e164: "",
    isValid: false,
  });

  // ================= SEND OTP =================

  const handleGetOTP = async () => {
    if (!phoneData.isValid) {
      toast.error("Invalid number");
      return;
    }

    try {
      const res = await requestOtp({
        variables: { contactNo: phoneData.raw },
      });

      toast.success(res.data.requestAstrologerOtp.message);
      setOtpSent(2);
    } catch (err) {
      toast.error(err.message);
    }
  };

  // ================= VERIFY OTP =================

  const handleVerifyOTP = async () => {
    const enteredOtp = otp.join("");

    try {
      const res = await verifyOtp({
        variables: {
          contactNo: phoneData.raw,
          otp: enteredOtp,
        },
      });

      const { accessToken, astrologer } = res.data.verifyAstrologerOtp;

      authTokenVar(accessToken);

      localStorage.setItem("astro_token", accessToken);
      localStorage.setItem("astro_user", JSON.stringify(astrologer));
      document.cookie = `astro_token=${accessToken}; path=/; SameSite=Lax`;
      dispatch(setCredentials({ astro_user: astrologer, astro_token: accessToken }));

      toast.success("Welcome");

    window.location.href = "/dashboard";
    } catch (err) {
      toast.error(err.message);
    }
  };

  // ================= OTP INPUT =================

  const handleChange = (e, i) => {
    const val = e.target.value.replace(/\D/, "");
    if (!val) return;

    const updated = [...otp];
    updated[i] = val;
    setOtp(updated);

    if (i < 3) document.getElementById(`otp-${i + 1}`)?.focus();
  };

  const handleBackspace = (e, i) => {
    if (e.key === "Backspace") {
      const updated = [...otp];
      if (otp[i]) updated[i] = "";
      else if (i > 0) document.getElementById(`otp-${i - 1}`)?.focus();
      setOtp(updated);
    }
  };

  // ================= UI =================

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-white">
      {/* ===== HEADER ===== */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.mobileHeader}>
            <div className={styles.logo}>
              <Image
                src="/logo.png"
                alt="Logo"
                width={130}
                height={50}
                className={styles.logoImage}
              />
            </div>
          </div>
          <nav className={styles.navLinks}>
            <Link href="#contact" className={styles.profile}>
              <Image
                src="/user2.png"
                width={35}
                height={35}
                alt="User Icon"
                className={styles.profileImage}
              />
              <h5 className={styles.signInText}>SignIN</h5>
            </Link>
          </nav>
        </div>
      </header>

      {/* ===== MAIN ===== */}
      <div className="flex  max-w-2xl flex-1 items-center justify-center px-4">
        {/* CARD */}
        <div className="w-full  bg-white shadow-xl rounded-2xl p-6 text-center">
          {otpSent === 1 && (
            <>
              <h2 className="text-2xl font-bold mb-2">Astrologer Login</h2>
              <p className="text-gray-500 mb-6">
                Enter your number to receive OTP
              </p>

              <div className="flex flex-col gap-4 items-center">
                <PhoneInput onChange={setPhoneData} />

                <button
                  onClick={handleGetOTP}
                  ref={getOtpBtnRef}
                  className="w-full cursor-pointer py-2 rounded-full bg-yellow-400 hover:bg-yellow-500 font-semibold transition"
                >
                  Send OTP
                </button>
              </div>
            </>
          )}

          {otpSent === 2 && (
            <>
              <h3 className="text-lg font-semibold mb-2">Verify OTP</h3>
              <p className="text-sm text-gray-500 mb-4">
                Sent to {phoneData.e164}
              </p>

              <div className="flex justify-center gap-3 mb-5">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    value={digit}
                    maxLength={1}
                    onChange={(e) => handleChange(e, i)}
                    onKeyDown={(e) => handleBackspace(e, i)}
                    className="w-12 h-12 text-lg text-center border-2 border-gray-200 rounded-xl shadow focus:border-yellow-400 focus:outline-none"
                  />
                ))}
              </div>

              <button
                onClick={handleVerifyOTP}
                ref={verifyBtnRef}
                className="w-full py-2 rounded-full bg-yellow-400 hover:bg-yellow-500 font-semibold transition"
              >
                Verify OTP
              </button>
            </>
          )}
        </div>
      </div>

      <footer className={`${styles.footer} !fixed bottom-0 left-0 w-full`}>
        <div className={styles.footerBox}>
          <p className={styles.footerText}>
            Copyright &copy; 2023-2025. Made with ❤️ by Dhwani Astro.
          </p>
        </div>
      </footer>
    </div>
  );
}
