"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { soundtrack } from "./chapters";

export type AudioStatus = "idle" | "loading" | "playing" | "muted" | "paused" | "ended" | "error" | "unavailable";

export function useAudio(available: boolean) {
  const [status, setStatus] = useState<AudioStatus>(available ? "idle" : "unavailable");
  const [message, setMessage] = useState("");
  const audio = useRef<HTMLAudioElement | null>(null);
  const context = useRef<AudioContext | null>(null);
  const gain = useRef<GainNode | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const energy = useRef(0);
  const enabled = useRef(false);
  const mounted = useRef(true);
  const request = useRef(0);
  const analysisFrame = useRef(0);

  const setup = useCallback(() => {
    if (audio.current) return audio.current;
    const element = new Audio(soundtrack.src);
    element.preload = "auto";
    audio.current = element;
    element.addEventListener("ended", () => { if (mounted.current) setStatus("ended"); });
    element.addEventListener("error", () => {
      if (!mounted.current) return;
      setStatus("error");
      setMessage("Sound couldn't load. You can keep exploring quietly.");
    });
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioContextClass();
      const volume = ctx.createGain();
      const meter = ctx.createAnalyser();
      meter.fftSize = 256;
      meter.smoothingTimeConstant = 0.88;
      volume.gain.value = 0;
      ctx.createMediaElementSource(element).connect(meter);
      meter.connect(volume);
      volume.connect(ctx.destination);
      context.current = ctx;
      gain.current = volume;
      analyser.current = meter;
    } catch {
      element.volume = soundtrack.gain;
    }
    return element;
  }, []);

  const start = useCallback((restart = false) => {
    if (!available) {
      setMessage("Sound isn't available yet. Enjoy the experience quietly.");
      return;
    }
    enabled.current = true;
    const id = ++request.current;
    const element = setup();
    if (restart || element.ended) element.currentTime = 0;
    element.muted = false;
    setStatus("loading");
    // Both calls run synchronously inside the initiating user gesture.
    const resume = context.current?.resume() ?? Promise.resolve();
    const play = element.play();
    void Promise.all([resume, play]).then(() => {
      if (!mounted.current || id !== request.current) return;
      const ctx = context.current;
      if (ctx && gain.current) {
        gain.current.gain.cancelScheduledValues(ctx.currentTime);
        gain.current.gain.setTargetAtTime(soundtrack.gain, ctx.currentTime, 0.3);
      }
      setStatus("playing");
      setMessage("");
    }).catch(() => {
      if (!mounted.current || id !== request.current) return;
      element.pause();
      setStatus("error");
      setMessage("Tap Sound to try again. The experience continues quietly.");
    });
  }, [available, setup]);

  const mute = useCallback(() => {
    enabled.current = false;
    ++request.current;
    const ctx = context.current;
    if (ctx && gain.current) {
      gain.current.gain.cancelScheduledValues(ctx.currentTime);
      gain.current.gain.setTargetAtTime(0, ctx.currentTime, 0.12);
    } else if (audio.current) audio.current.muted = true;
    setStatus("muted");
  }, []);

  const toggle = useCallback(() => {
    if (status === "playing" || status === "loading") mute();
    else start();
  }, [mute, start, status]);

  const replay = useCallback(() => {
    if (enabled.current) start(true);
    else if (audio.current) audio.current.currentTime = 0;
  }, [start]);

  useEffect(() => {
    mounted.current = true;
    const data = new Uint8Array(128);
    const sample = () => {
      if (document.hidden) { energy.current = 0; return; }
      let target = 0;
      if (analyser.current && enabled.current && !audio.current?.paused) {
        analyser.current.getByteFrequencyData(data);
        for (let i = 2; i < 30; i++) target += data[i];
        target /= 28 * 255;
      }
      energy.current += (target - energy.current) * 0.06;
      analysisFrame.current = requestAnimationFrame(sample);
    };
    const visibility = () => {
      cancelAnimationFrame(analysisFrame.current);
      if (document.hidden) {
        ++request.current;
        if (audio.current && !audio.current.paused) {
          audio.current.pause();
          setStatus(enabled.current ? "paused" : "muted");
        }
        energy.current = 0;
      } else sample();
    };
    sample();
    document.addEventListener("visibilitychange", visibility);
    return () => {
      mounted.current = false;
      cancelAnimationFrame(analysisFrame.current);
      document.removeEventListener("visibilitychange", visibility);
      audio.current?.pause();
      audio.current?.removeAttribute("src");
      void context.current?.close();
      audio.current = null;
      context.current = null;
      gain.current = null;
      analyser.current = null;
    };
  }, []);

  return { status, message, energy, start, toggle, replay, clearMessage: () => setMessage("") };
}
