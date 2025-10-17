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
      // 1) Ask backend to extract raw features for this wallet
      const featResp = await fetch(`/api/extract_features?wallet=${encodeURIComponent(address)}`);
      if (!featResp.ok) throw new Error((await featResp.json()).error || featResp.statusText);
      const featJson = await featResp.json();
      // featJson.features is a 2D list: [[f1, f2, f3, ...]]
      // 2) Send features to prediction endpoint
      const predictResp = await fetch("/api/predict_risk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ features: featJson.features })
      });
      if (!predictResp.ok) throw new Error((await predictResp.json()).error || predictResp.statusText);
      const predictJson = await predictResp.json();
      setResult(predictJson.results[0]); // single wallet -> first result
    } catch (e) {
      console.error(e);
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: "1rem auto" }}>
      <h2>Check Wallet Fraud Risk</h2>
      <input
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Paste Ethereum wallet address"
        style={{ width: "100%", padding: "8px", fontSize: 16 }}
      />
      <button onClick={handleCheck} disabled={!address || loading} style={{ marginTop: 8 }}>
        {loading ? "Checking…" : "Check Risk"}
      </button>

      {error && <div style={{ color: "red", marginTop: 12 }}>Error: {error}</div>}

      {result && (
        <div style={{ marginTop: 12 }}>
          <strong>Prediction</strong>
          <pre>{JSON.stringify(result, null, 2)}</pre>
          <div>
            <strong>Interpretation:</strong>
            <ul>
              <li>pred_class: 0=normal,1=fraud</li>
              <li>probabilities: [prob_normal, prob_fraud]</li>
              <li>risk_level: Low/Medium/High (based on prob_fraud)</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
