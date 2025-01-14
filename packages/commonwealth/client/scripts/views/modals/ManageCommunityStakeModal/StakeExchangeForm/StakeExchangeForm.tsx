import clsx from 'clsx';
import React from 'react';
import { isMobile } from 'react-device-detect';

import { commonProtocol } from '@hicommonwealth/core';
import app from 'state';
import {
  useBuyStakeMutation,
  useSellStakeMutation,
} from 'state/api/communityStake';
import { useCommunityStake } from 'views/components/CommunityStake';
import { Skeleton } from 'views/components/Skeleton';
import { CWDivider } from 'views/components/component_kit/cw_divider';
import { CWText } from 'views/components/component_kit/cw_text';
import CWCircleButton from 'views/components/component_kit/new_designs/CWCircleButton';
import CWIconButton from 'views/components/component_kit/new_designs/CWIconButton';
import {
  CWModalBody,
  CWModalFooter,
} from 'views/components/component_kit/new_designs/CWModal';
import CWPopover, {
  usePopover,
} from 'views/components/component_kit/new_designs/CWPopover';
import { CWSelectList } from 'views/components/component_kit/new_designs/CWSelectList';
import { MessageRow } from 'views/components/component_kit/new_designs/CWTextInput/MessageRow';
import { CWButton } from 'views/components/component_kit/new_designs/cw_button';

import { useStakeExchange } from '../hooks';
import {
  ManageCommunityStakeModalMode,
  ManageCommunityStakeModalState,
} from '../types';
import { capDecimals, convertEthToUsd } from '../utils';
import {
  CustomAddressOption,
  CustomAddressOptionElement,
} from './CustomAddressOption';

import './StakeExchangeForm.scss';

type OptionDropdown = {
  value: string;
  label: string;
};

interface StakeExchangeFormProps {
  mode: ManageCommunityStakeModalMode;
  onSetModalState: (modalState: ManageCommunityStakeModalState) => void;
  onSetSuccessTransactionHash: (hash: string) => void;
  selectedAddress: OptionDropdown;
  onSetSelectedAddress: (address: OptionDropdown) => void;
  addressOptions: OptionDropdown[];
  numberOfStakeToExchange: number;
  onSetNumberOfStakeToExchange: React.Dispatch<React.SetStateAction<number>>;
}

