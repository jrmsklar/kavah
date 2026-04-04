"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { StepProgress } from "./step-progress";
import { supabase } from "@kavah/db";
import type { Prompt } from "@/types/prompts";

type RecordingState = "idle" | "preview" | "recording" | "review" | "uploading" | "done";

export function VideoStep({
  prompt,
  currentIndex,
  totalCount,
  communityId,
  clerkUserId,
  existingResponse,
  onRecorded,
  onNext,
  onBack,
}: {
  prompt: Prompt;
  currentIndex: number;
  totalCount: number;
  communityId: string;
  clerkUserId: string | null;
  existingResponse: string | null;
  onRecorded: (promptId: string, videoUrl: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const isLast = currentIndex === totalCount - 1;

  const videoRef = useRef<HTMLVideoElement>(null);
  const playbackRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [state, setState] = useState<RecordingState>(
    existingResponse ? "done" : "idle"
  );
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState("");

  useEffect(() => {
    return () => {
      stopStream();
      if (timerRef.current) clearInterval(timerRef.current);
      if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    };
  }, []);

  useEffect(() => {
    stopStream();
    if (timerRef.current) clearInterval(timerRef.current);
    if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    setRecordedBlob(null);
    setRecordedUrl(null);
    setElapsed(0);
    setError("");
    setUploadProgress("");
    setState(existingResponse ? "done" : "idle");
  }, [prompt.id]);

  function stopStream() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }

  const startCamera = useCallback(async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      streamRef.current = stream;
      setState("preview");
    } catch {
      setError("Could not access camera. Please allow camera and microphone permissions.");
    }
  }, []);

  function startRecording() {
    if (!streamRef.current) return;
    chunksRef.current = [];
    setElapsed(0);

    const recorder = new MediaRecorder(streamRef.current, {
      mimeType: MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : "video/webm",
    });

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      setRecordedBlob(blob);
      setRecordedUrl(url);
      stopStream();
      setState("review");
    };

    recorder.start();
    mediaRecorderRef.current = recorder;
    setState("recording");

    timerRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
  }

  function stopRecording() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    mediaRecorderRef.current?.stop();
  }

  async function handleReRecord() {
    if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    setRecordedBlob(null);
    setRecordedUrl(null);
    setElapsed(0);
    await startCamera();
  }

  async function handleUseVideo() {
    if (!recordedBlob) return;
    setState("uploading");
    setUploadProgress("Uploading video...");

    const userId = clerkUserId ?? "anonymous";
    const filePath = `${communityId}/${userId}/${prompt.id}.webm`;

    const { error: uploadError } = await supabase.storage
      .from("video-responses")
      .upload(filePath, recordedBlob, {
        contentType: "video/webm",
        upsert: true,
      });

    if (uploadError) {
      setError(`Upload failed: ${uploadError.message}`);
      setState("review");
      return;
    }

    const { data: urlData } = supabase.storage
      .from("video-responses")
      .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;
    onRecorded(prompt.id, publicUrl);
    setState("done");
    setUploadProgress("");
  }

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  const canProceed = state === "done" || !!existingResponse;

  return (
    <div className="min-h-screen">
      <StepProgress currentStep={3} />

      <div className="max-w-lg mx-auto px-5 pb-10">
        {/* Prompt badge */}
        <div className="flex items-center gap-2 mt-2">
          <span className="rounded-full bg-gold-pale border border-gold-light px-3 py-1 text-xs font-medium text-gold">
            Prompt {currentIndex + 1} of {totalCount}
          </span>
        </div>

        {/* Question */}
        <h1 className="font-serif text-xl font-medium text-ink mt-4 leading-relaxed">
          {prompt.label}
        </h1>

        {/* Video area */}
        <div className="mt-5 rounded-2xl overflow-hidden bg-ink aspect-video relative shadow-sm">
          {state === "idle" && (
            <button
              onClick={startCamera}
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 hover:bg-white/5 transition group"
            >
              <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition">
                <svg className="w-7 h-7 text-white/70" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
              </div>
              <p className="text-white/50 text-sm font-medium">
                Tap to start camera
              </p>
            </button>
          )}

          {(state === "preview" || state === "recording") && (
            <video
              ref={(el) => {
                videoRef.current = el;
                if (el && streamRef.current && el.srcObject !== streamRef.current) {
                  el.srcObject = streamRef.current;
                }
              }}
              className="w-full h-full object-cover"
              autoPlay
              muted
              playsInline
              style={{ transform: "scaleX(-1)" }}
            />
          )}

          {state === "recording" && (
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose animate-pulse" />
              <span className="text-white text-xs font-medium tabular-nums">
                {formatTime(elapsed)}
              </span>
            </div>
          )}

          {state === "review" && recordedUrl && (
            <video
              ref={playbackRef}
              src={recordedUrl}
              className="w-full h-full object-cover"
              controls
              playsInline
            />
          )}

          {state === "uploading" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <p className="text-white/60 text-sm">{uploadProgress}</p>
            </div>
          )}

          {state === "done" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <div className="w-14 h-14 rounded-full bg-sage/20 flex items-center justify-center">
                <svg className="w-7 h-7 text-sage" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <p className="text-sage text-sm font-medium">Video recorded</p>
            </div>
          )}
        </div>

        {/* Action buttons */}
        {state === "preview" && (
          <button
            onClick={startRecording}
            className="mt-4 w-full rounded-xl bg-rose px-6 py-3 text-sm font-semibold text-white hover:bg-rose/90 transition flex items-center justify-center gap-2"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-white" />
            Record
          </button>
        )}

        {state === "recording" && (
          <button
            onClick={stopRecording}
            className="mt-4 w-full rounded-xl bg-rose px-6 py-3 text-sm font-semibold text-white hover:bg-rose/90 transition flex items-center justify-center gap-2"
          >
            <div className="w-2.5 h-2.5 rounded-sm bg-white" />
            Stop recording
          </button>
        )}

        {state === "review" && (
          <div className="mt-4 flex gap-3">
            <button
              onClick={handleReRecord}
              className="flex-1 rounded-xl border border-border bg-warm px-4 py-3 text-sm font-medium text-ink-2 hover:bg-cream transition"
            >
              Re-record
            </button>
            <button
              onClick={handleUseVideo}
              className="flex-1 rounded-xl bg-sage px-4 py-3 text-sm font-semibold text-white hover:bg-sage/90 transition"
            >
              Use this video
            </button>
          </div>
        )}

        {state === "done" && !existingResponse && (
          <button
            onClick={handleReRecord}
            className="mt-4 w-full rounded-xl border border-border bg-warm px-6 py-3 text-sm font-medium text-ink-2 hover:bg-cream transition"
          >
            Re-record
          </button>
        )}

        {error && <p className="mt-3 text-sm text-rose">{error}</p>}

        {/* Navigation */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={onBack}
            className="rounded-xl border border-border bg-warm px-5 py-3 text-sm font-medium text-ink-2 hover:bg-cream transition"
          >
            Back
          </button>
          <button
            onClick={onNext}
            disabled={!canProceed}
            className="flex-1 rounded-xl bg-ink px-6 py-3 text-sm font-semibold text-white hover:bg-ink/90 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLast ? "Finish" : "Next prompt"}
          </button>
        </div>
      </div>
    </div>
  );
}
