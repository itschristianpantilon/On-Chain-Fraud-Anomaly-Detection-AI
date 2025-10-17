from flask import Flask, jsonify, request
from flask_cors import CORS
from services.blockchain import get_wallet_transactions
from services.report import flag_wallet
from utils.ai_model import analyze_wallet

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests (for frontend)

# Home route for testing
@app.route('/')
def home():
    return jsonify({"message": "Welcome to the Phishing Wallet Detection API"})

# Route for checking wallet
@app.route('/check_wallet', methods=['POST'])
def check_wallet():
    data = request.json
    wallet_address = data.get('address')

    if not wallet_address:
        return jsonify({"error": "No wallet address provided"}), 400

    # Step 1: Fetch transaction history from Etherscan or BaseScan
    transactions = get_wallet_transactions(wallet_address)
    if not transactions:
        return jsonify({"error": "Unable to fetch transactions"}), 500

    # Step 2: Analyze the wallet address using AI
    risk_score, reason = analyze_wallet(transactions)

    # Step 3: Flag the wallet on the blockchain if suspicious (using smart contract on Base)
    if risk_score > 50:  # Set a threshold for suspicious wallets
        flag_wallet(wallet_address, risk_score)

    return jsonify({
        "wallet": wallet_address,
        "risk_score": risk_score,
        "reason": reason,
        "status": "suspicious" if risk_score > 50 else "safe"
    })

if __name__ == "__main__":
    app.run(debug=True)
