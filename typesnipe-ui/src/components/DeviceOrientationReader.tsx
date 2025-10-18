"use client";

import React, { useContext, useEffect, useRef, useState } from "react";
import { DevicePermissionContext } from "@/contexts/DevicePermissionContext";

type Orientation = {
  alpha: number | null;
  beta: number | null;
  gamma: number | null;
  absolute: boolean | null;
};

type Motion = {
  acceleration: DeviceMotionEventAccelerationLike | null;
  accelerationIncludingGravity: DeviceMotionEventAccelerationLike | null;
  rotationRate: DeviceRotationRateLike | null;
};

// Some environments/TS configs may not include these DOM types; provide small local shims
type DeviceMotionEventAccelerationLike = {
  x: number | null;
  y: number | null;
  z: number | null;
};

type DeviceRotationRateLike = {
  alpha: number | null;
  beta: number | null;
  gamma: number | null;
};

export default function DeviceOrientationReader() {
  const ctx = useContext(DevicePermissionContext);
  const deviceMotionAllowed = ctx?.deviceMotion ?? true;

  const [orientation, setOrientation] = useState<Orientation>({
    alpha: null,
    beta: null,
    gamma: null,
    absolute: null,
  });
  const [motion, setMotion] = useState<Motion>({
    acceleration: null,
    accelerationIncludingGravity: null,
    rotationRate: null,
  });

  const attachedRef = useRef(false);

  useEffect(() => {
    if (!deviceMotionAllowed) {
      // don't attach listeners until permission is granted
      return;
    }

    if (attachedRef.current) return;
    attachedRef.current = true;

    const onOrientation = (e: DeviceOrientationEvent) => {
      const { alpha, beta, gamma, absolute } = e;
      console.log("deviceorientation", { alpha, beta, gamma, absolute });
      setOrientation({ alpha, beta, gamma, absolute });
    };

    const onMotion = (e: DeviceMotionEvent) => {
      const { acceleration, accelerationIncludingGravity, rotationRate } = e;
      console.log("devicemotion", {
        acceleration,
        accelerationIncludingGravity,
        rotationRate,
      });
      setMotion({ acceleration, accelerationIncludingGravity, rotationRate });
    };

    window.addEventListener("deviceorientation", onOrientation);
    window.addEventListener("devicemotion", onMotion);

    return () => {
      window.removeEventListener("deviceorientation", onOrientation);
      window.removeEventListener("devicemotion", onMotion);
      attachedRef.current = false;
    };
  }, [deviceMotionAllowed]);

  return (
    <div className="mt-4 w-full max-w-lg">
      <h3 className="font-semibold mb-2">Device orientation / motion</h3>
      {!deviceMotionAllowed ? (
        <div className="text-sm text-yellow-600">
          Permission not granted. Please enable device orientation.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div>
            <strong>Orientation</strong>
            <div className="font-mono">alpha: {orientation.alpha ?? "—"}</div>
            <div className="font-mono">beta: {orientation.beta ?? "—"}</div>
            <div className="font-mono">gamma: {orientation.gamma ?? "—"}</div>
            <div className="font-mono">
              absolute: {String(orientation.absolute)}
            </div>
          </div>

          <div>
            <strong>Motion</strong>
            <div className="font-mono flex flex-col whitespace-pre">
              {motion.acceleration !== null && (
                <>
                  <span>
                    accel x:{" "}
                    {motion.acceleration.x
                      ? `${motion.acceleration.x < 0 ? "-" : " "}${Math.abs(
                          motion.acceleration.x
                        ).toFixed(2)}`
                      : "null"}
                  </span>
                  <span>
                    accel y:{" "}
                    {motion.acceleration.y
                      ? `${motion.acceleration.y < 0 ? "-" : " "}${Math.abs(
                          motion.acceleration.y
                        ).toFixed(2)}`
                      : "null"}
                  </span>
                  <span>
                    accel z:{" "}
                    {motion.acceleration.z
                      ? `${motion.acceleration.z < 0 ? "-" : " "}${Math.abs(
                          motion.acceleration.z
                        ).toFixed(2)}`
                      : "null"}
                  </span>
                </>
              )}
            </div>
            <div className="font-mono">
              accelWithGravity:{" "}
              {motion.accelerationIncludingGravity
                ? JSON.stringify(motion.accelerationIncludingGravity)
                : "—"}
            </div>
            <div className="font-mono">
              rotationRate:{" "}
              {motion.rotationRate ? JSON.stringify(motion.rotationRate) : "—"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
