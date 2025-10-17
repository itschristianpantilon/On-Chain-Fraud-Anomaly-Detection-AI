import React, { useState } from "react";

export default function WalletPredict() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function fetchWalletFeatures(address) {
    // Mocking feature fetch, replace with your actual logic
    return {
      numeric_feature1: 0.1,
      numeric_feature2: 0.5,
      numeric_feature3: 1.2,
      categorical_feature1: "cat1",
      categorical_feature2: "cat2",
    };
  }

  async function handleCheck() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const features = await fetchWalletFeatures(address);

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

  // Helper to color-code risk
  const riskColor = (level) => {
    if (level === "High") return "bg-red-500";
    if (level === "Medium") return "bg-yellow-400";
    return "bg-green-500";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#0f2027] via-[#203a43] to-[#2c5364] p-6">
      <div className="w-full max-w-md p-6 bg-[rgba(255,255,255,0.05)] backdrop-blur-lg border border-[#00fff7] rounded-2xl shadow-glow">
        <h2 className="text-3xl font-bold mb-6 text-[#00fff7] text-center tracking-wide">
          Wallet Risk Checker
        </h2>

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
          <div className="mt-6 p-6 bg-[rgba(255,255,255,0.1)] border border-[#00fff7] rounded-xl shadow-neon">
            <h3 className="text-xl font-semibold mb-3 text-[#00fff7]">Prediction Result</h3>

            {/* Risk Level Badge */}
            <div className="mb-4">
              <span className={`px-4 py-2 rounded-full text-black font-bold ${riskColor(result.risk_level)}`}>
                Risk: {result.risk_level}
              </span>
            </div>

            {/* Probabilities */}
            <div className="space-y-3">
              <div>
                <p className="text-gray-300 mb-1">Normal: {(result.probabilities[0] * 100).toFixed(2)}%</p>
                <div className="w-full bg-gray-700 rounded-full h-4">
                  <div
                    className="h-4 rounded-full bg-green-500"
                    style={{ width: `${result.probabilities[0] * 100}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <p className="text-gray-300 mb-1">Fraud: {(result.probabilities[1] * 100).toFixed(2)}%</p>
                <div className="w-full bg-gray-700 rounded-full h-4">
                  <div
                    className="h-4 rounded-full bg-red-500"
                    style={{ width: `${result.probabilities[1] * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Predicted Class */}
            <div className="mt-4 text-gray-300">
              <strong>Predicted Class:</strong> {result.pred_class === 0 ? "Normal" : "Fraud"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
