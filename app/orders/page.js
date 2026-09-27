"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OrdersRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/profile");
  }, [router]);

  return (
    <div style={{
      display: "flex", justifyContent: "center", alignItems: "center",
      height: "100vh", backgroundColor: "#FFFFFF",
      fontFamily: "'Georgia', 'Times New Roman', serif",
    }}>
      <div style={{ fontSize: 18, color: "#6F4E37" }}>Redirecting...</div>
    </div>
  );
}