/**
 * Algorand Service (Client-side)
 * Helpers for reading certificate ASAs from the blockchain.
 */

import algosdk from 'algosdk'

export function getAlgodClient(): algosdk.Algodv2 {
    const server = import.meta.env.VITE_ALGOD_SERVER || 'https://testnet-api.algonode.cloud'
    const token = import.meta.env.VITE_ALGOD_TOKEN || ''
    const port = import.meta.env.VITE_ALGOD_PORT || ''
    return new algosdk.Algodv2(token, server, port)
}

export function getIndexerClient(): algosdk.Indexer {
    const server = import.meta.env.VITE_INDEXER_SERVER || 'https://testnet-idx.algonode.cloud'
    const token = import.meta.env.VITE_INDEXER_TOKEN || ''
    const port = import.meta.env.VITE_INDEXER_PORT || ''
    return new algosdk.Indexer(token, server, port)
}

/**
 * Look up an asset by ID using the indexer
 */
export async function lookupAsset(assetId: number) {
    const indexer = getIndexerClient()
    try {
        const result = await indexer.lookupAssetByID(assetId).do()
        return result.asset
    } catch {
        return null
    }
}

/**
 * Look up all assets created by a specific address
 */
export async function getCreatedAssets(address: string) {
    const indexer = getIndexerClient()
    try {
        const result = await indexer.lookupAccountCreatedAssets(address).do()
        return result.assets || []
    } catch {
        return []
    }
}

/**
 * Look up a transaction by ID
 */
export async function lookupTransaction(txId: string) {
    const indexer = getIndexerClient()
    try {
        const result = await indexer.lookupTransactionByID(txId).do()
        return result.transaction
    } catch {
        return null
    }
}
