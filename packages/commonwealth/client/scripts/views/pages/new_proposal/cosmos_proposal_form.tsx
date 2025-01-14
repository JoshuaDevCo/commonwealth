import type { Any as ProtobufAny } from 'cosmjs-types/google/protobuf/any';
import React, { useState } from 'react';

import { notifyError } from 'controllers/app/notifications';
import type CosmosAccount from 'controllers/chain/cosmos/account';
import type Cosmos from 'controllers/chain/cosmos/adapter';
import {
  encodeCommunitySpend,
  encodeTextProposal,
} from 'controllers/chain/cosmos/gov/v1beta1/utils-v1beta1';
import { CosmosToken } from 'controllers/chain/cosmos/types';
import {
  useDepositParamsQuery,
  useStakingParamsQuery,
} from 'state/api/chainParams';

import { useCommonNavigate } from 'navigation/helpers';
import app from 'state';
import {
  minimalToNaturalDenom,
  naturalDenomToMinimal,
} from '../../../../../shared/utils';
import { Skeleton } from '../../components/Skeleton';
import { CWButton } from '../../components/component_kit/cw_button';
import { CWLabel } from '../../components/component_kit/cw_label';
import { CWRadioGroup } from '../../components/component_kit/cw_radio_group';
import { CWTextArea } from '../../components/component_kit/cw_text_area';
import { CWTextInput } from '../../components/component_kit/cw_text_input';

export const CosmosProposalForm = () => {
  const [cosmosProposalType, setCosmosProposalType] = useState<
    'textProposal' | 'communitySpend'
  >('textProposal');
  const [deposit, setDeposit] = useState<number>(0);
  const [description, setDescription] = useState<string>('');
  const [payoutAmount, setPayoutAmount] = useState<number>(0);
  const [recipient, setRecipient] = useState<string>('');
  const [title, setTitle] = useState<string>('');

  const navigate = useCommonNavigate();

  const author = app.user.activeAccount as CosmosAccount;
  const cosmos = app.chain as Cosmos;
  const meta = cosmos.meta;

  const { data: stakingDenom } = useStakingParamsQuery();
  const { data: depositParams, isLoading: isLoadingDepositParams } =
    useDepositParamsQuery(stakingDenom);

  const minDeposit = parseFloat(
    minimalToNaturalDenom(+depositParams?.minDeposit, meta?.decimals)
  );

  return (
    <>
      <CWLabel label="Proposal Type" />
      <CWRadioGroup
        name="cosmos-proposal-type"
        onChange={(e) => {
          const value = e.target.value as 'textProposal' | 'communitySpend';
          setCosmosProposalType(value);
        }}
        toggledOption={cosmosProposalType}
        options={[
          { label: 'Text Proposal', value: 'textProposal' },
          { label: 'Community Spend', value: 'communitySpend' },
        ]}
      />
      <CWTextInput
        placeholder="Enter a title"
        label="Title"
        onInput={(e) => {
          setTitle(e.target.value);
        }}
      />
      <CWTextArea
        label="Description"
        placeholder="Enter a description"
        onInput={(e) => {
          setDescription(e.target.value);
        }}
        value={description}
        resizeWithText
      />
      {isLoadingDepositParams ? (
        <Skeleton className="TextInput" style={{ height: 62 }} />
      ) : (
        <CWTextInput
          label={`Deposit (${meta?.default_symbol})`}
          placeholder={`Min: ${minDeposit}`}
          defaultValue={minDeposit}
          onInput={(e) => {
            setDeposit(+e.target.value);
          }}
        />
      )}
      {cosmosProposalType !== 'textProposal' && (
        <CWTextInput
          label="Recipient"
          placeholder={app.user.activeAccount.address}
          defaultValue=""
          onInput={(e) => {
            setRecipient(e.target.value);
          }}
        />
      )}
      {cosmosProposalType === 'communitySpend' && (
        <CWTextInput
          label={`Amount (${meta?.default_symbol})`}
          placeholder="12345"
          defaultValue=""
          onInput={(e) => {
            setPayoutAmount(e.target.value);
          }}
        />
      )}
      <CWButton
        label="Send transaction"
        onClick={(e) => {
          e.preventDefault();

          let prop: ProtobufAny;

          const depositInMinimalDenom = naturalDenomToMinimal(
            deposit,
            meta?.decimals
          );

          const _deposit = deposit
            ? new CosmosToken(
                depositParams?.minDeposit?.denom,
                depositInMinimalDenom,
                false
              )
            : depositParams?.minDeposit;

          if (cosmosProposalType === 'textProposal') {
            prop = encodeTextProposal(title, description);
          } else if (cosmosProposalType === 'communitySpend') {
            const spendAmountInMinimalDenom = naturalDenomToMinimal(
              payoutAmount,
              meta?.decimals
            );
            prop = encodeCommunitySpend(
              title,
              description,
              recipient,
              spendAmountInMinimalDenom,
              depositParams?.minDeposit?.denom
            );
          } else {
            throw new Error('Unknown Cosmos proposal type.');
          }

          // TODO: add disabled / loading
          cosmos.governance
            .submitProposalTx(author, _deposit, prop)
            .then((result) => {
              navigate(`/proposal/${result}`);
            })
            .catch((err) => notifyError(err.message));
        }}
      />
    </>
  );
};
