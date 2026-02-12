/**
 * Backend Algorand Service
 * Reads certificate data from the Algorand blockchain.
 */

const algosdk = require('algosdk');

const ALGOD_SERVER = process.env.ALGOD_SERVER || 'https://testnet-api.algonode.cloud';
const ALGOD_TOKEN = process.env.ALGOD_TOKEN || '';
const INDEXER_SERVER = process.env.INDEXER_SERVER || 'https://testnet-idx.algonode.cloud';
const INDEXER_TOKEN = process.env.INDEXER_TOKEN || '';

/**
 * Get an Algod client instance
 */
function getAlgodClient() {
    return new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, '');
}

/**
 * Get an Indexer client instance
 */
function getIndexerClient() {
    return new algosdk.Indexer(INDEXER_TOKEN, INDEXER_SERVER, '');
}

/**
 * Look up an ASA (asset) by its ID on the blockchain
 */
async function getAssetInfo(assetId) {
    try {
        const indexer = getIndexerClient();
        const result = await indexer.lookupAssetByID(assetId).do();
        return result.asset;
    } catch (error) {
        console.error(`Error fetching asset ${assetId}:`, error.message);
        return null;
    }
}

/**
 * Look up an application (smart contract) state
 */
async function getAppState(appId) {
    try {
        const algod = getAlgodClient();
        const result = await algod.getApplicationByID(appId).do();
        return result;
    } catch (error) {
        console.error(`Error fetching app ${appId}:`, error.message);
        return null;
    }
}

/**
 * Verify a transaction exists on-chain
 */
async function verifyTransaction(txId) {
    try {
        const indexer = getIndexerClient();
        const result = await indexer.lookupTransactionByID(txId).do();
        return result.transaction;
    } catch (error) {
        console.error(`Error verifying tx ${txId}:`, error.message);
        return null;
    }
}

module.exports = {
    getAlgodClient,
    getIndexerClient,
    getAssetInfo,
    getAppState,
    verifyTransaction,
};
