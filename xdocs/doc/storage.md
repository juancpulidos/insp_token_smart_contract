# INS Promo Token Smart Contract: Storage

This document describes storage structure of INS Promo Token Smart Contract.

# 1. accounts

##### Signature:

    mapping (address => uint256) accounts

##### Description

Maps address of the token owner to the status of his account.
If owner's virtual balance was not yet materialized, then value of `accounts[owner]` equals to the real balance of this token owner.
If owner's virtual balance was already materialized, then value of `accounts[owner]` equals to the real balance of this token owner plus 2^255.

##### Used in Use Cases:

* EIP20:BalanceOf
* EIP20:Transfer
* EIP20:TransferFrom

##### Modified in Use Cases:

* EIP20:Transfer
* EIP20:TransferFrom

# 2. allowances

##### Signature:

    mapping (address => mapping (address => uint256)) allowances

##### Description

Value of `allowances[owner][spender]` is the number of tokens belonging to the owner of owner address the owner of spender address is allowed to transfer.

##### Used in Use Cases:

* EIP20:TransferFrom
* EIP20:Allowance

##### Modified in Use Cases:

* EIP20:Approve

# 3. tokensCount

##### Signature:

    uint256 tokensCount

##### Description

Total number of real (i.e. non-virtual) tokens in circulation.

##### Used in Use Cases:

* EIP20:TotalSupply
* EIP20:BalanceOf
* EIP20:Transfer
* EIP20:TransferFrom

##### Modified in Use Cases:

* EIP20:Transfer
* EIP20:TransferFrom

# 4. owner

##### Signature:

    address owner

##### Description

Address of the owner of smart contract.

##### Used in Use Cases:

* Administration:MassNotify
* Administration:Kill

##### Modified in Use Cases:

* Administration:Deploy
