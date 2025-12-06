"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/");
    } else {
      setIsAuthorized(true);
    }
  }, []);

  if (!isAuthorized) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  return children;
}
