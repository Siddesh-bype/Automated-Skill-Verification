/**
 * Algorand Contract Interaction Service
 * Calls the deployed CertifyMe smart contract methods.
 * Provides read-only operations for certificate verification.
 */

const algosdk = require('algosdk');

const ALGOD_SERVER = process.env.ALGOD_SERVER || 'https://testnet-api.algonode.cloud';
const ALGOD_TOKEN = process.env.ALGOD_TOKEN || '';
const INDEXER_SERVER = process.env.INDEXER_SERVER || 'https://testnet-idx.algonode.cloud';
const INDEXER_TOKEN = process.env.INDEXER_TOKEN || '';
const APP_ID = parseInt(process.env.ALGORAND_APP_ID || '0');

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
        const result = await algod.getApplicationByID(appId || APP_ID).do();
        return result;
    } catch (error) {
        console.error(`Error fetching app ${appId || APP_ID}:`, error.message);
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

/**
 * Get the deployed contract global state (parsed)
 */
async function getContractGlobalState() {
    const currentAppId = APP_ID;
    if (!currentAppId) return null;

    try {
        const algod = getAlgodClient();
        const appInfo = await algod.getApplicationByID(currentAppId).do();

        const globalState = {};
        if (appInfo.params && appInfo.params['global-state']) {
            for (const item of appInfo.params['global-state']) {
                const key = Buffer.from(item.key, 'base64').toString();
                const value = item.value.uint !== undefined
                    ? item.value.uint
                    : Buffer.from(item.value.bytes || '', 'base64').toString();
                globalState[key] = value;
            }
        }

        return {
            app_id: currentAppId,
            state: globalState,
            certificate_count: globalState.certificate_count || 0,
            admin: globalState.admin || 'unknown',
            min_ai_score: globalState.min_ai_score || 45,
        };

    } catch (error) {
        console.error('Error reading contract state:', error.message);
        return null;
    }
}

/**
 * Verify a certificate exists in box storage (read-only)
 */
async function verifyCertificateOnChain(certId) {
    const currentAppId = APP_ID;
    if (!currentAppId) {
        return { exists: false, verified: false, reason: 'No APP_ID configured' };
    }

    try {
        const algod = getAlgodClient();

        // Build box name from cert ID
        const boxName = new Uint8Array(Buffer.from(`cert_${certId}`));
        const boxValue = await algod.getApplicationBoxByName(currentAppId, boxName).do();

        if (boxValue) {
            return {
                exists: true,
                verified: true,
                data: boxValue.value,
                app_id: currentAppId,
            };
        }

        return { exists: false, verified: false };

    } catch (error) {
        // Box not found means certificate doesn't exist on-chain
        return {
            exists: false,
            verified: false,
            error: error.message,
        };
    }
}

/**
 * Get contract deployment info
 */
function getDeploymentInfo() {
    return {
        app_id: APP_ID,
        algod_server: ALGOD_SERVER,
        indexer_server: INDEXER_SERVER,
        is_configured: APP_ID > 0,
        explorer_url: APP_ID > 0
            ? `https://testnet.algoexplorer.io/application/${APP_ID}`
            : null,
    };
}

module.exports = {
    getAlgodClient,
    getIndexerClient,
    getAssetInfo,
    getAppState,
    verifyTransaction,
    getContractGlobalState,
    verifyCertificateOnChain,
    getDeploymentInfo,
};
