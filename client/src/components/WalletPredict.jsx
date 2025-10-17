// WalletPredict.jsx
import React, { useState } from "react";

export default function WalletPredict() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function handleCheck() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const featResp = await fetch(`/api/extract_features?wallet=${encodeURIComponent(address)}`);
      if (!featResp.ok) throw new Error((await featResp.json()).error || featResp.statusText);
      const featJson = await featResp.json();

      const predictResp = await fetch("/api/predict_risk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ features: featJson.features }),
      });
      if (!predictResp.ok) throw new Error((await predictResp.json()).error || predictResp.statusText);
      const predictJson = await predictResp.json();
      setResult(predictJson.results[0]);
    } catch (e) {
      console.error(e);
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto mt-8 p-6 bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Check Wallet Fraud Risk</h2>

      <input
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Paste Ethereum wallet address"
        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />

      <button
        onClick={handleCheck}
        disabled={!address || loading}
        className={`mt-4 w-full p-3 text-white font-medium rounded-md transition-colors duration-200 
          ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
      >
        {loading ? "Checking…" : "Check Risk"}
      </button>

      {error && (
        <div className="mt-4 text-red-600 font-medium">
          Error: {error}
        </div>
      )}

      {result && (
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-md">
          <h3 className="font-semibold text-lg mb-2 text-gray-700">Prediction</h3>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">{JSON.stringify(result, null, 2)}</pre>

          <div className="mt-3">
            <strong className="text-gray-700">Interpretation:</strong>
            <ul className="list-disc list-inside text-gray-600 mt-1 space-y-1">
              <li>pred_class: 0 = normal, 1 = fraud</li>
              <li>probabilities: [prob_normal, prob_fraud]</li>
              <li>risk_level: Low / Medium / High (based on prob_fraud)</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
