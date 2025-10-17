def analyze_wallet(transactions):
    suspicious_patterns = ["0x12345", "0xABCDE"]  # Example patterns to detect
    risk_score = 0

    for tx in transactions:
        if tx['from'] in suspicious_patterns or tx['to'] in suspicious_patterns:
            risk_score += 25  # Increase score based on suspicious transactions

    # Risk score between 0 and 100
    if risk_score > 50:
        return risk_score, "This wallet is interacting with known suspicious wallets."
    else:
        return risk_score, "This wallet seems safe."
