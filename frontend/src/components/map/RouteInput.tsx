/*
OWNER: Sushanth
MODULE: Safe Route Input Panel
*/

"use client";

import { useMemo, useState } from "react";


type CoordinateFormState = {
	sourceLatitude: string;
	sourceLongitude: string;
	destinationLatitude: string;
	destinationLongitude: string;
};

type FieldErrors = Partial<Record<keyof CoordinateFormState, string>>;

const initialState: CoordinateFormState = {
	sourceLatitude: "",
	sourceLongitude: "",
	destinationLatitude: "",
	destinationLongitude: "",
};

const isValidCoordinate = (value: number, min: number, max: number) =>
	Number.isFinite(value) && value >= min && value <= max;

type Props = {
  loading: boolean;
  error: string | null;
  fetchSafeRoute: (
    source: [number, number],
    destination: [number, number]
  ) => Promise<any>;
};
export default function RouteInput({
  loading,
  error,
  fetchSafeRoute,
}: Props){
	
	const [formState, setFormState] = useState<CoordinateFormState>(initialState);
	const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
	const [localError, setLocalError] = useState<string | null>(null);
	const [submitted, setSubmitted] = useState(false);

	const displayError = localError ?? error;

	const canSubmit = useMemo(() => {
		return Object.values(formState).every((value) => value.trim().length > 0);
	}, [formState]);

	const updateField = (field: keyof CoordinateFormState, value: string) => {
		setFormState((current) => ({
			...current,
			[field]: value,
		}));

		setFieldErrors((current) => ({
			...current,
			[field]: undefined,
		}));

		setLocalError(null);
	};

	const validateForm = () => {
		const nextErrors: FieldErrors = {};

		const sourceLatitude = Number(formState.sourceLatitude);
		const sourceLongitude = Number(formState.sourceLongitude);
		const destinationLatitude = Number(formState.destinationLatitude);
		const destinationLongitude = Number(formState.destinationLongitude);

		if (!Number.isFinite(sourceLatitude) || !isValidCoordinate(sourceLatitude, -90, 90)) {
			nextErrors.sourceLatitude = "Enter a valid latitude between -90 and 90.";
		}

		if (!Number.isFinite(sourceLongitude) || !isValidCoordinate(sourceLongitude, -180, 180)) {
			nextErrors.sourceLongitude = "Enter a valid longitude between -180 and 180.";
		}

		if (!Number.isFinite(destinationLatitude) || !isValidCoordinate(destinationLatitude, -90, 90)) {
			nextErrors.destinationLatitude = "Enter a valid latitude between -90 and 90.";
		}

		if (!Number.isFinite(destinationLongitude) || !isValidCoordinate(destinationLongitude, -180, 180)) {
			nextErrors.destinationLongitude = "Enter a valid longitude between -180 and 180.";
		}

		setFieldErrors(nextErrors);

		if (Object.keys(nextErrors).length > 0) {
			setLocalError("Please fix the highlighted coordinates.");
			return null;
		}

		return {
			source: [sourceLatitude, sourceLongitude] as [number, number],
			destination: [destinationLatitude, destinationLongitude] as [number, number],
		};
	};

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const validated = validateForm();
		if (!validated) return;

		setSubmitted(false);
		const result = await fetchSafeRoute(validated.source, validated.destination);
		if (result) {
			setSubmitted(true);
		}
	};

	const inputBaseClass =
		"w-full rounded-md border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20";
	const labelClass = "text-xs font-medium uppercase tracking-wide text-slate-600";
	const helperClass = "mt-1 text-xs text-red-600";

	return (
		<div
            style={{
                position: "fixed",
                top: "20px",
                right: "20px",
                zIndex: 9999,
                width: "380px",
                }}
            >
			<form
                onSubmit={handleSubmit}
                style={{
                    background: "#0f172a",
                    color: "white",
                    padding: "20px",
                    borderRadius: "16px",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                }}
            >
				<div className="mb-4">
					<h2 className="text-base font-semibold sm:text-lg">Safe Route</h2>
					<p className="mt-1 text-xs text-slate-300 sm:text-sm">
						Enter source and destination coordinates to find the safest route.
					</p>
				</div>

				<div className="space-y-3">
					<div>
						<label className={labelClass} htmlFor="sourceLatitude">
							Source Latitude
						</label>
						<input
							id="sourceLatitude"
							name="sourceLatitude"
							type="number"
							step="any"
							inputMode="decimal"
							value={formState.sourceLatitude}
							onChange={(event) => updateField("sourceLatitude", event.target.value)}
							className={inputBaseClass}
							placeholder="12.9716"
						/>
						{fieldErrors.sourceLatitude ? (
							<p className={helperClass}>{fieldErrors.sourceLatitude}</p>
						) : null}
					</div>

					<div>
						<label className={labelClass} htmlFor="sourceLongitude">
							Source Longitude
						</label>
						<input
							id="sourceLongitude"
							name="sourceLongitude"
							type="number"
							step="any"
							inputMode="decimal"
							value={formState.sourceLongitude}
							onChange={(event) => updateField("sourceLongitude", event.target.value)}
							className={inputBaseClass}
							placeholder="77.5946"
						/>
						{fieldErrors.sourceLongitude ? (
							<p className={helperClass}>{fieldErrors.sourceLongitude}</p>
						) : null}
					</div>

					<div>
						<label className={labelClass} htmlFor="destinationLatitude">
							Destination Latitude
						</label>
						<input
							id="destinationLatitude"
							name="destinationLatitude"
							type="number"
							step="any"
							inputMode="decimal"
							value={formState.destinationLatitude}
							onChange={(event) => updateField("destinationLatitude", event.target.value)}
							className={inputBaseClass}
							placeholder="12.9352"
						/>
						{fieldErrors.destinationLatitude ? (
							<p className={helperClass}>{fieldErrors.destinationLatitude}</p>
						) : null}
					</div>

					<div>
						<label className={labelClass} htmlFor="destinationLongitude">
							Destination Longitude
						</label>
						<input
							id="destinationLongitude"
							name="destinationLongitude"
							type="number"
							step="any"
							inputMode="decimal"
							value={formState.destinationLongitude}
							onChange={(event) => updateField("destinationLongitude", event.target.value)}
							className={inputBaseClass}
							placeholder="77.6245"
						/>
						{fieldErrors.destinationLongitude ? (
							<p className={helperClass}>{fieldErrors.destinationLongitude}</p>
						) : null}
					</div>
				</div>

				{displayError ? (
					<p className="mt-4 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
						{displayError}
					</p>
				) : null}

				{submitted && !error && !localError ? (
					<p className="mt-4 rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
						Safe route fetched successfully.
					</p>
				) : null}

				<button
					type="submit"
					disabled={loading || !canSubmit}
					className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
				>
					{loading ? "Finding Route..." : "Find Safe Route"}
				</button>
			</form>
		</div>
	);
}

