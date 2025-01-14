import NodeInfo from 'models/NodeInfo';
import app from 'state';

// used for default chain dropdown options
export const POLYGON_ETH_CHAIN_ID = 137;
export const ETHEREUM_MAINNET_ID = '1';
export const OSMOSIS_ID = 'osmosis';

export const existingCommunityNames = app.config.chains
  .getAll()
  .map((community) => community.name.toLowerCase().trim());

const particularChainNodes = (nodeInfo: NodeInfo) => {
  const isEth = nodeInfo.ethChainId;
  const isCosmos = nodeInfo.cosmosChainId;
  const isSolana =
    nodeInfo.balanceType === 'solana' &&
    nodeInfo.name.toLowerCase().includes('mainnet');
  const isPolygon = nodeInfo.ethChainId === POLYGON_ETH_CHAIN_ID;

  return isEth || isCosmos || isSolana || isPolygon;
};

// Get chain id's from the app.config.chains for all eth and cosmos chains
export const chainTypes = app.config.nodes
  .getAll()
  .filter(particularChainNodes)
  .map((chain) => ({
    chainBase: chain.ethChainId
      ? 'ethereum'
      : chain.cosmosChainId
      ? 'cosmos'
      : 'solana',
    altWalletUrl: chain.altWalletUrl,
    nodeUrl: chain.url,
    value: chain.ethChainId || chain.cosmosChainId || 'solana',
    label: chain.name.replace(/\b\w/g, (l) => l.toUpperCase()),
    bech32Prefix: chain.bech32,
  }));
