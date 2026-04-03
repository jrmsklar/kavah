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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStream();
      if (timerRef.current) clearInterval(timerRef.current);
      if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    };
  }, []);

  // Reset state when prompt changes
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

    recorder.start(1000); // collect data every second
    mediaRecorderRef.current = recorder;
    setState("recording");

    // Timer
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
    <div className="min-h-screen bg-gray-50">
      <StepProgress currentStep={3} />

      <div className="max-w-2xl mx-auto px-4 pb-8">
        <h1 className="text-2xl font-bold text-gray-900 mt-4">
          {prompt.label}
        </h1>

        {/* Video area */}
        <div className="mt-6 rounded-xl overflow-hidden bg-black aspect-video relative">
          {/* Idle state */}
          {state === "idle" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1}
                stroke="currentColor"
                className="w-12 h-12 text-gray-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
                />
              </svg>
              <p className="text-gray-500 text-sm mt-2">
                Click below to start your camera
              </p>
            </div>
          )}

          {/* Live preview */}
          {(state === "preview" || state === "recording") && (
            <video
              ref={(el) => {
                videoRef.current = el;
                if (el && streamRef.current) {
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

          {/* Recording indicator */}
          {state === "recording" && (
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 rounded-full px-3 py-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              <span className="text-white text-sm font-mono">
                {formatTime(elapsed)}
              </span>
            </div>
          )}

          {/* Playback review */}
          {state === "review" && recordedUrl && (
            <video
              ref={playbackRef}
              src={recordedUrl}
              className="w-full h-full object-cover"
              controls
              playsInline
            />
          )}

          {/* Uploading */}
          {state === "uploading" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <p className="text-white text-sm mt-3">{uploadProgress}</p>
            </div>
          )}

          {/* Done */}
          {state === "done" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              </div>
              <p className="text-green-400 text-sm mt-3 font-medium">
                Video recorded
              </p>
            </div>
          )}
        </div>

        {/* Action buttons based on state */}
        {state === "idle" && (
          <button
            onClick={startCamera}
            className="mt-4 w-full rounded-md bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-800 transition"
          >
            Start camera
          </button>
        )}

        {state === "preview" && (
          <button
            onClick={startRecording}
            className="mt-4 w-full rounded-md bg-red-600 px-6 py-3 text-sm font-medium text-white hover:bg-red-700 transition"
          >
            Record
          </button>
        )}

        {state === "recording" && (
          <button
            onClick={stopRecording}
            className="mt-4 w-full rounded-md bg-red-600 px-6 py-3 text-sm font-medium text-white hover:bg-red-700 transition flex items-center justify-center gap-2"
          >
            <div className="w-3 h-3 rounded-sm bg-white" />
            Stop recording
          </button>
        )}

        {state === "review" && (
          <div className="mt-4 flex gap-3">
            <button
              onClick={handleReRecord}
              className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Re-record
            </button>
            <button
              onClick={handleUseVideo}
              className="flex-1 rounded-md bg-green-600 px-4 py-3 text-sm font-medium text-white hover:bg-green-700 transition"
            >
              Use this video
            </button>
          </div>
        )}

        {state === "done" && !existingResponse && (
          <button
            onClick={handleReRecord}
            className="mt-4 w-full rounded-md border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            Re-record
          </button>
        )}

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        {/* Navigation */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={onBack}
            className="rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            Back
          </button>
          <button
            onClick={onNext}
            disabled={!canProceed}
            className="flex-1 rounded-md bg-amber-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-amber-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLast ? "Finish" : "Next prompt \u2192"}
          </button>
        </div>
      </div>
    </div>
  );
}
