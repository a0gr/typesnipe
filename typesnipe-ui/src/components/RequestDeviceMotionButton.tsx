"use client";

import React, { useContext, useState } from "react";
import { DevicePermissionContext } from "@/contexts/DevicePermissionContext";

export default function RequestDeviceMotionButton() {
  const ctx = useContext(DevicePermissionContext);
  const [loading, setLoading] = useState(false);

  if (!ctx) return null;

  const { deviceMotion, requestDeviceMotion } = ctx;

  const onClick = async () => {
    setLoading(true);
    try {
      await requestDeviceMotion();
    } finally {
      setLoading(false);
    }
  };

  if (deviceMotion) {
    return (
      <button
        disabled
        className="rounded-md px-4 py-2 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
      >
        Device motion allowed
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="rounded-md px-4 py-2 bg-blue-600 text-white disabled:opacity-60"
    >
      {loading ? "Requesting…" : "Enable device orientation"}
    </button>
  );
}
