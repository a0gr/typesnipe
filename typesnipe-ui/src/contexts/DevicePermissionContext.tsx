"use client";

import React, {
  ReactNode,
  createContext,
  useCallback,
  useEffect,
  useState,
} from "react";

declare interface DeviceOrientationEventiOS extends DeviceOrientationEvent {
  requestPermission?: () => Promise<"granted" | "denied">;
}

export type DevicePermissionContextValue = {
  deviceMotion: boolean;
  requestDeviceMotion: () => Promise<boolean>;
};

export const DevicePermissionContext = createContext<
  DevicePermissionContextValue | undefined
>(undefined);

export function DevicePermissionContextWrapper({
  children,
}: {
  children: ReactNode;
}) {
  const [deviceMotion, setDeviceMotion] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      setDeviceMotion(await requestDeviceMotionPermission());
    })();
  }, []);

  // On iOS 13+, you cannot request for device motion without a user gesture, so we first try to
  // request motion, and if it fails we then allow a child object to create a button to call the
  // request.
  const requestDeviceMotion = useCallback(async () => {
    const granted = await requestDeviceMotionPermission();
    setDeviceMotion(granted);
    return granted;
  }, []);

  return (
    <DevicePermissionContext.Provider
      value={{
        deviceMotion: deviceMotion,
        requestDeviceMotion: requestDeviceMotion,
      }}
    >
      {children}
    </DevicePermissionContext.Provider>
  );
}

export async function requestDeviceMotionPermission() {
  const requestPermission = (
    DeviceOrientationEvent as unknown as DeviceOrientationEventiOS
  ).requestPermission;
  const requestExists = typeof requestPermission === "function";

  // If we are on iOS 13+ we need to ask for permission to access device motion.
  if (requestExists) {
    try {
      return (await requestPermission()) == "granted";
    } catch {
      return false;
    }
  }

  return !requestExists;
}
