/*
 * Wrapper for Abstract Virtual Token Smart Contract.
 * Copyright © 2017 by ABDK Consulting.
 * Author: Mikhail Vladimirov <mikhail.vladimirov@gmail.com>
 */
pragma solidity ^0.4.16;

import "./../../src/sol/AbstractVirtualToken.sol";

/**
 * Wrapper for Abstract Virtual Token Smart Contract.
 */
contract AbstractVirtualTokenWrapper is AbstractVirtualToken {
  uint256 private initialSupply;

  /**
   * Create new Abstract Virtual Token Wrapper smart contract.
   */
  function AbstractVirtualTokenWrapper () AbstractVirtualToken () {
    // Do nothing
  }

  /**
   * Transfer given number of tokens from message sender to given recipient.
   *
   * @param _to address to transfer tokens from the owner of
   * @param _value number of tokens to transfer to the owner of given address
   * @return true if tokens were transferred successfully, false otherwise
   */
  function transfer (address _to, uint256 _value) returns (bool success) {
    Result (success = AbstractVirtualToken.transfer (_to, _value));
  }

  /**
   * Transfer given number of tokens from given owner to given recipient.
   *
   * @param _from address to transfer tokens from the owner of
   * @param _to address to transfer tokens to the owner of
   * @param _value number of tokens to transfer from given owner to given
   *        recipient
   * @return true if tokens were transferred successfully, false otherwise
   */
  function transferFrom (address _from, address _to, uint256 _value)
  returns (bool success) {
    Result (success = AbstractVirtualToken.transferFrom (_from, _to, _value));
  }

  /**
   * Set virtual balance for the owner of given address.
   *
   * @param _owner address to set virtual balance for the owner of
   * @param _virtualBalance virtual balance value to set
   */
  function setVirtualBalance (address _owner, uint256 _virtualBalance) {
    virtualBalances [_owner] = _virtualBalance;
  }

  /**
   * Get virtual balance of the owner of given address.
   *
   * @param _owner address to get virtual balance for the owner of
   * @return virtual balance of the owner of given address
   */
  function virtualBalanceOf (address _owner)
  internal constant returns (uint256 _virtualBalance) {
    return virtualBalances [_owner];
  }

  /**
   * Mapping from addresses to corresponding virtual balances.
   */
  mapping (address => uint256) private virtualBalances;

  /**
   * Used to log result of operation.
   *
   * @param _value result of operation
   */
  event Result (bool _value);
}
