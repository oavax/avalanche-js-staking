/**
 * @packageDocumentation
 * @module avalanche-staking
 */
import { Messenger } from 'avalanche-js-network';
import { Signature } from 'avalanche-js-crypto';
import { Directive, CreateValidator, EditValidator, Delegate, Undelegate, CollectRewards, StakingTransaction } from './stakingTransaction';
/** @hidden */
export interface DescriptionInterface {
    name: string;
    identity: string;
    website: string;
    securityContact: string;
    details: string;
}
/** @hidden */
export interface CommissionRateInterface {
    rate: string;
    maxRate: string;
    maxChangeRate: string;
}
export declare class StakingFactory {
    messenger: Messenger;
    stakeMsg?: CreateValidator | EditValidator | Delegate | Undelegate | CollectRewards;
    directive?: Directive;
    nonce: number | string;
    gasPrice: number | string;
    gasLimit: number | string;
    chainId: number;
    signature: Signature;
    constructor(messenger: Messenger);
    createValidator({ validatorAddress, description, commissionRate, minSelfDelegation, maxTotalDelegation, slotPubKeys, amount, }: {
        validatorAddress: string;
        description: DescriptionInterface;
        commissionRate: CommissionRateInterface;
        minSelfDelegation: number;
        maxTotalDelegation: number;
        slotPubKeys: string[];
        amount: number;
    }): this;
    editValidator({ validatorAddress, description, commissionRate, minSelfDelegation, maxTotalDelegation, slotKeyToRemove, slotKeyToAdd, }: {
        validatorAddress: string;
        description: DescriptionInterface;
        commissionRate: string;
        minSelfDelegation: number;
        maxTotalDelegation: number;
        slotKeyToRemove: string;
        slotKeyToAdd: string;
    }): this;
    delegate({ delegatorAddress, validatorAddress, amount, }: {
        delegatorAddress: string;
        validatorAddress: string;
        amount: number;
    }): this;
    undelegate({ delegatorAddress, validatorAddress, amount, }: {
        delegatorAddress: string;
        validatorAddress: string;
        amount: number;
    }): this;
    collectRewards({ delegatorAddress }: {
        delegatorAddress: string;
    }): this;
    setTxParams({ nonce, gasPrice, gasLimit, chainId, signature, }: {
        nonce: number | string;
        gasPrice: number | string;
        gasLimit: number | string;
        chainId: number;
        signature: Signature;
    }): this;
    build(): StakingTransaction;
    setMessenger(messenger: Messenger): void;
}
