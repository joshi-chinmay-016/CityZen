"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Clock,
  MapPin,
  Navigation,
  Shield,
  Trophy,
  Upload,
  Zap,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { geocodingService } from "@/services/geocodingService";
import { reportService } from "@/services/reportService";

type HazardOption = {
  id: string;
  label: string;
  emoji: string;
  styles: string;
};

type SeverityOption = {
  level: number;
  emoji: string;
  label: string;
  styles: string;
};

type SubmitStep = {
  id: string;
  title: string;
  description: string;
};

const hazardOptions: HazardOption[] = [
  { id: "pothole", label: "Pothole", emoji: "🔴", styles: "border-red-400/22 bg-red-500/12 text-red-200" },
  { id: "manhole", label: "Manhole", emoji: "🟡", styles: "border-amber-400/22 bg-amber-500/12 text-amber-200" },
  { id: "crack", label: "Crack", emoji: "🔵", styles: "border-sky-400/22 bg-sky-500/12 text-sky-200" },
  { id: "speed_breaker", label: "Speed Breaker", emoji: "⚫", styles: "border-zinc-400/22 bg-zinc-500/12 text-zinc-200" },
  { id: "waterlogging", label: "Waterlogging", emoji: "🟠", styles: "border-orange-400/22 bg-orange-500/12 text-orange-200" },
];

const severityOptions: SeverityOption[] = [
  { level: 1, emoji: "💧", label: "Minor", styles: "border-sky-400/22 bg-sky-500/12 text-sky-200" },
  { level: 2, emoji: "🌊", label: "Low", styles: "border-cyan-400/22 bg-cyan-500/12 text-cyan-200" },
  { level: 3, emoji: "⚠️", label: "Moderate", styles: "border-amber-400/22 bg-amber-500/12 text-amber-200" },
  { level: 4, emoji: "🚨", label: "Severe", styles: "border-red-400/22 bg-red-500/12 text-red-200" },
  { level: 5, emoji: "💀", label: "Critical", styles: "border-violet-400/22 bg-violet-500/12 text-violet-200" },
];

const trackerSteps: SubmitStep[] = [
  { id: "01", title: "Submitted", description: "The report enters CityZen and gets timestamped." },
  { id: "02", title: "AI Verified", description: "Signals are classified and severity is cross-checked." },
  { id: "03", title: "Confirmed", description: "The hazard is validated against nearby activity." },
  { id: "04", title: "Live on Map", description: "It becomes visible to every driver on the network." },
];

const leaderboard = [
  { rank: 1, name: "Ananya", streak: 19, points: 1480, badge: "🥇" },
  { rank: 2, name: "Rahul", streak: 13, points: 1340, badge: "🥈" },
  { rank: 3, name: "Meera", streak: 11, points: 1288, badge: "🥉" },
  { rank: 4, name: "Karan", streak: 9, points: 1212, badge: "⭐" },
  { rank: 47, name: "You", streak: 3, points: 320, badge: "🟢" },
];

const toBackendType = (hazardType: string): "traffic" | "pothole" | "safety" => {
  switch (hazardType) {
    case "pothole":
      return "pothole";
    case "waterlogging":
      return "traffic";
    default:
      return "safety";
  }
};

const toReportSeverity = (label: string): "Low" | "Medium" | "High" | "Critical" => {
  switch (label) {
    case "Minor":
    case "Low":
      return "Low";
    case "Moderate":
      return "Medium";
    case "Severe":
      return "High";
    case "Critical":
      return "Critical";
    default:
      return "Medium";
  }
};

function StepBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[28px] border border-white/8 bg-white/[0.02] p-5">
      <div className="mb-4 text-sm uppercase tracking-[0.24em] text-white/40">{title}</div>
      {children}
    </div>
  );
}

