"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import styles from "@/app/login/login.module.css";
import { AiFillAndroid } from "react-icons/ai";
import { FaFacebookF, FaInstagram, FaQuora, FaYoutube, FaXTwitter } from "react-icons/fa6";



export default function LoginPage() {
  const router = useRouter(); // ✅ Use Next.js router
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 

    if (formData.username === "admin" && formData.password === "password") {
      router.push("/dashboard"); 
    } else {
      setError("Invalid username or password.");
    }
  };

  return (
    <div className={styles.nboby}>
      <div className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerInner}>
            <div className={styles.mobileHeader}>
              <div className={styles.logo}>
                <Image src="/logo.png" alt="loading..." width={130} height={50} className={styles.logoImage} />
              </div>
            </div>
            <nav className={styles.navLinks}>
              <Link href="#contact" className={styles.profile}>
                <Image src="/user2.png" width={35} height={35} alt="" className={styles.profileImage} />
                <h5 className={styles.signInText}>SignIN</h5>
              </Link>
            </nav>
          </div>
        </header>

        <div className={styles.loginContainer}>
          <div className={styles.loginBox}>
            <h2>Login</h2>
            <span>Enter the credentials.</span>
          </div>
          <form onSubmit={handleSubmit}> 
            <label htmlFor="username">Email:</label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Email or Phone number.."
              required
              onChange={handleChange}
            />

            <label htmlFor="password">Password:</label>
            <input type="password" id="password" name="password" required onChange={handleChange} />

            {error && <p style={{ color: "red" }}>{error}</p>} 

            <button type="submit">Login</button>
          </form>
        </div>

        {/* Footer */}
        <footer className={styles.footer}>
          <div className={styles.socialIcons}>
            <AiFillAndroid size={25} className="text-white" />
            <FaFacebookF size={25} className="text-white" />
            <FaInstagram size={25} className="text-white" />
            <FaQuora size={25} className="text-white" />
            <FaYoutube size={25} className="text-white" />
            <FaXTwitter size={25} className="text-white" />
          </div>

          <div className={styles.footerLinks}>
            <ul className={styles.footerList}>
              <li>
                <Link href="#" className={styles.footerLink}>Cookies</Link>
              </li>
              <li>
                <Link href="#" className={styles.footerLink}>Terms &amp; Conditions</Link>
              </li>
              <li>
                <Link href="#" className={styles.footerLink}>Privacy Policy</Link>
              </li>
              <li>
                <Link href="#" className={styles.footerLink}>Support</Link>
              </li>
            </ul>
          </div>
          <hr />
          <div className={styles.footerBox}>
            <p className={styles.footerText}>
              Copyright &copy; 2023. Made with ❤️ by Dhwani Astro.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
