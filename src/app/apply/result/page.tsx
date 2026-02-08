"use client";

import { useEffect, useState } from "react";

interface LenderMatch {
  lenderId: string;
  lenderName: string;
  matchLabel: string;
  rank: number;
  monthlyPayment: number;
  term: number;
}

interface ResultData {
  application: {
    id: string;
    status: string;
    treatmentType: string;
    treatmentCost: number;
    patient: { name: string };
  };
  matches: LenderMatch[];
  result: {
    newDBR: number;
  };
}

const LABEL_STYLES: Record<string, { border: string; badge: string; text: string }> = {
  "Very strong match": {
    border: "border-green-200 bg-green-50",
    badge: "bg-green-100 text-green-800",
    text: "Most compatible with provided details",
  },
  "Strong match": {
    border: "border-blue-200 bg-blue-50",
    badge: "bg-blue-100 text-blue-800",
    text: "Compatible with provided details",
  },
  "Possible match": {
    border: "border-yellow-200 bg-yellow-50",
    badge: "bg-yellow-100 text-yellow-800",
    text: "May be compatible pending full review",
  },
  "Unlikely": {
    border: "border-gray-200 bg-gray-50",
    badge: "bg-gray-100 text-gray-600",
    text: "Low compatibility based on provided details",
  },
};

export default function ResultPage() {
  const [data, setData] = useState<ResultData | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("applicationResult");
    if (stored) {
      setData(JSON.parse(stored));
    }
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-2">No Application Found</h1>
          <p className="text-gray-600">Please submit an application first.</p>
        </div>
      </div>
    );
  }

  const { application, matches } = data;
  const hasMatches = application.status === "prequalified" && matches.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Pre-Eligibility Results
          </h1>
          <p className="text-gray-500 mt-1">
            {application.patient.name} &mdash; {application.treatmentType}
          </p>
        </div>

        {hasMatches ? (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Treatment Cost</span>
                <span className="font-medium">{application.treatmentCost.toLocaleString()} AED</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Estimated Monthly</span>
                <span className="font-medium">{matches[0].monthlyPayment.toLocaleString()} AED / {matches[0].term} months</span>
              </div>
            </div>

            {matches.map((match) => {
              const style = LABEL_STYLES[match.matchLabel] || LABEL_STYLES["Unlikely"];
              return (
                <div
                  key={match.lenderId}
                  className={`rounded-lg border-2 ${style.border} p-5`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Option {match.rank}
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${style.badge}`}>
                      {match.matchLabel}
                    </span>
                  </div>
                  <div className="text-lg font-semibold text-gray-900 mb-1">
                    {match.lenderName}
                  </div>
                  {style.text && (
                    <p className="text-sm text-gray-500">{style.text}</p>
                  )}
                </div>
              );
            })}

            <p className="text-xs text-gray-400 text-center mt-6 px-4">
              Results are indicative only. Final approval and terms are determined
              by the lender after full review.
            </p>

            <p className="text-xs text-gray-300 text-center">
              Application ID: {application.id}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-gray-700 p-6 text-center text-white">
              <div className="text-lg font-medium mb-1">{application.patient.name}</div>
              <div className="text-2xl font-bold">No Matches Found</div>
            </div>

            <div className="p-6 text-center">
              <p className="text-gray-600 mb-4">
                Based on the details provided, we were unable to identify compatible
                financing options at this time.
              </p>
              <p className="text-sm text-gray-500">
                You may consider adjusting the treatment scope or speaking with
                the clinic about alternative payment arrangements.
              </p>
            </div>

            <p className="text-xs text-gray-400 text-center pb-6 px-4">
              Results are indicative only. Final approval and terms are determined
              by the lender after full review.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
