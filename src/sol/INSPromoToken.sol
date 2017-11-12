/*
 * INS Promo Token Smart Contract.  Copyright © 2016-2017 by ABDK Consulting.
 * Author: Mikhail Vladimirov <mikhail.vladimirov@gmail.com>
 */
pragma solidity ^0.4.16;

import "./AbstractVirtualToken.sol";

/**
 * EIP-20 token smart contract that manages INS promo tokens.
 */
contract INSPromoToken is AbstractVirtualToken {
  /**
   * Balance threshold to assign virtual tokens to the owner of higher balances
   * then this threshold.
   */
  uint256 private constant VIRTUAL_THRESHOLD = 0.1 ether;
  
  /**
   * Number of virtual tokens to assign to the owners of balances higher than
   * virtual threshold.
   */
  uint256 private constant VIRTUAL_COUNT = 777;
  
  /**
   * Create new INS Promo Token smart contract and make message sender to be
   * the owner of smart contract.
   */
  function INSPromoToken () AbstractVirtualToken () {
    owner = msg.sender;
  }

  /**
   * Get name of this token.
   *
   * @return name of this token
   */
  function name () constant returns (string result) {
    return "INS Promo";
  }

  /**
   * Get symbol of this token.
   *
   * @return symbol of this token
   */
  function symbol () constant returns (string result) {
    return "INSP";
  }

  /**
   * Get number of decimals for this token.
   *
   * @return number of decimals for this token
   */
  function decimals () constant returns (uint8 result) {
    return 0;
  }

  /**
   * Notify owners about their virtual balances.
   *
   * @param _owners addresses of the owners to be notified
   */
  function massNotify (address [] _owners) {
    require (msg.sender == owner);
    uint256 count = _owners.length;
    for (uint256 i = 0; i < count; i++)
      Transfer (address (0), _owners [i], VIRTUAL_COUNT);
  }

  /**
   * Kill this smart contract.
   */
  function kill () {
    require (msg.sender == owner);
    selfdestruct (owner);
  }

  /**
   * Get virtual balance of the owner of given address.
   *
   * @param _owner address to get virtual balance for the owner of
   * @return virtual balance of the owner of given address
   */
  function virtualBalanceOf (address _owner)
  internal constant returns (uint256 _virtualBalance) {
    return _owner.balance >= VIRTUAL_THRESHOLD ? VIRTUAL_COUNT : 0;
  }

  /**
   * Address of the owner of this smart contract.
   */
  address private owner;
}
