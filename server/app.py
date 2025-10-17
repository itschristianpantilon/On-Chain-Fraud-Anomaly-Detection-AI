# app.py
from flask import Flask, request, jsonify
import torch
import torch.nn.functional as F
from torch_geometric.data import Data
import pandas as pd
import numpy as np
import joblib

from torch_geometric.nn import GCNConv, BatchNorm
import torch.nn as nn

app = Flask(__name__)

# ---------------------------
# 1️⃣ Load your preprocessor & model
# ---------------------------
preprocessor = joblib.load("model/preprocessor.pkl")

# Identify numeric & categorical columns from preprocessor
numeric_cols = preprocessor.transformers_[0][2]
categorical_cols = preprocessor.transformers_[1][2]

# ---------------------------
# 2️⃣ Define GCN Model
# ---------------------------
class GCN_FineTuned(nn.Module):
    def __init__(self, in_channels, hidden_channels, out_channels, dropout=0.4):
        super(GCN_FineTuned, self).__init__()
        self.conv1 = GCNConv(in_channels, hidden_channels)
        self.bn1 = BatchNorm(hidden_channels)
        self.conv2 = GCNConv(hidden_channels, hidden_channels // 2)
        self.bn2 = BatchNorm(hidden_channels // 2)
        self.conv3 = GCNConv(hidden_channels // 2, out_channels)
        self.dropout = dropout

    def forward(self, data):
        x, edge_index = data.x, data.edge_index
        x = F.relu(self.bn1(self.conv1(x, edge_index)))
        x = F.dropout(x, p=self.dropout, training=self.training)
        x = F.relu(self.bn2(self.conv2(x, edge_index)))
        x = F.dropout(x, p=self.dropout, training=self.training)
        x = self.conv3(x, edge_index)
        return x

# ---------------------------
# 3️⃣ Prepare dummy DataFrame for in_channels calculation
# ---------------------------
dummy_dict = {col: 0.0 for col in numeric_cols}
dummy_dict.update({col: "unknown" for col in categorical_cols})
dummy_df = pd.DataFrame([dummy_dict])

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
in_channels = preprocessor.transform(dummy_df).shape[1]

# Load model
model = GCN_FineTuned(in_channels=in_channels, hidden_channels=256, out_channels=2).to(device)
model_path = "model/best_gnn_model.pth"
model.load_state_dict(torch.load(model_path, map_location=device))
model.eval()

# ---------------------------
# 4️⃣ Helper function to predict a single wallet
# ---------------------------
def predict_wallet(wallet_dict):
    # Ensure all columns exist and correct types
    X_new_dict = {}
    for col in numeric_cols:
        X_new_dict[col] = wallet_dict.get(col, 0.0)
    for col in categorical_cols:
        X_new_dict[col] = wallet_dict.get(col, "unknown")

    X_new_df = pd.DataFrame([X_new_dict])

    # Transform features
    X_new_processed = preprocessor.transform(X_new_df)
    X_new_tensor = torch.tensor(X_new_processed.toarray(), dtype=torch.float).to(device)

    # Single-node Data object
    edge_index = torch.tensor([[], []], dtype=torch.long).to(device)
    data_new = Data(x=X_new_tensor, edge_index=edge_index).to(device)

    # Inference
    with torch.no_grad():
        out_new = model(data_new)
        pred_class = out_new.argmax(dim=1).item()
        prob = F.softmax(out_new, dim=1).cpu().numpy()[0]

    # Risk level
    prob_fraud = prob[1]
    if prob_fraud < 0.3:
        risk = "Low"
    elif prob_fraud < 0.7:
        risk = "Medium"
    else:
        risk = "High"

    return {
        "pred_class": pred_class,
        "probabilities": prob.tolist(),
        "risk_level": risk
    }

# ---------------------------
# 5️⃣ Flask route
# ---------------------------
@app.route("/predict_wallet", methods=["POST"])
def predict_wallet_api():
    data = request.get_json()
    if not data or "wallet" not in data:
        return jsonify({"error": "Missing 'wallet' key in JSON"}), 400

    wallet_features = data["wallet"]
    try:
        result = predict_wallet(wallet_features)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ---------------------------
# 6️⃣ Run Flask app
# ---------------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
