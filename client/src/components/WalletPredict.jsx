// WalletPredict.jsx
import React, { useState } from "react";

export default function WalletPredict() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Replace this with actual logic to fetch wallet transaction features
  async function fetchWalletFeatures(address) {
    try {
      // Example: Call a blockchain explorer API or your own backend service
      // that returns numeric/categorical features for the given wallet
      // Here we mock the response for demonstration:
      return {
        numeric_feature1: 0.1,
        numeric_feature2: 0.5,
        numeric_feature3: 1.2,
        categorical_feature1: "cat1",
        categorical_feature2: "cat2",
      };
    } catch (e) {
      console.error("Error fetching wallet features:", e);
      throw new Error("Failed to fetch wallet features");
    }
  }

  async function handleCheck() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Step 1️⃣: Fetch features from the wallet
      const features = await fetchWalletFeatures(address);

      // Step 2️⃣: Send features to Flask API
const resp = await fetch("http://localhost:8000/predict_wallet", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ wallet: features }),
});



      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || resp.statusText);
      }

      const data = await resp.json();
      setResult(data);

    } catch (e) {
      console.error(e);
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#0f2027] via-[#203a43] to-[#2c5364] p-6">
      <div className="w-full max-w-md p-6 bg-[rgba(255,255,255,0.05)] backdrop-blur-lg border border-[#00fff7] rounded-2xl shadow-glow">
        <h2 className="text-3xl font-bold mb-6 text-[#00fff7] text-center tracking-wide">Wallet Risk Checker</h2>

        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter Ethereum wallet address"
          className="w-full p-4 mb-4 bg-[rgba(255,255,255,0.1)] border border-[#00fff7] rounded-md text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00fff7]"
        />

        <button
          onClick={handleCheck}
          disabled={!address || loading}
          className={`w-full py-3 mb-4 font-bold rounded-sm transition-colors duration-300 
            ${loading ? "bg-gray-600 cursor-not-allowed" : "bg-[#00fff7] text-black hover:bg-[#00d6d6]"} shadow-neon`}
        >
          {loading ? "Checking…" : "Check Risk"}
        </button>

        {error && (
          <div className="mt-3 text-red-400 font-semibold text-center">{error}</div>
        )}

        {result && (
          <div className="mt-6 p-4 bg-[rgba(255,255,255,0.1)] border border-[#00fff7] rounded-xl shadow-neon">
            <h3 className="text-xl font-semibold mb-3 text-[#00fff7]">Prediction Result</h3>
            <pre className="bg-[rgba(0,0,0,0.3)] p-3 rounded text-sm text-white overflow-x-auto">{JSON.stringify(result, null, 2)}</pre>

            <div className="mt-4 text-gray-300">
              <strong>Interpretation:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>pred_class: 0 = normal, 1 = fraud</li>
                <li>probabilities: [prob_normal, prob_fraud]</li>
                <li>risk_level: Low / Medium / High (based on prob_fraud)</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
