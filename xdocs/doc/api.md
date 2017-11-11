# INS Promo Token Smart Contract: API

This document public API of INS Promo Token Smart Contract.

## 1. Constructors

### 1.1. INSPromoToken()

##### Signature:

    function INSPromoToken()

##### Description:

Deploy INS Promo Token Smart Contract and make message sender to be the owner of new deployed smart contract.

##### Use Cases:

* Administration:Deploy

## 2. Methods

### 2.1. name()

##### Signature:

    function name() constant returns (string)

##### Description:

Get name of the tokens managed by the smart contract.
May be called by anyone.
Does no accept ether.

##### Use Cases:

* EIP20:Name

### 2.2. symbol()

##### Signature:

    function symbol() constant returns (string)

##### Description:

Get symbol of the tokens managed by the smart contract.
May be called by anyone.
Does no accept ether.

##### Use Cases:

* EIP20:Symbol

### 2.3. decimals()

##### Signature:

    function decimals() constant returns (uint8)

##### Description:

Get number of decimals for the tokens managed by the smart contract.
May be called by anyone.
Does no accept ether.

##### Use Cases:

* EIP20:Decimals

### 2.4. totalSupply()

##### Signature:

    function totalSupply constant returns (uint256)

##### Description:

Get total number of real (i.e. non-virtual) tokens in circulation.
May be called by anyone.
Does no accept ether.

##### Use Cases:

* EIP20:TotalSupply

### 2.5. balanceOf(address)

##### Signature

    function balanceOf(address _owner) constant return (uint256)

##### Description

Get total (real plus virtual) token balance of the owner of given _owenr address.
May be called by anyone.
Does no accept ether.

##### Use Cases:

* EIP20:BalanceOf

### 2.6. transfer(address, uint256)

##### Signature:

    function transfer(address _to, uint256 _value) returns (bool)

##### Description:

Transfer _value tokens from message sender to the owner of given _to address.
Return true on success, false on fail.
May be called by anyone.
Does no accept ether.

##### Use Cases:

* EIP20:Transfer

### 2.7. transferFrom(address, address, uint256)

###### Signature:

    function transferFrom(address _from, address _to, uint256 _value)
    returns (bool)

##### Description:

Transfer _value tokens from the owner of _from address to the owner of _to address.
The transfer has to be approved in advance via `approve` method.
Return true on success, false on fail.
May be called by anyone.
Does no accept ether.

##### Use Cases:

* EIP20:TransferFrom

2.8. allowance(address, address)

##### Signature:

    function allowance(address _owner, address _spender)
    constant returns (uint256)

##### Description:

Get the number of tokens belonging to the owner of _owner address the owner of _spender address is allowed to transfer.
May be called by anyone.
Does no accept ether.

##### Use Cases:

* EIP20:Allowance

### 2.9. approve(address, uint256)

##### Signature:

    function approve(address _spender, uint256 _value) returns (bool)

##### Description:

Set to _value the number of tokens belonging to the message sender the owner of _spender address is allowed to transfer.
May be called by anyone.
Does no accept ether.

##### Use Cases:

* EIP20:Approve

### 2.10. massNotify(address[])

##### Signature:

    function massNotofy(address[] _addresses)

##### Description:

Notify the owners of given _addresses about their virtual balances.
May only be called by the owner of smart contract.
Does no accept ether.

##### Use Cases:

* Administration:MassNotify

### 2.11. kill()

##### Signature:

    function kill()

##### Description:

Kill the smart contract.
May only be called by the owner of smart contract.
Does no accept ether.

##### Use Cases:

* Administration:Kill

## 3. Events

### 3.1. Transfer(address, address, uint256)

##### Signature:

    event Transfer(address _from, address _to, uint256 _value)

##### Description:

Triggered when _value tokens were transferred from the owner of _from address to the owner of _to address.

##### Use Cases:

* EIP20:Transfer
* EIP20:TransferFrom

### 3.2. Approval(address, address, uint256)

##### Signature

    event Approval(address _owner, address _spender, uint256 _value)

##### Description

Triggered when the owner of _spender address was allowed to transfer _value tokens from the owner of _owner address.

##### Use Cases:

* EIP20:Approve
