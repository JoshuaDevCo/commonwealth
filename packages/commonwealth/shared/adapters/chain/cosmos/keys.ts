// Cosmos cannot sign arbitrary blobs, but they can sign transactions. So, as a hack around that,
// we insert our account registration token into a proposal message, and then verify against the
// generated signature. But first we need the message to insert.
import { AminoMsg, makeSignDoc, StdSignDoc, StdFee } from '@cosmjs/amino';

export const validationTokenToSignDoc = (
  chainId: string,
  token: string,
  fee?: StdFee,
  memo?: string,
  msgs?: AminoMsg[],
): StdSignDoc => {
  const jsonTx: AminoMsg = {
    type: 'cosmos-sdk/TextProposal',
    value: {
      title: token.trim(),
      description: '',
      // proposer: address,
      // initial_deposit: [{ denom: 'stake', amount: '0' }]
    }
  };
  fee = fee || { gas: '1', amount: [{ denom: 'astr', amount: '0' }] };
  memo = memo || '';
  const signDoc = makeSignDoc(msgs || [jsonTx], fee, chainId, memo, '0', '0');
  return signDoc;
};