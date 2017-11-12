# INS Promo Token Smart Contract: Functional Requirements

This document summarizes functional requirments for INS Promo Token Smart Contract.

## 1. Introduction

INS Promo Token Smart Contract is an [Ethereum](https://ethereum.org/) smart contract that implements standard [EIP-20](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20-token-standard.md) token interface.
This smart contract manages two token balances for every Ethereum address: real balance and virtual balance.
Real balance of an address is stored in smart contract's storage while virtual balance is calculated on the fly based on ether balance of the address.
See *Virtual Balance Calculation* section for details.
The following sections contain mode details about the functionality of INS Promo Token Smart Contract.

## 2. Virtual Balance Formula

Virtual balance of an address is calculated according to the following rules:

1. if virtual balance for the address was already materialized, then virtual balance for such address is zero;
2. otherwise, if ether balance for the address is less than 0.1 ether, then virtual balance of such address is zero;
3. otherwise, if the maximum number of tokens in circulation minus number of tokens currently in circulation is less than 777, then virtual balance of address if equals to the maximum number of tokens in circulation minus number of tokens currently in circulation;
4. otherwise, virtual balance of address is 777 tokens.

## 3. Use Cases

This section contains detailed description of smart contract use cases grouped into functional blocks.

### 3.1. EIP-20 Use Cases

This functional block described use cases that implement standard EIP-20 token interface.

#### 3.1.1. EIP20:Name

*Actors:* _User_, _Smart Contract_

*Goal:* _User_ wants to know name of the tokens managed by _Smart Contract_

##### Main Flow:

1. _User_ calls constant method on _Smart Contract_
2. _Smart Contract_ returns name of the tokens managed by it to _User_

#### 3.1.2. EIP20:Symbol

*Actors:* _User_, _Smart Contract_

*Goal:* _User_ wants to know symbol of the tokens managed by _Smart Contract_

##### Main Flow:

1. _User_ calls constant method on _Smart Contract_
2. _Smart Contract_ returns symbol of the tokens managed by it to _User_

#### 3.1.3. EIP20:Decimals

*Actors:* _User_, _Smart Contract_

*Goal:* _User_ wants to know number of decimals for the tokens managed by _Smart Contract_

##### Main Flow:

1. _User_ calls constant method on _Smart Contract_
2. _Smart Contract_ returns number of decimals for the tokens managed by it to _User_

#### 3.1.4. EIP20:TotalSupply

*Actors:* _User_, _Smart Contract_

*Goal:* _User_ wants to know how many tokens are currently in circulation, i.e. sum of real balances for all addresses

##### Main Flow:

1. _User_ calls constant method on _Smart Contract_
2. _Smart Contract_ returns current number of tokens in circulation to _User_

#### 3.1.5. EIP20:BalanceOf

*Actors:* _User_, _Smart Contract_

*Goal:* _User_ wants to know how many tokens are currently belonging to the owner of certain address

##### Main Flow:

1. _User_ calls constant method on _Smart Contract_ providing the following information as method parameter: address to obtain number of belonging tokens for
2. _Smart Contract_ calculates balance for the given address as a sum of real and virtual balances of this address
3. _Smart Contract_ returns balance of the given address to _User_

#### 3.1.6. EIP20:Transfer

*Actors:* _User_, _Smart Contract_

*Goals:* _User_ wants to transfer certain number of his tokens to the owner of certain destination address

##### Main Flow:

1. _User_ calls method on _Smart Contract_ providing the following information as method parameters: address to transfer tokens to the owner of and number of tokens to transfer
2. Real balance of _User_ is enough to perform the transfer
3. _Smart Contract_ transfers given number of tokens from _User_ to the owner of given destination address by reducing reals balance of _User_ and increasing real balance of destination address by the number of tokens being transferred
4. Some tokens actually were transferred, i.e. destination address is no the same as _User_ address and number of tokens transferred is not zero
5. _Smart Contract_ logs an event with the following information: _User_ address, destination address, number of tokens transferred
6. _Smart Contract_ returns success indicator to _User_

##### Exceptional Flow #1:

1. Same as in Main Flow
2. Real balance of _User_ is not enough to perform the transfer
3. Real balance together with virtual balance of _User_ is enough to perform transfer
4. _Smart Contract materializes virtual balance of _User_ by adding it to the real balance of _User_
5. Same as step 3 of Main Flow
6. Same as step 4 of Main Flow
7. Same as step 5 of Main Flow
8. Same as step 6 of Main Flow

##### Exceptional Flow #2:

1. Same as in Main Flow
2. Same as in Exceptional Flow #1
3. Real balance together with virtual balance of _User_ is not enough to perform transfer
4. _Smart Contract_ returns error indicator to _User_

##### Exceptional Flow #3:

1. Same as in Main Flow
2. Same as in Exceptional Flow #1
3. Same as in Exceptional Flow #1
4. Same as in Exceptional Flow #1
5. Same as in Exceptional Flow #1
6. No tokens were actually transferred, i.e. destination address is the same as _User_ address
7. _Smart Contract_ returns success indicator to _User_

##### Exceptional Flow #4

1. Same as in Main Flow
2. Same as in Main Flow
3. Same as in Main Flow
4. No tokens were actually transferred, i.e. destination address is the same as _User_ address or number of tokens transferred is zero
5. _Smart Contract_ returns success indicator to _User_

#### 3.1.7. EIP20:TransferFrom

*Actors:* _User_, _Smart Contract_

*Goals:* _User_ wants to transfer certain number of tokens from the owner of certain source address to the owner of certain destination address

##### Main Flow:

1. _User_ calls method on _Smart Contract_ providing the following information as method parameters: address to transfer tokens from the owner of, address to transfer tokens to the owner of, and number of tokens to transfer
2. _User_ is currently allowed to transfer given number of tokens from the owner of given source address
3. Real balance of the owner of given source address is enough to perform the transfer
4. _Smart Contract_ transfers given number of tokens from the owner of given source address to the owner of given destination address by reducing reals balance of source address and increasing real balance of destination address by the number of tokens being transferred
5. Some tokens actually were transferred, i.e. destination address is no the same as source address and number of tokens transferred is not zero
6. _Smart Contract_ logs an event with the following information: source address, destination address, number of tokens transferred
7. _Smart Contract_ returns success indicator to _User_

##### Exceptional Flow #1:

1. Same as in Main Flow
2. _User_ is currently not allowed to transfer given number of tokens from the owner of given source address
3. _Smart Contract_ returns error indicator to _User_

##### Exceptional Flow #2:

1. Same as in Main Flow
2. Same as in Main Flow
3. Real balance of _User_ is not enough to perform the transfer
4. Real balance together with virtual balance of source address is enough to perform transfer
5. _Smart Contract materializes virtual balance of source address by adding it to the real balance of source address
6. Same as step 4 of Main Flow
7. Same as step 5 of Main Flow
8. Same as step 6 of Main Flow
9. Same as step 7 of Main Flow

##### Exceptional Flow #3:

1. Same as in Main Flow
2. Same as in Main Flow
3. Same as in Exceptional Flow #2
4. Real balance together with virtual balance of source address is not enough to perform transfer
5. _Smart Contract_ returns error indicator to _User_

##### Exceptional Flow #4:

1. Same as in Main Flow
2. Same as in Main Flow
3. Same as in Exceptional Flow #2
4. Same as in Exceptional Flow #2
5. Same as in Exceptional Flow #2
6. Same as in Exceptional Flow #2
7. No tokens were actually transferred, i.e. destination address is the same as source address address
8. _Smart Contract_ returns success indicator to _User_

##### Exceptional Flow #5

1. Same as in Main Flow
2. Same as in Main Flow
3. Same as in Main Flow
4. Same as in Main Flow
5. No tokens were actually transferred, i.e. destination address is the same as source address or number of tokens transferred is zero
6. _Smart Contract_ returns success indicator to _User_

#### 3.1.8. EIP20:Allowance

*Actors:* _User_, _Smart Contract_

*Goal:* _User_ wants to know how many tokens belonging to the owner of certain owner address the owner of certain spender address is currently allowed to transfer

##### Main Flow:

1. _User_ calls constant method on _Smart Contract_ providing the following information as method parameters: owner address and spender address
2. _Smart Contract_ return to _User_ the number of tokens belonging to the owner of owner address the owner of spender address is currently allowed to transfer

#### 3.1.9. EIP20:Approve

*Actors:* _User_, _Smart Contract_

*Goal:* _User_ wants to allow the owner of certain spender address to transfer certain number of tokens belonging to _User_

##### Main Flow:

1. _User_ calls method on _Smart Contract_ providing the following information as method parameters: spender address and number of tokens to allow to be transferred by the owner of spender address
2. _Smart Contract_ sets how many tokens belonging to _User_ the owner of spender address is allowed to transfer
3. _Smart Contract_ logs an event with the following information: _User_ address, spender address, number of tokens belonging to _User_ the owner of spender address is allowed to transfer
4. _Smart Contract_ returns success indicator to _User_

### 3.2. Administration Use Cases

This functional block describes use cases related to smart contract deployment and administration.

#### 3.2.1. Administration:Deploy

*Actors:* _Administrator_, _Smart Contract_

*Goal:* _Administrator_ wants to deploy _Smart Contract_

##### Main Flow:

1. _Administrator_ deploys _Smart Contract_
2. _Smart Contract_ remembers _Administrator_ address as the address of _Smart Contract_ owner

#### 3.2.2. Administrator:MassNotify

*Actors:* _Administrator_, _Smart Contract_

*Goal:* _Administrator_ wants to notify owners of certain addresses about their virtual balances

##### Main Flow:

1. _Administrator_ calls method on _Smart Contract_ providing the following information as method parameters: list of addresses to notify the owner of
2. _Administrator_ is the owner of _Smart Contract_
3. _Smart Contract_ sends transfer event to every address in the list with the following information: zero address as source address, address from the list as destination address and 777 tokens as value

##### Exceptional Flow:

1. Same as in Main Flow
2. _Administrator_ is not the owner of _Smart Contract_
3. _Smart Contract_ cancels transaction

#### 3.2.3. Administrator:Kill

*Actors:* _Administrator_, _Smart Contract_

*Goal:* _Administrator_ wants to kill _Smart Contract_

##### Main Flow:

1. _Administrator_ calls method on _Smart Contract_
2. _Administrator_ is the owner of _Smart Contract_
3. _Smart Contract_ self-destructs sending all ether to message sender

##### Exceptional Flow:

1. Same as in Main Flow
2. _Administrator_ is not the owner of _Smart Contract_
3. _Smart Contract_ cancels transaction

## 4. Limits

The following limits are established for the smart contract:

Limit                                   | Value
--------------------------------------- | -------
Maximum number of tokens in circulation | 2^255-1

## 5. Token Properties

The following table lists properties of tokens managed by INS Promo Token Smart Contract:

Property | Value
-------- | ---------
Name     | INS Promo
Symbol   | INSP
Decimals | 0
