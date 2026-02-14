/**
 * Multi-chain Configuration Service
 * Provides chain metadata for Algorand (real), Ethereum & Polygon (simulated).
 */

const CHAINS = {
    algorand: {
        name: 'Algorand',
        symbol: 'ALGO',
        color: '#00ADB5',
        icon: '🟢',
        explorer: 'https://testnet.algoexplorer.io/tx/',
        isReal: true,
        description: 'Real blockchain — certificates minted on Algorand TestNet',
    },
    ethereum: {
        name: 'Ethereum',
        symbol: 'ETH',
        color: '#627EEA',
        icon: '🔷',
        explorer: 'https://goerli.etherscan.io/tx/',
        isReal: false,
        description: 'Simulated — certificate hash recorded, no on-chain deployment',
    },
    polygon: {
        name: 'Polygon',
        symbol: 'MATIC',
        color: '#8247E5',
        icon: '🟣',
        explorer: 'https://mumbai.polygonscan.com/tx/',
        isReal: false,
        description: 'Simulated — certificate hash recorded, no on-chain deployment',
    },
};

function getChainInfo(chainName) {
    return CHAINS[chainName] || CHAINS.algorand;
}

function getSupportedChains() {
    return Object.entries(CHAINS).map(([key, val]) => ({
        id: key,
        ...val,
    }));
}

function getExplorerUrl(chainName, txId) {
    const chain = CHAINS[chainName] || CHAINS.algorand;
    return txId ? `${chain.explorer}${txId}` : null;
}

module.exports = { getChainInfo, getSupportedChains, getExplorerUrl, CHAINS };
