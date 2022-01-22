import _regeneratorRuntime from 'regenerator-runtime';
import { hexlify, encode, sign, keccak256, splitSignature, stripZeros, arrayify } from 'avalanche-js-crypto';
import { RPCMethod } from 'avalanche-js-network';
import { TransactionBase, defaultMessenger, TxStatus } from 'avalanche-js-transaction';
import { numberToHex, Unit } from 'avalanche-js-utils';
import { TextEncoder } from 'text-encoding';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;

  _setPrototypeOf(subClass, superClass);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

/** @hidden */

var StakingSettings = function StakingSettings() {};
StakingSettings.PRECISION = 18;
StakingSettings.MAX_DECIMAL = 1000000000000000000;
/** @hidden */

var Directive;

(function (Directive) {
  Directive[Directive["DirectiveCreateValidator"] = 0] = "DirectiveCreateValidator";
  Directive[Directive["DirectiveEditValidator"] = 1] = "DirectiveEditValidator";
  Directive[Directive["DirectiveDelegate"] = 2] = "DirectiveDelegate";
  Directive[Directive["DirectiveUndelegate"] = 3] = "DirectiveUndelegate";
  Directive[Directive["DirectiveCollectRewards"] = 4] = "DirectiveCollectRewards";
})(Directive || (Directive = {}));

