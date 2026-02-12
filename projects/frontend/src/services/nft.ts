/**
 * NFT Service
 * Handles minting certificate NFTs on Algorand using the existing template pattern.
 */

import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { getAlgodConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'
import { pinJSONToIPFS, ipfsHttpUrl } from '../utils/pinata'

export interface CertificateNFTData {
    recipientName: string
    recipientAddress: string
    skill: string
    skillLevel: string
    aiScore: number
    evidenceHash: string
    issuer: string
    issueDate: string
    certId: string
}

/**
 * Mint a certificate as an ARC-19 NFT on Algorand
 * Follows the same pattern as the existing MintNFT.tsx template component
 */
export async function mintCertificateNFT(
    data: CertificateNFTData,
    senderAddress: string,
    transactionSigner: any,
): Promise<{ assetId: bigint; txId: string }> {
    // 1) Build ARC-19 metadata
    const metadata = {
        standard: 'arc19',
        name: `CertifyMe: ${data.skill} - ${data.skillLevel}`,
        description: `AI-Verified ${data.skill} certificate at ${data.skillLevel} level. Score: ${data.aiScore}/100`,
        properties: {
            recipient: data.recipientAddress,
            recipient_name: data.recipientName,
            skill: data.skill,
            skill_level: data.skillLevel,
            ai_score: data.aiScore,
            evidence_hash: data.evidenceHash,
            issuer: data.issuer,
            issue_date: data.issueDate,
            cert_id: data.certId,
            platform: 'CertifyMe',
        },
    }

    // 2) Upload metadata to IPFS
    const jsonPin = await pinJSONToIPFS(metadata)
    const metadataUrl = `${ipfsHttpUrl(jsonPin.IpfsHash)}#arc3`

    // 3) Build metadata hash (SHA-256)
    const metaBytes = new TextEncoder().encode(JSON.stringify(metadata))
    const digest = await crypto.subtle.digest('SHA-256', metaBytes)
    const hashArray = Array.from(new Uint8Array(digest))
    const metadataHash = new Uint8Array(hashArray.map((b) => b))

    // 4) Create Algorand client
    const algodConfig = getAlgodConfigFromViteEnvironment()
    const algorand = AlgorandClient.fromConfig({ algodConfig })
    algorand.setDefaultSigner(transactionSigner)

    // 5) Create ASA (unique certificate NFT)
    const assetName = `CM-${data.skill.substring(0, 20)}`
    const unitName = 'CERTME'

    const result = await algorand.send.assetCreate({
        sender: senderAddress,
        total: 1n, // Single NFT
        decimals: 0,
        unitName,
        assetName,
        manager: senderAddress,
        reserve: senderAddress,
        freeze: senderAddress,
        clawback: senderAddress,
        url: metadataUrl,
        metadataHash,
        defaultFrozen: false,
    })

    return {
        assetId: result.assetId,
        txId: result.transaction.txID(),
    }
}
