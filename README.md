# avalanche-js-staking

This package provides a collection of apis to create, sign/send staking transaction, and receive confirm/receipt.

## Installation

```
npm install avalanche-js-staking
```

## Usage

Create a Avalanche instance connecting to testnet

```javascript
const { Avalanche } = require('avalanche-js-core');
const {
  ChainID,
  ChainType,
  hexToNumber,
  numberToHex,
  fromWei,
  Units,
  Unit,
} = require('avalanche-js-utils');

const hmy = new Avalanche(
    'https://api.s0.b.hmny.io/',
    {
        chainType: ChainType.Avalanche,
        chainId: ChainID.HmyTestnet,
    },
);
```
Below, examples show how to send delegate, undelegate, and collect rewards staking transactions. First, set the chainId, gasLimit, gasPrice for all subsequent staking transactions
```javascript
hmy.stakings.setTxParams({
  gasLimit: 25000,
  gasPrice: numberToHex(new hmy.utils.Unit('1').asGwei().toWei()),
  chainId: 2
});
```
<span style="color:red">Note: create and edit validator transactions are not fully supported in the sdk</span>

Create delegate staking transaction
```javascript
const delegate = hmy.stakings.delegate({
  delegatorAddress: 'avax103q7qe5t2505lypvltkqtddaef5tzfxwsse4z7',
  validatorAddress: 'avax1vfqqagdzz352mtvdl69v0hw953hm993n6v26yl',
  amount: numberToHex(new Unit(1000).asAVAX().toWei())
});
const delegateStakingTx = delegate.build();
```

Sign and send the delegate transaction and receive confirmation
```javascript
// key corresponds to avax103q7qe5t2505lypvltkqtddaef5tzfxwsse4z7, only has testnet balance
hmy.wallet.addByPrivateKey('45e497bd45a9049bcb649016594489ac67b9f052a6cdf5cb74ee2427a60bf25e');

hmy.wallet.signStaking(delegateStakingTx).then(signedTxn => {
  signedTxn.sendTransaction().then(([tx, hash]) => {
    console.log(hash);
    signedTxn.confirm(hash).then(response => {
      console.log(response.receipt);
    });
  });
});
```

Similarily, undelegate and collect reward transactions can be composed, signed and sent
Create undelegate staking transaction
```javascript
const undelegate = hmy.stakings.undelegate({
  delegatorAddress: 'avax103q7qe5t2505lypvltkqtddaef5tzfxwsse4z7',
  validatorAddress: 'avax1vfqqagdzz352mtvdl69v0hw953hm993n6v26yl',
  amount: numberToHex(new Unit(1000).asAVAX().toWei())
});
const undelegateStakingTx = undelegate.build();
```

Create collect rewards staking transaction
```javascript
const collectRewards = hmy.stakings.collectRewards({
  delegatorAddress: 'avax103q7qe5t2505lypvltkqtddaef5tzfxwsse4z7'
});
const collectRewardsStakingTx = collectRewards.build();
```

Also, similar to normal transaction, signing and sending can be performed asynchronously.