var StakingTransaction = /*#__PURE__*/function (_TransactionBase) {
  _inheritsLoose(StakingTransaction, _TransactionBase);

  function StakingTransaction(directive, stakeMsg, nonce, gasPrice, gasLimit, chainID, messenger, txStatus) {
    var _this;

    if (messenger === void 0) {
      messenger = defaultMessenger;
    }

    if (txStatus === void 0) {
      txStatus = TxStatus.INTIALIZED;
    }

    _this = _TransactionBase.call(this, messenger, txStatus) || this;
    _this.directive = directive;
    _this.stakeMsg = stakeMsg;
    _this.nonce = nonce;
    _this.gasLimit = gasLimit;
    _this.gasPrice = gasPrice;
    _this.rawTransaction = '0x';
    _this.unsignedRawTransaction = '0x';
    _this.signature = {
      r: '',
      s: '',
      recoveryParam: 0,
      v: 0
    };
    _this.chainId = chainID;
    _this.from = '0x';
    return _this;
  }

  var _proto = StakingTransaction.prototype;

  _proto.encode = function encode$1() {
    var raw = []; // TODO: temporary hack for converting 0x00 to 0x

    if (!this.directive) {
      raw.push('0x');
    } else {
      raw.push(hexlify(this.directive));
    }

    raw.push(this.stakeMsg.encode());

    if (!this.nonce) {
      raw.push('0x');
    } else {
      raw.push(hexlify(this.nonce));
    }

    raw.push(hexlify(this.gasPrice));
    raw.push(hexlify(this.gasLimit));

    if (this.chainId != null && this.chainId !== 0) {
      raw.push(hexlify(this.chainId));
      raw.push('0x');
      raw.push('0x');
    }

    return [encode(raw), raw];
  };

  _proto.rlpSign = function rlpSign(prv) {
    var _this$encode = this.encode(),
        unsignedRawTransaction = _this$encode[0],
        raw = _this$encode[1];

    this.setUnsigned(unsignedRawTransaction);
    var signature = sign(keccak256(unsignedRawTransaction), prv);
    var signed = this.getRLPSigned(raw, signature);
    return [signature, signed];
  };

  _proto.getRLPSigned = function getRLPSigned(raw, signature) {
    var sig = splitSignature(signature);
    var v = 27 + (sig.recoveryParam || 0);
    raw.pop();
    raw.pop();
    raw.pop();
    v += this.chainId * 2 + 8;
    raw.push(hexlify(v));
    raw.push(stripZeros(arrayify(sig.r) || []));
    raw.push(stripZeros(arrayify(sig.s) || []));
    return encode(raw);
  };

  _proto.sendTransaction = /*#__PURE__*/function () {
    var _sendTransaction = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee() {
      var res;
      return _regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (!(this.rawTransaction === 'tx' || this.rawTransaction === undefined)) {
                _context.next = 2;
                break;
              }

              throw new Error('Transaction not signed');

            case 2:
              if (this.messenger) {
                _context.next = 4;
                break;
              }

              throw new Error('Messenger not found');

            case 4:
              _context.next = 6;
              return this.messenger.send(RPCMethod.SendRawStakingTransaction, this.rawTransaction, this.messenger.chainType, this.messenger.currentShard);

            case 6:
              res = _context.sent;

              if (!res.isResult()) {
                _context.next = 14;
                break;
              }

              this.id = res.result;
              this.emitTransactionHash(this.id);
              this.setTxStatus(TxStatus.PENDING);
              return _context.abrupt("return", [this, res.result]);

            case 14:
              if (!res.isError()) {
                _context.next = 20;
                break;
              }

              this.emitConfirm("transaction failed:" + res.error.message);
              this.setTxStatus(TxStatus.REJECTED);
              return _context.abrupt("return", [this, "transaction failed:" + res.error.message]);

            case 20:
              this.emitError('transaction failed');
              throw new Error('transaction failed');

            case 22:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    function sendTransaction() {
      return _sendTransaction.apply(this, arguments);
    }

    return sendTransaction;
  }();

  _proto.setUnsigned = function setUnsigned(unSigned) {
    this.unsignedRawTransaction = unSigned;
  };

  _proto.setRawTransaction = function setRawTransaction(rawTransaction) {
    this.rawTransaction = rawTransaction;
  };

  _proto.setSignature = function setSignature(signature) {
    this.signature = {
      r: signature.r,
      s: signature.s,
      v: signature.v,
      recoveryParam: signature.recoveryParam
    };
  };

  _proto.setNonce = function setNonce(nonce) {
    this.nonce = nonce;
  };

  _proto.setFromAddress = function setFromAddress(address) {
    this.from = address;
  };

  _proto.getUnsignedRawTransaction = function getUnsignedRawTransaction() {
    return this.unsignedRawTransaction;
  };

  _proto.getRawTransaction = function getRawTransaction() {
    return this.rawTransaction;
  };

  _proto.getSignature = function getSignature() {
    return this.signature;
  };

  _proto.getFromAddress = function getFromAddress() {
    return this.from;
  };

  _proto.confirm = /*#__PURE__*/function () {
    var _confirm = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee2(txHash, maxAttempts, interval, shardID, toShardID) {
      var txConfirmed, cxConfirmed;
      return _regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              if (maxAttempts === void 0) {
                maxAttempts = 20;
              }

              if (interval === void 0) {
                interval = 1000;
              }

              if (shardID === void 0) {
                shardID = this.messenger.currentShard;
              }

              if (toShardID === void 0) {
                toShardID = 0;
              }

              _context2.next = 6;
              return this.txConfirm(txHash, maxAttempts, interval, shardID);

            case 6:
              txConfirmed = _context2.sent;

              if (!(shardID === toShardID)) {
                _context2.next = 9;
                break;
              }

              return _context2.abrupt("return", txConfirmed);

            case 9:
              if (!txConfirmed.isConfirmed()) {
                _context2.next = 16;
                break;
              }

              _context2.next = 12;
              return this.cxConfirm(txHash, maxAttempts, interval, toShardID);

            case 12:
              cxConfirmed = _context2.sent;
              return _context2.abrupt("return", cxConfirmed);

            case 16:
              return _context2.abrupt("return", txConfirmed);

            case 17:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, this);
    }));

    function confirm(_x, _x2, _x3, _x4, _x5) {
      return _confirm.apply(this, arguments);
    }

    return confirm;
  }();

  return StakingTransaction;
}(TransactionBase);
/** @hidden */

