"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

interface FormData {
  name: string;
  phone: string;
  email: string;
  emiratesId: string;
  nationality: string;
  visaType: string;
  yearsInUAE: string;
  employer: string;
  salaryMonthly: string;
  mortgageMonthly: string;
  carLoanMonthly: string;
  otherDebtMonthly: string;
  treatmentType: string;
  treatmentCost: string;
}

const INITIAL_FORM: FormData = {
  name: "",
  phone: "",
  email: "",
  emiratesId: "",
  nationality: "",
  visaType: "employed",
  yearsInUAE: "",
  employer: "",
  salaryMonthly: "",
  mortgageMonthly: "0",
  carLoanMonthly: "0",
  otherDebtMonthly: "0",
  treatmentType: "",
  treatmentCost: "",
};

const TREATMENT_TYPES = [
  "Dental Implants",
  "Orthodontics",
  "Cosmetic Surgery",
  "LASIK / Eye Surgery",
  "IVF / Fertility",
  "Orthopedic Surgery",
  "Cardiac Procedure",
  "General Surgery",
  "Other",
];

const VISA_TYPES = [
  { value: "employed", label: "Employment Visa" },
  { value: "investor", label: "Investor Visa" },
  { value: "golden", label: "Golden Visa" },
  { value: "self-employed", label: "Self-Employed / Freelance" },
  { value: "dependent", label: "Dependent Visa" },
];

function ApplyForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const clinicId = searchParams.get("clinic") || "";

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!clinicId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <h1 className="text-xl font-bold text-red-600 mb-2">Invalid Link</h1>
          <p className="text-gray-600">
            This application link is missing a clinic ID. Please contact your clinic for a valid link.
          </p>
        </div>
      </div>
    );
  }

  const update = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const next = () => setStep((s) => Math.min(s + 1, 4));
  const prev = () => setStep((s) => Math.max(s - 1, 1));

  const submit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, clinicId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Submission failed");
      }

      const data = await res.json();
      sessionStorage.setItem("applicationResult", JSON.stringify(data));
      router.push("/apply/result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Healthcare Financing Application</h1>
          <p className="text-gray-500 mt-1">Step {step} of 4</p>
          <div className="flex gap-2 mt-4 justify-center">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-2 w-16 rounded-full ${
                  s <= step ? "bg-blue-600" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
              <div>
                <label className={labelClass}>Full Name *</label>
                <input
                  className={inputClass}
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className={labelClass}>Phone *</label>
                <input
                  className={inputClass}
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="+971 50 123 4567"
                />
              </div>
              <div>
                <label className={labelClass}>Email *</label>
                <input
                  className={inputClass}
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className={labelClass}>Emirates ID *</label>
                <input
                  className={inputClass}
                  value={form.emiratesId}
                  onChange={(e) => update("emiratesId", e.target.value)}
                  placeholder="784-XXXX-XXXXXXX-X"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold mb-4">Employment Details</h2>
              <div>
                <label className={labelClass}>Nationality *</label>
                <input
                  className={inputClass}
                  value={form.nationality}
                  onChange={(e) => update("nationality", e.target.value)}
                  placeholder="e.g., UAE, Indian, Filipino"
                />
              </div>
              <div>
                <label className={labelClass}>Visa Type *</label>
                <select
                  className={inputClass}
                  value={form.visaType}
                  onChange={(e) => update("visaType", e.target.value)}
                >
                  {VISA_TYPES.map((v) => (
                    <option key={v.value} value={v.value}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Years in UAE *</label>
                <input
                  className={inputClass}
                  type="number"
                  value={form.yearsInUAE}
                  onChange={(e) => update("yearsInUAE", e.target.value)}
                  placeholder="e.g., 5"
                />
              </div>
              <div>
                <label className={labelClass}>Employer *</label>
                <input
                  className={inputClass}
                  value={form.employer}
                  onChange={(e) => update("employer", e.target.value)}
                  placeholder="Company name"
                />
              </div>
              <div>
                <label className={labelClass}>Monthly Salary (AED) *</label>
                <input
                  className={inputClass}
                  type="number"
                  value={form.salaryMonthly}
                  onChange={(e) => update("salaryMonthly", e.target.value)}
                  placeholder="e.g., 15000"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold mb-4">Existing Obligations</h2>
              <p className="text-sm text-gray-500 mb-4">
                Enter your current monthly payments. Put 0 if none.
              </p>
              <div>
                <label className={labelClass}>Mortgage / Rent Payment (AED)</label>
                <input
                  className={inputClass}
                  type="number"
                  value={form.mortgageMonthly}
                  onChange={(e) => update("mortgageMonthly", e.target.value)}
                  placeholder="0"
                />
              </div>
              <div>
                <label className={labelClass}>Car Loan Payment (AED)</label>
                <input
                  className={inputClass}
                  type="number"
                  value={form.carLoanMonthly}
                  onChange={(e) => update("carLoanMonthly", e.target.value)}
                  placeholder="0"
                />
              </div>
              <div>
                <label className={labelClass}>Other Debt Payments (AED)</label>
                <input
                  className={inputClass}
                  type="number"
                  value={form.otherDebtMonthly}
                  onChange={(e) => update("otherDebtMonthly", e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold mb-4">Treatment Details</h2>
              <div>
                <label className={labelClass}>Treatment Type *</label>
                <select
                  className={inputClass}
                  value={form.treatmentType}
                  onChange={(e) => update("treatmentType", e.target.value)}
                >
                  <option value="">Select treatment type</option>
                  {TREATMENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Treatment Cost (AED) *</label>
                <input
                  className={inputClass}
                  type="number"
                  value={form.treatmentCost}
                  onChange={(e) => update("treatmentCost", e.target.value)}
                  placeholder="e.g., 30000"
                />
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="mt-6 flex justify-between">
            {step > 1 ? (
              <button
                onClick={prev}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                onClick={next}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Next
              </button>
            ) : (
              <button
                onClick={submit}
                disabled={submitting}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Application"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ApplyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      }
    >
      <ApplyForm />
    </Suspense>
  );
}
