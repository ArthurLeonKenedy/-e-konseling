"use client";

import { usePushNotifications } from "../hooks/usePushNotifications";

export default function NotificationBanner({ variant = "light" }) {
  const { requestPermission, needsPermission, isSupported } = usePushNotifications();

  if (!isSupported || !needsPermission) return null;

  const isDark = variant === "dark";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        padding: "10px 16px",
        borderRadius: "12px",
        marginBottom: "16px",
        background: isDark ? "rgba(255,255,255,0.1)" : "#fffbeb",
        border: isDark ? "1px solid rgba(255,255,255,0.2)" : "1px solid #fde68a",
      }}
    >
      <div style={{ flex: 1 }}>
        <p
          style={{
            fontSize: "12px",
            fontWeight: 700,
            color: isDark ? "#fef3c7" : "#92400e",
            margin: 0,
          }}
        >
          Notifikasi belum aktif
        </p>
        <p
          style={{
            fontSize: "11px",
            fontWeight: 500,
            color: isDark ? "rgba(255,255,255,0.7)" : "#b45309",
            margin: "2px 0 0",
          }}
        >
          Aktifkan untuk menerima pemberitahuan chat dan booking konseling.
        </p>
      </div>
      <button
        type="button"
        onClick={requestPermission}
        style={{
          padding: "8px 14px",
          borderRadius: "8px",
          border: "none",
          fontSize: "10px",
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          cursor: "pointer",
          background: isDark ? "#fbbf24" : "#d97706",
          color: isDark ? "#1e293b" : "white",
          whiteSpace: "nowrap",
        }}
      >
        Aktifkan
      </button>
    </div>
  );
}
