/*
 * Abstract Virtual Token Smart Contract.  Copyright © 2017 by ABDK Consulting.
 * Author: Mikhail Vladimirov <mikhail.vladimirov@gmail.com>
 */
pragma solidity ^0.4.16;

import "./AbstractToken.sol";

/**
 * Abstract Token Smart Contract that could be used as a base contract for
 * ERC-20 token contracts supporting virtual balance.
 */
contract AbstractVirtualToken is AbstractToken {
  /**
   * Maximum number of real (i.e. non-virtual) tokens in circulation (2^255-1).
   */
  uint256 constant MAXIMUM_TOKENS_COUNT =
    0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF;

  /**
   * Mask used to extract real balance of an account (2^255-1).
   */
  uint256 constant BALANCE_MASK =
    0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF;

  /**
   * Mask used to extract "materialized" flag of an account (2^255).
   */
  uint256 constant MATERIALIZED_FLAG_MASK =
    0x8000000000000000000000000000000000000000000000000000000000000000;

  /**
   * Create new Abstract Virtual Token contract.
   */
  function AbstractVirtualToken () AbstractToken () {
    // Do nothing
  }

  /**
   * Get total number of tokens in circulation.
   *
   * @return total number of tokens in circulation
   */
  function totalSupply () constant returns (uint256 supply) {
    return tokensCount;
  }

  /**
   * Get number of tokens currently belonging to given owner.
   *
   * @param _owner address to get number of tokens currently belonging to the
   *        owner of
   * @return number of tokens currently belonging to the owner of given address
   */
  function balanceOf (address _owner) constant returns (uint256 balance) {
    return safeAdd (
      accounts [_owner] & BALANCE_MASK, getVirtualBalance (_owner));
  }

  /**
   * Transfer given number of tokens from message sender to given recipient.
   *
   * @param _to address to transfer tokens to the owner of
   * @param _value number of tokens to transfer to the owner of given address
   * @return true if tokens were transferred successfully, false otherwise
   */
  function transfer (address _to, uint256 _value) returns (bool success) {
    if (_value > balanceOf (msg.sender)) return false;
    else {
      materializeBalanceIfNeeded (msg.sender, _value);
      return AbstractToken.transfer (_to, _value);
    }
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
    if (_value > allowance (_from, msg.sender)) return false;
    if (_value > balanceOf (_from)) return false;
    else {
      materializeBalanceIfNeeded (_from, _value);
      return AbstractToken.transferFrom (_from, _to, _value);
    }
  }

  /**
   * Get virtual balance of the owner of given address.
   *
   * @param _owner address to get virtual balance for the owner of
   * @return virtual balance of the owner of given address
   */
  function virtualBalanceOf (address _owner)
  internal constant returns (uint256 _virtualBalance);

  /**
   * Calculate virtual balance of the owner of given address taking into account
   * materialized flag and total number of real tokens already in circulation.
   */
  function getVirtualBalance (address _owner)
  private constant returns (uint256 _virtualBalance) {
    if (accounts [_owner] & MATERIALIZED_FLAG_MASK != 0) return 0;
    else {
      _virtualBalance = virtualBalanceOf (_owner);
      uint256 maxVirtualBalance = safeSub (MAXIMUM_TOKENS_COUNT, tokensCount);
      if (_virtualBalance > maxVirtualBalance)
        _virtualBalance = maxVirtualBalance;
    }
  }

  /**
   * Materialize virtual balance of the owner of given address if this will help
   * to transfer given number of tokens from it.
   *
   * @param _owner address to materialize virtual balance of
   * @param _value number of tokens to be transferred
   */
  function materializeBalanceIfNeeded (address _owner, uint256 _value) private {
    uint256 storedBalance = accounts [_owner];
    if (storedBalance & MATERIALIZED_FLAG_MASK == 0) {
      // Virtual balance is not materialized yet
      if (_value > storedBalance) {
        // Real balance is not enough
        uint256 virtualBalance = getVirtualBalance (_owner);
        require (safeSub (_value, storedBalance) <= virtualBalance);
        accounts [_owner] = MATERIALIZED_FLAG_MASK |
          safeAdd (storedBalance, virtualBalance);
        tokensCount = safeAdd (tokensCount, virtualBalance);
      }
    }
  }

  /**
   * Number of real (i.e. non-virtual) tokens in circulation.
   */
  uint256 tokensCount;
}
