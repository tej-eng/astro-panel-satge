"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/app/redux/slice/authSlice";
import { useMutation } from "@apollo/client/react";

import styles from "@/app/login/login.module.css";
import PhoneInput from "./login/PhoneInput";

import { toast } from "react-toastify";
import { authTokenVar } from "../../utils/apolloClient";
import { gql } from "@apollo/client";

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
          contactNo: phoneData.e164,
          otp: enteredOtp,
        },
      });

      const { accessToken, astrologer } = res.data.verifyAstrologerOtp;

      // 🔥 store in Apollo (for API calls)
      authTokenVar(accessToken);

      // 🔥 store in localStorage
      localStorage.setItem("astro_token", accessToken);
      localStorage.setItem("astro_user", JSON.stringify(astrologer));

      // 🔥 optional redux
      dispatch(setCredentials({ user: astrologer, token: accessToken }));

      router.push("/dashboard");
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

    if (i < 3) {
      document.getElementById(`otp-${i + 1}`)?.focus();
    }
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
    <div className={styles.container}>
      {otpSent === 1 && (
        <div>
          <h2>Astrologer Login</h2>

          <PhoneInput onChange={setPhoneData} />

          <button onClick={handleGetOTP} ref={getOtpBtnRef}>
            Send OTP
          </button>
        </div>
      )}

      {otpSent === 2 && (
        <div>
          <h3>Enter OTP sent to {phoneData.e164}</h3>

          <div style={{ display: "flex", gap: "10px" }}>
            {otp.map((digit, i) => (
              <input
                key={i}
                id={`otp-${i}`}
                value={digit}
                maxLength={1}
                onChange={(e) => handleChange(e, i)}
                onKeyDown={(e) => handleBackspace(e, i)}
                style={{
                  width: "40px",
                  height: "40px",
                  textAlign: "center",
                }}
              />
            ))}
          </div>

          <button onClick={handleVerifyOTP} ref={verifyBtnRef}>
            Verify OTP
          </button>
        </div>
      )}
    </div>
  );
}
