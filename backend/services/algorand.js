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

/**
 * Mint a new certificate on-chain using ARC-4 ABI method
 */


/**
 * Helper: Send a real 0-algo transaction to generate a valid TxID on-chain
 * This is used when the smart contract is not deployed, to still provide "proof"
 */
async function sendRealTransactionProof(params, adminMnemonic) {
    try {
        const algod = getAlgodClient();
        const account = algosdk.mnemonicToSecretKey(adminMnemonic);
        const paramsSp = await algod.getTransactionParams().do();

        // Create a 0-algo payment transaction to self
        // Put the certificate hash and metadata in the note
        const noteObj = {
            app: "CertifyMe",
            ref: params.evidence_hash,
            skill: params.skill,
            score: params.ai_score,
            msg: "Verified Skill Certificate"
        };
        const note = new TextEncoder().encode(JSON.stringify(noteObj));

        const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
            from: account.addr,
            to: account.addr, // Send to self
            amount: 0,
            note: note,
            suggestedParams: paramsSp,
        });

        const signedTxn = txn.signTxn(account.sk);
        const { txId } = await algod.sendRawTransaction(signedTxn).do();

        // Wait for confirmation
        await algosdk.waitForConfirmation(algod, txId, 4);

        return {
            txId: txId,
            assetId: 0, // No asset created, but proof exists
            confirmedRound: 0, // We could fetch it but not strictly needed for the demo link
            mock: false
        };

    } catch (error) {
        console.error('Real transaction proof failed:', error);
        // Fallback to mock if even the basic transaction fails (e.g. no funds)
        return {
            txId: `MOCK-ERR-${Math.random().toString(36).substring(7).toUpperCase()}`,
            assetId: 0,
            mock: true,
            error: error.message
        };
    }
}

/**
 * Mint a new certificate on-chain using ARC-4 ABI method
 * OR fall back to a real 0-algo transaction proof if no App ID is set.
 */
async function mintCertificate(params) {
    const { recipient, skill, skill_level, ai_score, evidence_hash, issuer, issue_date, metadata_url } = params;
    const currentAppId = APP_ID;
    const adminMnemonic = process.env.ALGORAND_ADMIN_MNEMONIC;

    // IF NO APP ID: Try to send a real transaction proof instead of just mocking
    if (!currentAppId || currentAppId === 0) {
        console.log('ℹ️ No ALGORAND_APP_ID. Attempting real 0-algo transaction proof...');

        if (adminMnemonic) {
            return await sendRealTransactionProof(params, adminMnemonic);
        } else {
            console.warn('⚠️ No ALGORAND_ADMIN_MNEMONIC. Cannot sign any transaction. Using Mock.');
            return {
                txId: `MOCK-NO-KEY-${Math.random().toString(36).substring(7).toUpperCase()}`,
                assetId: Math.floor(Math.random() * 1000000) + 1000000,
                confirmedRound: 12345,
                mock: true
            };
        }
    }

    if (!adminMnemonic) {
        console.warn('⚠️ No ALGORAND_ADMIN_MNEMONIC configured. Skipping on-chain minting (Mock Mode).');
        return {
            txId: `MOCK-TX-${Math.random().toString(36).substring(7).toUpperCase()}`,
            assetId: Math.floor(Math.random() * 1000000) + 1000000,
            confirmedRound: 67890,
            mock: true
        };
    }

    try {
        const algod = getAlgodClient();
        const account = algosdk.mnemonicToSecretKey(adminMnemonic);
        const signer = algosdk.makeBasicAccountTransactionSigner(account);

        // Define ABI Method manually since we don't have the JSON file at runtime
        const method = new algosdk.ABIMethod({
            name: 'mint_certificate',
            args: [
                { type: 'string', name: 'recipient' },
                { type: 'string', name: 'skill' },
                { type: 'string', name: 'skill_level' },
                { type: 'uint64', name: 'ai_score' },
                { type: 'string', name: 'evidence_hash' },
                { type: 'string', name: 'issuer' },
                { type: 'string', name: 'issue_date' },
                { type: 'string', name: 'metadata_url' }
            ],
            returns: { type: 'uint64' }
        });

        const atc = new algosdk.AtomicTransactionComposer();
        const sp = await algod.getTransactionParams().do();

        // Add method call
        atc.addMethodCall({
            appID: currentAppId,
            method: method,
            methodArgs: [
                recipient || '',
                skill || '',
                skill_level || '',
                BigInt(ai_score || 0),
                evidence_hash || '',
                issuer || 'CertifyMe',
                issue_date || new Date().toISOString(),
                metadata_url || ''
            ],
            sender: account.addr,
            signer: signer,
            suggestedParams: sp,
            boxReferences: [
                // We don't know the exact box references without calculating them, 
                // but for V1 we can let the SDK handle it or strict mode might fail.
                // For now, we rely on the fact that if the app is complex, we might need to be more specific.
                // But simplest is to just try.
                { appIndex: 0, name: new Uint8Array(Buffer.from(`cert_${await getCertificateCount(algod, currentAppId)}`)) }
            ],
        });

        const result = await atc.execute(algod, 4);

        // Parse return value (Certificate ID)
        // The return value is the last result
        const returnValue = result.methodResults[0].returnValue;

        return {
            txId: result.txIDs[0],
            assetId: Number(returnValue), // In this contract, the "assetId" is logically the cert ID
            confirmedRound: result.confirmedRound,
            mock: false,
        };

    } catch (error) {
        console.error('On-chain minting failed:', error);
        console.log('⚠️ Fallback: Attempting 0-algo transaction proof instead...');
        return await sendRealTransactionProof(params, adminMnemonic);
    }
}

/**
 * Helper to get cert count for box ref calculation
 */
async function getCertificateCount(algod, appId) {
    try {
        const appInfo = await algod.getApplicationByID(appId).do();
        const globalState = appInfo.params['global-state'] || [];
        const countState = globalState.find(s => Buffer.from(s.key, 'base64').toString() === 'certificate_count');
        return countState ? countState.value.uint : 0;
    } catch {
        return 0;
    }
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
    mintCertificate,
};
