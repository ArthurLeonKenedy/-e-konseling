"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../../lib/apiFetch";

export function useAuthGuard(requiredRole) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const validate = async () => {
      try {
        // 1. Cek localStorage dulu (cepat)
        const userStr = localStorage.getItem("user");
        const token = localStorage.getItem("api_token");

        if (!userStr || !token) {
          router.replace("/");
          return;
        }

        const user = JSON.parse(userStr);

        // 2. Cek role lokal
        if (requiredRole === "siswa" && user.role !== "siswa") {
          router.replace("/");
          return;
        }
        if (requiredRole === "guru" && (user.kelas || user.role === "admin")) {
          router.replace("/");
          return;
        }
        if (requiredRole === "admin" && user.role !== "admin") {
          router.replace("/");
          return;
        }

        // 3. Validasi token ke server (pastikan token masih valid di backend)
        const res = await apiFetch("/api/user");
        if (!res.ok) {
          // Token expired atau dihapus di backend, atau tidak ada token
          localStorage.removeItem("user");
          localStorage.removeItem("api_token");
          router.replace("/");
          return;
        }

        setIsAuthorized(true);
      } catch {
        // Jika server tidak bisa dihubungi, tetap izinkan akses
        // agar UX tidak terganggu saat koneksi lambat
        const userStr = localStorage.getItem("user");
        if (userStr) {
          setIsAuthorized(true);
        } else {
          router.replace("/");
        }
      } finally {
        setIsChecking(false);
      }
    };

    validate();
  }, [router, requiredRole]);

  return { isAuthorized, isChecking };
}