var Description = /*#__PURE__*/function () {
  function Description(name, identity, website, securityContact, details) {
    this.name = name;
    this.identity = identity;
    this.website = website;
    this.securityContact = securityContact;
    this.details = details;
  }

  var _proto2 = Description.prototype;

  _proto2.encode = function encode() {
    var raw = [];
    var enc = new TextEncoder();
    raw.push(enc.encode(this.name));
    raw.push(enc.encode(this.identity));
    raw.push(enc.encode(this.website));
    raw.push(enc.encode(this.securityContact));
    raw.push(enc.encode(this.details));
    return raw;
  };

  return Description;
}();
/** @hidden */

var Decimal = /*#__PURE__*/function () {
  function Decimal(value) {
    if (value.length === 0) {
      throw new Error("decimal string is empty");
    }

    var value1 = value;

    if (value[0] === '-') {
      throw new Error("decimal fraction should be be between [0, 1]");
    }

    if (value[0] === '+') {
      value1 = value.substr(1);
    }

    if (value1.length === 0) {
      throw new Error("decimal string is empty");
    }

    var spaced = value1.split(' ');

    if (spaced.length > 1) {
      throw new Error("bad decimal string");
    }

    var splitted = value1.split('.');
    var len = 0;
    var combinedStr = splitted[0];

    if (splitted.length === 2) {
      len = splitted[1].length;

      if (len === 0 || combinedStr.length === 0) {
        throw new Error("bad decimal length");
      }

      if (splitted[1][0] === '-') {
        throw new Error("bad decimal string");
      }

      combinedStr += splitted[1];
    } else if (splitted.length > 2) {
      throw new Error("too many periods to be a decimal string");
    }

    if (len > StakingSettings.PRECISION) {
      throw new Error("too much precision: precision should be less than " + StakingSettings.PRECISION);
    }

    var zerosToAdd = StakingSettings.PRECISION - len;
    combinedStr += '0'.repeat(zerosToAdd);
    combinedStr = combinedStr.replace(/^0+/, '');
    var val = new Unit(combinedStr).asWei().toWei();

    if (val.gt(new Unit(StakingSettings.MAX_DECIMAL.toString()).asWei().toWei())) {
      throw new Error("too large decimal fraction");
    }

    this.value = val;
  }

  var _proto3 = Decimal.prototype;

  _proto3.encode = function encode() {
    var raw = [];
    raw.push(numberToHex(this.value));
    return raw;
  };

  return Decimal;
}();
/** @hidden */

