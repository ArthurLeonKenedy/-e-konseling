/**
 * apiFetch — Wrapper fetch yang otomatis menyisipkan Bearer Token
 * dari localStorage ke setiap request API yang membutuhkan autentikasi.
 *
 * Penggunaan: persis seperti fetch() biasa
 *   apiFetch('/api/konselings', { method: 'GET' })
 *   apiFetch('/api/chats', { method: 'POST', body: JSON.stringify({...}) })
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("api_token") || null;
}

export async function apiFetch(path, options = {}) {
  const token = getToken();

  const defaultHeaders = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  // Jika ada FormData, jangan paksa Content-Type (biarkan browser set boundary)
  const isFormData = options.body instanceof FormData;
  const headers = isFormData
    ? { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers }
    : { ...defaultHeaders, ...options.headers };

  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Interceptor untuk token expired / unauthorized
    if (response.status === 401 && typeof window !== "undefined") {
      console.warn("Sesi berakhir (401), mengalihkan ke login...");
      localStorage.removeItem("api_token");
      localStorage.removeItem("user");
      // Gunakan window.location.href agar bersih (full reload)
      window.location.href = "/";
    }

    // Feedback visual untuk Error Server (500)
    if (response.status >= 500 && typeof window !== "undefined") {
      const now = Date.now();
      if (!window.__lastErrorAlert || now - window.__lastErrorAlert > 60000) {
        alert("⚠️ Terjadi gangguan koneksi ke server. Silakan coba beberapa saat lagi.");
        window.__lastErrorAlert = now;
      }
    }

    return response;
  } catch (error) {
    console.error("apiFetch error:", error);
    if (typeof window !== "undefined") {
      const now = Date.now();
      if (!window.__lastNetworkAlert || now - window.__lastNetworkAlert > 60000) {
        alert("❌ Tidak dapat terhubung ke server. Pastikan koneksi internet Anda aktif.");
        window.__lastNetworkAlert = now;
      }
    }
    throw error;
  }
}
