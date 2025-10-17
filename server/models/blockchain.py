import requests
from web3 import Web3

ETHERSCAN_API_KEY = 'your-etherscan-api-key'  # Get it from https://etherscan.io/apis

# Interact with Etherscan to get wallet transactions
def get_wallet_transactions(address):
    url = f"https://api.etherscan.io/api?module=account&action=txlist&address={address}&apikey={ETHERSCAN_API_KEY}"
    response = requests.get(url)
    transactions = response.json()

    if transactions['status'] == '1':
        return transactions['result']
    return None
