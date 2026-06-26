"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "../../lib/apiFetch";

const PUBLIC_VAPID_KEY =
  "BK-sfoz79Jqq9LAh8ttKhCfHP8ar8JpsMkeb8TfttqIkr-mVZcpX3IsRfGQaloB5sotVGtEaup9NwiuiXIfRB0M";

const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export const usePushNotifications = () => {
  const [permission, setPermission] = useState("default");
  const [isSupported, setIsSupported] = useState(false);

  const subscribeUser = useCallback(async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return false;

    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY),
      });

      const userStr = localStorage.getItem("user");
      if (!userStr) return false;
      const user = JSON.parse(userStr);

      await apiFetch(`/api/push-subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          subscription: subscription,
        }),
      });

      return true;
    } catch (err) {
      console.error("Failed to subscribe user:", err);
      return false;
    }
  }, []);

  useEffect(() => {
    const supported =
      typeof window !== "undefined" &&
      "Notification" in window &&
      "serviceWorker" in navigator &&
      "PushManager" in window;
    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission);
      if (Notification.permission === "granted") {
        subscribeUser();
      }
    }
  }, [subscribeUser]);

  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      alert("Browser Anda tidak mendukung notifikasi push.");
      return false;
    }

    if (Notification.permission === "granted") {
      return await subscribeUser();
    }

    if (Notification.permission === "denied") {
      alert(
        "Notifikasi diblokir. Buka pengaturan browser dan izinkan notifikasi untuk situs ini."
      );
      return false;
    }

    const result = await Notification.requestPermission();
    setPermission(result);

    if (result === "granted") {
      return await subscribeUser();
    }

    return false;
  }, [isSupported, subscribeUser]);

  const needsPermission = isSupported && permission !== "granted";

  return { requestPermission, permission, isSupported, needsPermission };
};