var CommissionRate = /*#__PURE__*/function () {
  function CommissionRate(rate, maxRate, maxChangeRate) {
    this.rate = rate;
    this.maxRate = maxRate;
    this.maxChangeRate = maxChangeRate;
  }

  var _proto4 = CommissionRate.prototype;

  _proto4.encode = function encode() {
    var raw = [];
    raw.push(this.rate.encode());
    raw.push(this.maxRate.encode());
    raw.push(this.maxChangeRate.encode());
    return raw;
  };

  return CommissionRate;
}();
var CreateValidator = /*#__PURE__*/function () {
  function CreateValidator(validatorAddress, description, commissionRates, minSelfDelegation, maxTotalDelegation, slotPubKeys, amount) {
    this.validatorAddress = validatorAddress;
    this.description = description;
    this.commissionRates = commissionRates;
    this.minSelfDelegation = minSelfDelegation;
    this.maxTotalDelegation = maxTotalDelegation;
    this.slotPubKeys = slotPubKeys;
    this.amount = amount;
  }

  var _proto5 = CreateValidator.prototype;

  _proto5.encode = function encode() {
    var raw = [];
    raw.push(hexlify(TransactionBase.normalizeAddress(this.validatorAddress)));
    raw.push(this.description.encode());
    raw.push(this.commissionRates.encode());
    raw.push(hexlify(this.minSelfDelegation));
    raw.push(hexlify(this.maxTotalDelegation));
    raw.push(this.encodeArr());
    raw.push(hexlify(this.amount));
    return raw;
  };

  _proto5.encodeArr = function encodeArr() {
    var raw = [];
    this.slotPubKeys.forEach(function (pubKey) {
      raw.push(pubKey);
    });
    return raw;
  };

  return CreateValidator;
}();
var EditValidator = /*#__PURE__*/function () {
  function EditValidator(validatorAddress, description, commissionRate, minSelfDelegation, maxTotalDelegation, slotKeyToRemove, slotKeyToAdd) {
    this.validatorAddress = validatorAddress;
    this.description = description;
    this.commissionRate = commissionRate;
    this.minSelfDelegation = minSelfDelegation;
    this.maxTotalDelegation = maxTotalDelegation;
    this.slotKeyToRemove = slotKeyToRemove;
    this.slotKeyToAdd = slotKeyToAdd;
  }

  var _proto6 = EditValidator.prototype;

  _proto6.encode = function encode() {
    var raw = [];
    raw.push(hexlify(TransactionBase.normalizeAddress(this.validatorAddress)));
    raw.push(this.description.encode());
    raw.push(this.commissionRate.encode());
    raw.push(hexlify(this.minSelfDelegation));
    raw.push(hexlify(this.maxTotalDelegation));
    raw.push(this.slotKeyToRemove);
    raw.push(this.slotKeyToAdd);
    return raw;
  };

  return EditValidator;
}();
var Delegate = /*#__PURE__*/function () {
  function Delegate(delegatorAddress, validatorAddress, amount) {
    this.delegatorAddress = delegatorAddress;
    this.validatorAddress = validatorAddress;
    this.amount = amount;
  }

  var _proto7 = Delegate.prototype;

  _proto7.encode = function encode() {
    var raw = [];
    raw.push(hexlify(TransactionBase.normalizeAddress(this.delegatorAddress)));
    raw.push(hexlify(TransactionBase.normalizeAddress(this.validatorAddress)));
    raw.push(hexlify(this.amount));
    return raw;
  };

  return Delegate;
}();
var Undelegate = /*#__PURE__*/function () {
  function Undelegate(delegatorAddress, validatorAddress, amount) {
    this.delegatorAddress = delegatorAddress;
    this.validatorAddress = validatorAddress;
    this.amount = amount;
  }

  var _proto8 = Undelegate.prototype;

  _proto8.encode = function encode() {
    var raw = [];
    raw.push(hexlify(TransactionBase.normalizeAddress(this.delegatorAddress)));
    raw.push(hexlify(TransactionBase.normalizeAddress(this.validatorAddress)));
    raw.push(hexlify(this.amount));
    return raw;
  };

  return Undelegate;
}();
var CollectRewards = /*#__PURE__*/function () {
  function CollectRewards(delegatorAddress) {
    this.delegatorAddress = delegatorAddress;
  }

  var _proto9 = CollectRewards.prototype;

  _proto9.encode = function encode() {
    var raw = [];
    raw.push(hexlify(TransactionBase.normalizeAddress(this.delegatorAddress)));
    return raw;
  };

  return CollectRewards;
}();

/**
 * @packageDocumentation
 * @module avalanche-staking
 */