function Tracker({ activeStep, pulseStep }: { activeStep: number; pulseStep?: number }) {
  return (
    <div className="space-y-5">
      {trackerSteps.map((step, index) => {
        const stepNumber = index + 1;
        const isComplete = stepNumber < activeStep;
        const isActive = stepNumber === activeStep;
        const shouldPulse = pulseStep === stepNumber;

        return (
          <div key={step.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={[
                  "flex h-11 w-11 items-center justify-center rounded-2xl border text-sm font-mono",
                  isComplete || isActive
                    ? "border-emerald-400/20 bg-emerald-500/12 text-emerald-200"
                    : "border-white/8 bg-white/[0.02] text-white/34",
                  shouldPulse ? "animate-pulse" : "",
                ].join(" ")}
              >
                {isComplete ? <CheckCircle2 className="h-4 w-4" /> : step.id}
              </div>
              {index < trackerSteps.length - 1 ? (
                <div className={`mt-3 h-12 w-px ${stepNumber < activeStep ? "bg-emerald-400/40" : "bg-white/10"}`} />
              ) : null}
            </div>
            <div className="pt-1">
              <div className={isComplete || isActive ? "text-white" : "text-white/44"}>{step.title}</div>
              <div className="mt-1 max-w-sm text-sm leading-6 text-white/46">{step.description}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function ReportsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [hazardType, setHazardType] = useState<string>("pothole");
  const [severity, setSeverity] = useState<number>(3);
  const [locationInput, setLocationInput] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(searchParams.get("submitted") === "1");
  const [successStep, setSuccessStep] = useState(1);
  const previewUrlRef = useRef<string | null>(null);

  const selectedSeverity = useMemo(
    () => severityOptions.find((item) => item.level === severity) ?? severityOptions[2],
    [severity]
  );

  const points = useMemo(() => {
    const base = 30;
    const photoBonus = photo ? 10 : 0;
    const streakBonus = 5;
    return base + photoBonus + streakBonus;
  }, [photo]);

  useEffect(() => {
    setSubmitted(searchParams.get("submitted") === "1");
  }, [searchParams]);

  useEffect(() => {
    if (!submitted) return;

    setSuccessStep(1);
    let current = 1;
    const interval = window.setInterval(() => {
      current += 1;
      setSuccessStep((prev) => Math.min(prev + 1, 4));
      if (current >= 4) {
        window.clearInterval(interval);
      }
    }, 1800);

    return () => window.clearInterval(interval);
  }, [submitted]);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  const handleLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported on this device.");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const nextCoords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setCoords(nextCoords);
        setAccuracy(position.coords.accuracy);

        try {
          const resolved = await geocodingService.reverseGeocode(nextCoords.lat, nextCoords.lng);
          setLocationInput(resolved);
        } catch {
          setLocationInput("12.9716° N, 77.5946° E · Bengaluru");
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        toast.error("Unable to read your current location.");
      },
      { enableHighAccuracy: true }
    );
  };

  const handlePhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }

    const nextUrl = URL.createObjectURL(file);
    previewUrlRef.current = nextUrl;
    setPhoto(file);
    setPreview(nextUrl);
  };

  const resolveTypedLocation = async () => {
    if (coords || locationInput.trim().length < 3) return coords;

    const results = await geocodingService.geocodeLocation(locationInput.trim());
    if (!results.length) return null;

    const first = results[0];
    const nextCoords = { lat: first.latitude, lng: first.longitude };
    setCoords(nextCoords);
    setLocationInput(first.display_name);
    return nextCoords;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const resolvedCoords = await resolveTypedLocation();
      const finalCoords = resolvedCoords ?? coords;

      if (!finalCoords) {
        toast.error("Add a location before submitting.");
        setSubmitting(false);
        return;
      }

      await reportService.uploadReport({
        lat: finalCoords.lat,
        lng: finalCoords.lng,
        type: toBackendType(hazardType),
        latitude: finalCoords.lat,
        longitude: finalCoords.lng,
        hazard: hazardType,
        severity: toReportSeverity(selectedSeverity.label),
        confidence: photo ? 98 : 90,
        description: description || `${selectedSeverity.label} ${hazardType} reported by community user.`,
        timestamp: new Date().toISOString(),
      });
      router.replace("/reports?submitted=1", { scroll: false });
      toast.success("Report submitted successfully.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to submit report.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#050505] px-6 pb-20 pt-32 text-white md:px-10">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <div className="rounded-[28px] border border-emerald-400/18 bg-emerald-500/10 p-5 text-emerald-200">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h1 className="mt-8 font-display text-5xl tracking-[-0.04em] text-white">Report submitted!</h1>
          <p className="mt-4 max-w-xl text-lg leading-8 text-white/56">
            Your hazard is being verified. It&apos;ll be live on the map soon.
          </p>

          <div className="glass-card mt-10 w-full rounded-[32px] p-8 text-left">
            <Tracker activeStep={successStep} pulseStep={Math.min(successStep + 1, 4)} />
          </div>

          <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-emerald-400/18 bg-emerald-500/10 px-5 py-3 text-emerald-200">
            <Zap className="h-4 w-4" />
            <span>+45 SafePoints earned</span>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => router.replace("/map")}
              className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-medium text-black"
            >
              View live map
            </button>
            <button
              type="button"
              onClick={() => router.replace("/reports")}
              className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm text-white/76"
            >
              Submit another report
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] px-6 pb-20 pt-32 text-white md:px-10">
      <div className="mx-auto max-w-7xl">
        <div>
          <div className="text-sm uppercase tracking-[0.28em] text-white/36">Community reporting</div>
          <h1 className="mt-4 font-display text-5xl tracking-[-0.04em] text-white">Report a hazard.</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-white/56">
            Takes 30 seconds. Every report protects thousands.
          </p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          <form onSubmit={handleSubmit} className="space-y-5 lg:col-span-2">
            <StepBlock title="Step 01 — Hazard Type">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {hazardOptions.map((option) => {
                  const active = hazardType === option.id;
                  return (
                    <motion.button
                      key={option.id}
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setHazardType(option.id)}
                      className={[
                        "rounded-2xl border px-4 py-4 text-left transition-colors",
                        active ? option.styles : "border-white/6 text-white/40 hover:text-white/72",
                      ].join(" ")}
                    >
                      <div className="text-lg">{option.emoji}</div>
                      <div className="mt-2">{option.label}</div>
                    </motion.button>
                  );
                })}
              </div>
            </StepBlock>

            <StepBlock title="Step 02 — Severity">
              <div className="flex flex-wrap gap-3">
                {severityOptions.map((option) => {
                  const active = option.level === severity;
                  return (
                    <motion.button
                      key={option.level}
                      type="button"
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSeverity(option.level)}
                      className={[
                        "flex h-14 w-14 items-center justify-center rounded-2xl border text-lg transition-colors",
                        active ? option.styles : "border-white/8 bg-white/[0.02] text-white/54",
                      ].join(" ")}
                    >
                      {option.emoji}
                    </motion.button>
                  );
                })}
              </div>
              <div className="mt-4 text-sm text-white/54">
                {selectedSeverity.label} — severity {severity}/5
              </div>
            </StepBlock>

            <StepBlock title="Step 03 — Location">
              <button
                type="button"
                onClick={handleLocation}
                className="inline-flex items-center gap-3 rounded-2xl border border-emerald-400/16 bg-emerald-500/10 px-4 py-3 text-emerald-200"
              >
                <MapPin className="h-4 w-4" />
                <span>{locating ? "Locating..." : "Use current location"}</span>
              </button>
              {coords ? (
                <div className="mt-4 rounded-2xl border border-white/8 bg-black/16 px-4 py-3 text-sm text-white/60">
                  <div>
                    {coords.lat.toFixed(4)}° N, {coords.lng.toFixed(4)}° E · Bengaluru
                  </div>
                  <div className="mt-1 text-white/36">
                    GPS accuracy: ±{accuracy ? Math.round(accuracy) : 4}m
                  </div>
                </div>
              ) : null}
              <input
                value={locationInput}
                onChange={(event) => setLocationInput(event.target.value)}
                placeholder="Or type address / landmark..."
                className="mt-4 w-full rounded-2xl border border-white/8 bg-black/16 px-4 py-3 text-white outline-none transition-colors placeholder:text-white/26 focus:border-emerald-400/28"
              />
            </StepBlock>

            <StepBlock title="Step 04 — Description">
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe the hazard — depth, size, visibility..."
                rows={5}
                className="w-full rounded-2xl border border-white/8 bg-black/16 px-4 py-3 text-white outline-none transition-colors placeholder:text-white/26 focus:border-emerald-400/28"
              />
            </StepBlock>

            <StepBlock title="Step 05 — Photo Evidence">
              <label className="block cursor-pointer rounded-[24px] border border-dashed border-white/10 bg-black/16 p-8 text-center transition-colors hover:border-emerald-400/24">
                <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
                {preview ? (
                  <div className="relative overflow-hidden rounded-[20px]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preview} alt="Hazard preview" className="h-64 w-full object-cover opacity-70" />
                    <div className="absolute left-4 top-4 rounded-full border border-sky-400/20 bg-sky-500/12 px-3 py-1 text-xs text-sky-200">
                      ✓ AI will auto-classify severity
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="mx-auto h-8 w-8 text-emerald-300" />
                    <div className="mt-4 text-white">Upload a clear image of the hazard</div>
                    <div className="mt-2 text-sm text-white/42">Drag or click to add photo evidence</div>
                  </>
                )}
              </label>
            </StepBlock>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-3 rounded-[24px] bg-emerald-500 px-6 py-4 font-medium text-black disabled:opacity-70"
            >
              <Shield className="h-4 w-4" />
              <span>{submitting ? "Submitting..." : `Complete Report · Earn +${points} SafePoints`}</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </form>

          <div className="space-y-5">
            <div className="glass-card rounded-[30px] p-6">
              <div className="text-sm uppercase tracking-[0.28em] text-white/36">Your reward</div>
              <div className="mt-4 font-mono text-6xl text-white">+{points}</div>
              <div className="mt-2 text-white/46">SafePoints for this report</div>
              <div className="mt-6 space-y-3 text-sm text-white/58">
                {photo ? (
                  <div className="flex items-center justify-between">
                    <span>📸 Photo bonus</span>
                    <span className="font-mono text-emerald-200">+10 pts</span>
                  </div>
                ) : null}
                <div className="flex items-center justify-between">
                  <span>⚠️ Severity ×1.5</span>
                  <span className="text-amber-200">multiplier</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>🔥 3-day streak</span>
                  <span className="font-mono text-amber-200">+5 bonus</span>
                </div>
              </div>
              <div className="mt-6">
                <div className="mb-2 text-sm text-white/44">320 / 1000 pts to Reporter badge 🏅</div>
                <div className="h-2.5 rounded-full bg-white/8">
                  <div className="h-2.5 w-[32%] rounded-full bg-emerald-400" />
                </div>
              </div>
            </div>

            <div className="glass-card rounded-[30px] p-6">
              <div className="flex items-center gap-3">
                <Trophy className="h-5 w-5 text-amber-300" />
                <h2 className="font-display text-3xl tracking-tight text-white">Leaderboard</h2>
              </div>
              <div className="mt-6 space-y-3">
                {leaderboard.map((entry) => {
                  const isYou = entry.rank === 47;
                  return (
                    <div
                      key={entry.rank}
                      className={[
                        "flex items-center gap-3 rounded-2xl border px-4 py-3",
                        isYou
                          ? "border-emerald-400/18 bg-emerald-500/10"
                          : "border-white/8 bg-black/16",
                      ].join(" ")}
                    >
                      <div className="w-8 text-sm font-mono text-white/54">{entry.rank}</div>
                      <div className="flex-1">
                        <div className="text-white">
                          {entry.name} <span className="ml-1">{entry.badge}</span>
                        </div>
                        <div className="text-sm text-white/38">🔥 {entry.streak} day streak</div>
                      </div>
                      <div className="font-mono text-white">{entry.points}</div>
                    </div>
                  );
                })}
              </div>
              <button className="mt-5 inline-flex items-center gap-2 text-sm text-emerald-200">
                <span>View full leaderboard</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="glass-card rounded-[30px] p-6">
              <div className="text-sm uppercase tracking-[0.28em] text-white/36">How your report travels</div>
              <div className="mt-6">
                <Tracker activeStep={2} pulseStep={2} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