const StakeExchangeForm = ({
  mode,
  onSetModalState,
  onSetSuccessTransactionHash,
  selectedAddress,
  onSetSelectedAddress,
  addressOptions,
  numberOfStakeToExchange,
  onSetNumberOfStakeToExchange,
}: StakeExchangeFormProps) => {
  const chainRpc = app?.chain?.meta?.ChainNode?.url;
  const activeAccountAddress = app?.user?.activeAccount?.address;

  const {
    buyPriceData,
    ethUsdRate,
    userEthBalance,
    userEthBalanceLoading,
    sellPriceData,
  } = useStakeExchange({
    mode,
    address: selectedAddress?.value,
    numberOfStakeToExchange,
  });

  const { stakeBalance, stakeValue, currentVoteWeight, stakeData } =
    useCommunityStake({ walletAddress: selectedAddress?.value });

  const { mutateAsync: buyStake } = useBuyStakeMutation();
  const { mutateAsync: sellStake } = useSellStakeMutation();

  const expectedVoteWeight = commonProtocol.calculateVoteWeight(
    String(numberOfStakeToExchange),
    stakeData?.vote_weight,
  );

  const popoverProps = usePopover();

  const isBuyMode = mode === 'buy';

  const handleBuy = async () => {
    try {
      onSetModalState(ManageCommunityStakeModalState.Loading);

      const txReceipt = await buyStake({
        amount: numberOfStakeToExchange,
        stakeId: commonProtocol.STAKE_ID,
        namespace: stakeData?.Chain?.namespace,
        chainRpc,
        walletAddress: selectedAddress?.value,
      });

      onSetSuccessTransactionHash(txReceipt?.transactionHash);
      onSetModalState(ManageCommunityStakeModalState.Success);
    } catch (err) {
      console.log('Error buying: ', err);
      onSetModalState(ManageCommunityStakeModalState.Failure);
    }
  };

  const handleSell = async () => {
    try {
      onSetModalState(ManageCommunityStakeModalState.Loading);

      const txReceipt = await sellStake({
        amount: numberOfStakeToExchange,
        stakeId: commonProtocol.STAKE_ID,
        namespace: stakeData?.Chain?.namespace,
        chainRpc,
        walletAddress: selectedAddress?.value,
      });

      onSetSuccessTransactionHash(txReceipt?.transactionHash);
      onSetModalState(ManageCommunityStakeModalState.Success);
    } catch (err) {
      console.log('Error selling: ', err);
      onSetModalState(ManageCommunityStakeModalState.Failure);
    }
  };

  const handleClick = () => {
    isBuyMode ? handleBuy() : handleSell();
  };

  const handleMinus = () => {
    if (numberOfStakeToExchange === 0) {
      return;
    }

    onSetNumberOfStakeToExchange((prevState) => prevState - 1);
  };
  const handlePlus = () => {
    onSetNumberOfStakeToExchange((prevState) => prevState + 1);
  };

  const insufficientFunds =
    isBuyMode &&
    parseFloat(userEthBalance) < parseFloat(buyPriceData?.totalPrice);

  const ctaDisabled = isBuyMode
    ? insufficientFunds || numberOfStakeToExchange <= 0 || !selectedAddress
    : numberOfStakeToExchange > stakeBalance;

  const isUsdPriceLoading = isBuyMode
    ? !buyPriceData || !ethUsdRate
    : !sellPriceData || !ethUsdRate;

  const pricePerUnitEth = isBuyMode
    ? buyPriceData?.price
    : sellPriceData?.price;

  const pricePerUnitUsd = isBuyMode
    ? convertEthToUsd(buyPriceData?.price, ethUsdRate)
    : convertEthToUsd(sellPriceData?.price, ethUsdRate);

  const feesPriceEth = isBuyMode
    ? buyPriceData?.fees
    : String(Math.abs(parseFloat(sellPriceData?.fees)));

  const feesPriceUsd = isBuyMode
    ? convertEthToUsd(buyPriceData?.fees, ethUsdRate)
    : convertEthToUsd(Math.abs(parseFloat(sellPriceData?.fees)), ethUsdRate);

  const totalPriceEth = isBuyMode
    ? buyPriceData?.totalPrice
    : sellPriceData?.totalPrice;

  const totalPriceUsd = isBuyMode
    ? convertEthToUsd(buyPriceData?.totalPrice, ethUsdRate)
    : convertEthToUsd(sellPriceData?.totalPrice, ethUsdRate);

  const minusDisabled = numberOfStakeToExchange <= 1;

  const plusDisabled = isBuyMode
    ? false
    : numberOfStakeToExchange >= stakeBalance;

  return (
    <div className="StakeExchangeForm">
      <CWModalBody>
        <CWSelectList
          components={{
            // Option item in the dropdown
            Option: (originalProps) =>
              CustomAddressOption({
                originalProps,
                selectedAddressValue: activeAccountAddress,
              }),
          }}
          noOptionsMessage={() => 'No available Metamask address'}
          value={selectedAddress}
          formatOptionLabel={(option) => (
            // Selected option
            <CustomAddressOptionElement
              value={option.value}
              label={option.label}
              selectedAddressValue={activeAccountAddress}
            />
          )}
          label="Select address"
          isClearable={false}
          isSearchable={false}
          options={addressOptions}
          onChange={onSetSelectedAddress}
        />

        <div className="current-balance-row">
          <CWText type="caption">Current balance</CWText>
          {userEthBalanceLoading ? (
            <Skeleton className="price-skeleton" />
          ) : (
            <CWText
              type="caption"
              fontWeight="medium"
              className={clsx({ error: insufficientFunds })}
            >
              {capDecimals(userEthBalance)} ETH
            </CWText>
          )}
        </div>

        <CWDivider />

        <div className="stake-valued-row">
          <CWText type="caption">You have {stakeBalance} stake</CWText>
          <CWText type="caption" className="valued">
            valued at {capDecimals(String(stakeValue))} ETH
          </CWText>
          <CWText type="caption" className="vote-weight">
            Current vote weight {currentVoteWeight}
          </CWText>
        </div>

        <div className="exchange-stake-number-selector">
          <CWText type="caption" fontWeight="medium" className="header">
            You {mode}
          </CWText>
          <div className="stake-selector-row">
            <CWText type="b1" fontWeight="bold">
              Stake
            </CWText>
            <div className="stake-selector">
              <CWCircleButton
                buttonType="secondary"
                iconName="minus"
                onClick={handleMinus}
                disabled={minusDisabled}
              />
              <CWText type="h3" fontWeight="bold" className="number">
                {numberOfStakeToExchange}
              </CWText>
              <CWCircleButton
                buttonType="secondary"
                iconName="plus"
                onClick={handlePlus}
                disabled={plusDisabled}
              />
            </div>
          </div>
          <div className="price-per-unit-row">
            <CWText type="caption" className="label">
              Price per unit
            </CWText>
            {isUsdPriceLoading ? (
              <Skeleton className="price-skeleton" />
            ) : (
              <CWText type="caption" fontWeight="medium">
                {capDecimals(pricePerUnitEth)} ETH • ~$
                {pricePerUnitUsd} USD
              </CWText>
            )}
          </div>
        </div>

        {insufficientFunds && (
          <MessageRow
            statusMessage="Insufficient funds. Select an address with sufficient
            funds or add more funds to your wallet."
            validationStatus="failure"
            hasFeedback
          />
        )}

        <div className="total-weight-summary">
          <CWText type="b1" fontWeight="bold">
            Total weight
          </CWText>
          <CWText type="h3" fontWeight="bold" className="number">
            {expectedVoteWeight}
          </CWText>
        </div>

        <div className="fees-row">
          <div className="left-side">
            <CWIconButton
              iconName="infoEmpty"
              buttonSize="sm"
              onMouseEnter={popoverProps.handleInteraction}
              onMouseLeave={popoverProps.handleInteraction}
            />
            <CWPopover
              placement={isMobile ? 'top' : 'left'}
              title={
                <>
                  Fees Explainer
                  {isMobile && (
                    <div className="close">
                      <CWIconButton
                        iconName="close"
                        buttonSize="sm"
                        onClick={popoverProps.handleInteraction}
                      />
                    </div>
                  )}
                </>
              }
              body={
                <div className="explanation-container">
                  <CWText type="b2">
                    {isBuyMode
                      ? 'When purchasing points, a 5% goes into a community treasury.'
                      : 'When transacting with Stake, a 5% fee goes into the community treasury'}
                  </CWText>
                  <CWText type="b2">
                    This treasury is used for various purposes, such as funding
                    community initiatives, projects, or rewarding top
                    contributors.
                  </CWText>
                  <CWText type="b2">Another 5% fee goes to Common.</CWText>
                  <CWText type="b2">Gas fees are also included here.</CWText>
                </div>
              }
              {...popoverProps}
            />
            <CWText type="caption">Fees</CWText>
          </div>
          {isUsdPriceLoading ? (
            <Skeleton className="price-skeleton" />
          ) : (
            <CWText type="caption" fontWeight="medium">
              {capDecimals(feesPriceEth)} ETH • ~$
              {feesPriceUsd} USD
            </CWText>
          )}
        </div>

        <div className="total-cost-row">
          <CWText type="caption">{isBuyMode ? 'Total cost' : 'Net'}</CWText>
          {isUsdPriceLoading ? (
            <Skeleton className="price-skeleton" />
          ) : (
            <CWText type="caption" fontWeight="medium">
              {capDecimals(totalPriceEth)} ETH • ~$
              {totalPriceUsd} USD
            </CWText>
          )}
        </div>
      </CWModalBody>
      <CWModalFooter>
        <CWButton
          disabled={ctaDisabled}
          label={isBuyMode ? 'Buy stake' : 'Sell stake'}
          buttonType="secondary"
          buttonAlt={isBuyMode ? 'green' : 'rorange'}
          buttonWidth="full"
          onClick={handleClick}
        />
      </CWModalFooter>
    </div>
  );
};

export default StakeExchangeForm;
