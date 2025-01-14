import { commonProtocol } from '@hicommonwealth/core';
import NamespaceFactory from 'helpers/ContractHelpers/NamespaceFactory';
import app from 'state';

const useNamespaceFactory = () => {
  const goerliFactoryAddress =
    commonProtocol.factoryContracts[commonProtocol.ValidChains.Sepolia].factory;
  const chainRpc = app.config.nodes
    .getAll()
    .find(
      (node) => node.ethChainId === commonProtocol.ValidChains.Sepolia,
    )?.url;
  const namespaceFactory = new NamespaceFactory(goerliFactoryAddress, chainRpc);

  return { namespaceFactory };
};

export default useNamespaceFactory;
