"use client";

import { useEffect, useState } from "react";

interface ResultData {
  application: {
    id: string;
    status: string;
    treatmentType: string;
    treatmentCost: number;
    offerMonthly: number | null;
    offerTerm: number | null;
    approvalChance: number | null;
    lender: { name: string } | null;
    patient: { name: string };
  };
  offer: {
    lenderName: string;
    monthlyPayment: number;
    term: number;
    approvalChance: number;
  } | null;
  result: {
    newDBR: number;
  };
}

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

  const { application, offer } = data;
  const isApproved = application.status === "prequalified" && offer;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Application Result</h1>
        </div>

        {isApproved ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-green-600 p-6 text-center text-white">
              <div className="text-lg font-medium mb-1">Congratulations, {application.patient.name}!</div>
              <div className="text-3xl font-bold">Pre-Qualified</div>
            </div>

            <div className="p-6 space-y-6">
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-1">Financing Partner</div>
                <div className="text-xl font-semibold text-gray-900">
                  {offer.lenderName}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-500">Monthly</div>
                  <div className="text-xl font-bold text-gray-900">
                    {offer.monthlyPayment.toLocaleString()} <span className="text-sm font-normal">AED</span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-500">Term</div>
                  <div className="text-xl font-bold text-gray-900">
                    {offer.term} <span className="text-sm font-normal">mo</span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-500">Approval</div>
                  <div className="text-xl font-bold text-gray-900">
                    {Math.round(offer.approvalChance * 100)}%
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Treatment</span>
                  <span>{application.treatmentType}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Total Cost</span>
                  <span>{application.treatmentCost.toLocaleString()} AED</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Debt-to-Income Ratio</span>
                  <span>{(data.result.newDBR * 100).toFixed(1)}%</span>
                </div>
              </div>

              <p className="text-xs text-gray-400 text-center">
                This is a pre-qualification estimate. Final approval is subject to lender review.
                Application ID: {application.id}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-red-600 p-6 text-center text-white">
              <div className="text-lg font-medium mb-1">Sorry, {application.patient.name}</div>
              <div className="text-3xl font-bold">Not Eligible</div>
            </div>

            <div className="p-6 text-center">
              <p className="text-gray-600 mb-4">
                Based on your current financial profile, we were unable to match you
                with a financing partner at this time.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="text-sm text-gray-500">Your Debt-to-Income Ratio</div>
                <div className="text-2xl font-bold text-gray-900">
                  {(data.result.newDBR * 100).toFixed(1)}%
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Consider reducing existing debt obligations or applying for a lower treatment cost.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
