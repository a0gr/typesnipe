"use client";

import React, { useContext, useEffect, useRef, useState } from "react";
import { DevicePermissionContext } from "@/contexts/DevicePermissionContext";
import { getApi } from "@/utils";
import { time } from "console";
import { KeystrokeModel } from "@/Api";
import { text } from "stream/consumers";

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

const textPrompt =
  `ocean exploration often reveals a vivid mixture of wonder science
  and quiet resolve and researchers who descend into the shifting blue
  world describe a realm full of surprising textures unusual rhythms
  and unpredictable challenges marine geologists for example use
  sensitive instruments to map ridges vents and zigzag fissures along
  the seafloor while biologists examine exotic organisms whose
  behaviors seem almost alien every dive blends curiosity with
  discipline crews must adjust equipment quickly fix unexpected
  glitches and keep calm even when visibility fades or currents surge
  meanwhile chemical analysts probe swirling plumes released by
  hydrothermal vents tracking elements that link deep ecosystems to
  processes shaping the entire planet the work demands flexibility yet
  also rewards creativity since each mission may unveil new clues
  about climate geology or longhidden habitats even the submersibles
  themselves embody a kind of quiet artistry combining rugged metal
  frames with delicate sensors that register tiny vibrations in water
  filled with drifting particles during long expeditions teams
  cultivate an easy camaraderie that helps them handle stress
  engineers exchange jokes while replacing cables pilots meditate
  through the silent descent photographers adjust lenses to capture
  fleeting glimmers of bioluminescent life although the pressure
  outside a vessel grows extreme the mood inside often remains
  surprisingly light because everyone shares the same underlying zeal
  they know that each measurement sample or image contributes to a
  bigger portrait of earths hidden systems once a dive ends the pace
  quickens again specialists label vials isolate microbes or refine
  models that simulate how heat minerals and organic matter flow
  through turbulent zones the cycle repeats prepare descend observe
  collect analyze until fatigue yields to satisfaction as findings
  accumulate despite the meticulous planning that defines each journey
  chance still shapes discovery a subtle shift in current may expose
  quartz fragments rare corals or unexpected traces of methane seeping
  from porous rock a quiet eddy may guide explorers toward shimmering
  clouds of plankton where tiny larvae dance in spirals illuminated by
  faint electric hues these moments though brief energize entire crews
  they remind everyone that the ocean vast and intricate continues to
  evolve in ways that surprise even the most seasoned scientists in
  the end exploration blends method and marvel ensuring that each
  venture beneath the waves functions both as rigorous inquiry and as
  a celebration of natures exuberant diversity`.replace(/\n\s*/g, " ");

export default function DeviceOrientationReader() {
  const ctx = useContext(DevicePermissionContext);
  const deviceMotionAllowed = ctx?.deviceMotion ?? true;
  const inputRef = useRef<HTMLInputElement>(null);

  const [orientation, setOrientation] = useState<Orientation>({
    alpha: null,
    beta: null,
    gamma: null,
    absolute: null,
  });
  const keystrokes = useRef<KeystrokeModel[]>([]);
  const [input, setInput] = useState("");

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
      setOrientation({ alpha, beta, gamma, absolute });
    };

    window.addEventListener("deviceorientation", onOrientation);

    return () => {
      window.removeEventListener("deviceorientation", onOrientation);
      attachedRef.current = false;
    };
  }, [deviceMotionAllowed]);

  return (
    <div className="mt-4 w-full max-w-lg flex flex-col">
      <h3 className="font-semibold mb-2">Type here and then click submit</h3>
      {!deviceMotionAllowed ? (
        <div className="text-sm text-yellow-600">
          Permission not granted. Please enable device orientation.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2 text-sm">
          {/* <div>
            <strong>Orientation</strong>
            <div className="font-mono">alpha: {orientation.alpha ?? "—"}</div>
            <div className="font-mono">beta: {orientation.beta ?? "—"}</div>
            <div className="font-mono">gamma: {orientation.gamma ?? "—"}</div>
          </div> */}
          <div>{textPrompt.slice(input.length, input.length + 40)}</div>
          <input
            ref={inputRef}
            className="w-full border rounded-md p-2"
            onInput={async (e) => {
              setInput(e.currentTarget.value);
              keystrokes.current.push({
                value: e.currentTarget.value,
                orientation: {
                  alpha: orientation.alpha ?? -1,
                  beta: orientation.beta ?? -1,
                  gamma: orientation.gamma ?? -1,
                },
                time: Date.now(),
              });
            }}
          ></input>
          <button
            className="rounded-md bg-black text-white w-fit p-2 self-center active:scale-90"
            onClick={async (e) => {
              await getApi().data.postData(keystrokes.current);
              keystrokes.current = [];
              if (inputRef.current) {
                inputRef.current.value = "";
              }
            }}
          >
            Submit
          </button>
        </div>
      )}
    </div>
  );
}