var StakingFactory = /*#__PURE__*/function () {
  function StakingFactory(messenger) {
    this.messenger = messenger;
    this.nonce = 0;
    this.gasPrice = new Unit('100').asGwei().toHex();
    this.gasLimit = new Unit('210000').asWei().toHex();
    this.chainId = 1;
    this.signature = {
      v: 0,
      r: '',
      s: ''
    };
  }

  var _proto = StakingFactory.prototype;

  _proto.createValidator = function createValidator(_ref) {
    var validatorAddress = _ref.validatorAddress,
        description = _ref.description,
        commissionRate = _ref.commissionRate,
        minSelfDelegation = _ref.minSelfDelegation,
        maxTotalDelegation = _ref.maxTotalDelegation,
        slotPubKeys = _ref.slotPubKeys,
        amount = _ref.amount;
    this.stakeMsg = new CreateValidator(validatorAddress, new Description(description.name, description.identity, description.website, description.securityContact, description.details), new CommissionRate(new Decimal(commissionRate.rate), new Decimal(commissionRate.maxRate), new Decimal(commissionRate.maxChangeRate)), minSelfDelegation, maxTotalDelegation, slotPubKeys, amount);
    this.directive = Directive.DirectiveCreateValidator;
    return this;
  };

  _proto.editValidator = function editValidator(_ref2) {
    var validatorAddress = _ref2.validatorAddress,
        description = _ref2.description,
        commissionRate = _ref2.commissionRate,
        minSelfDelegation = _ref2.minSelfDelegation,
        maxTotalDelegation = _ref2.maxTotalDelegation,
        slotKeyToRemove = _ref2.slotKeyToRemove,
        slotKeyToAdd = _ref2.slotKeyToAdd;
    this.stakeMsg = new EditValidator(validatorAddress, new Description(description.name, description.identity, description.website, description.securityContact, description.details), new Decimal(commissionRate), minSelfDelegation, maxTotalDelegation, slotKeyToRemove, slotKeyToAdd);
    this.directive = Directive.DirectiveEditValidator;
    return this;
  };

  _proto.delegate = function delegate(_ref3) {
    var delegatorAddress = _ref3.delegatorAddress,
        validatorAddress = _ref3.validatorAddress,
        amount = _ref3.amount;
    this.stakeMsg = new Delegate(delegatorAddress, validatorAddress, amount);
    this.directive = Directive.DirectiveDelegate;
    return this;
  };

  _proto.undelegate = function undelegate(_ref4) {
    var delegatorAddress = _ref4.delegatorAddress,
        validatorAddress = _ref4.validatorAddress,
        amount = _ref4.amount;
    this.stakeMsg = new Undelegate(delegatorAddress, validatorAddress, amount);
    this.directive = Directive.DirectiveUndelegate;
    return this;
  };

  _proto.collectRewards = function collectRewards(_ref5) {
    var delegatorAddress = _ref5.delegatorAddress;
    this.stakeMsg = new CollectRewards(delegatorAddress);
    this.directive = Directive.DirectiveCollectRewards;
    return this;
  };

  _proto.setTxParams = function setTxParams(_ref6) {
    var nonce = _ref6.nonce,
        gasPrice = _ref6.gasPrice,
        gasLimit = _ref6.gasLimit,
        chainId = _ref6.chainId,
        signature = _ref6.signature;
    this.nonce = nonce;
    this.gasPrice = gasPrice;
    this.gasLimit = gasLimit;
    this.chainId = chainId;
    this.signature = signature;
    return this;
  };

  _proto.build = function build() {
    if (this.directive === undefined) {
      throw new Error('cannot build stakingTransaction without Directive');
    }

    if (this.stakeMsg === undefined) {
      throw new Error('cannot build stakingTransaction without stakeMsg');
    }

    return new StakingTransaction(this.directive, this.stakeMsg, this.nonce !== undefined ? this.nonce : 0, this.gasPrice !== undefined ? this.gasPrice : new Unit('100').asGwei().toHex(), this.gasLimit !== undefined ? this.gasLimit : new Unit('210000').asWei().toHex(), this.chainId !== undefined ? this.chainId : 1, this.messenger, TxStatus.INTIALIZED);
  };

  _proto.setMessenger = function setMessenger(messenger) {
    this.messenger = messenger;
  };

  return StakingFactory;
}();

export { CollectRewards, CommissionRate, CreateValidator, Decimal, Delegate, Description, Directive, EditValidator, StakingFactory, StakingSettings, StakingTransaction, Undelegate };
//# sourceMappingURL=avalanche-js-staking.esm.js.map
