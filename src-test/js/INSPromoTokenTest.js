/*
 * Test for INS Promo Token Smart Contract.
 * Copyright © 2017 by ABDK Consulting.
 * Author: Mikhail Vladimirov <mikhail.vladimirov@gmail.com>
 */

tests.push ({
  name: "INSPromoToken",
  steps: [
    { name: "Ensure there is at least one account: Alice",
      body: function (test) {
        while (!web3.eth.accounts || web3.eth.accounts.length < 1)
          personal.newAccount ("");

        test.alice = web3.eth.accounts [0];
      }},
    { name: "Ensure Alice has at least 5 ETH",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getBalance (test.alice).gte (web3.toWei ("5", "ether"));
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Alice deploys three Wallet contracts: Bob, Carol and Dave",
      body: function (test) {
        test.walletContract = loadContract ("Wallet");
        var walletCode = loadContractCode ("Wallet");

        personal.unlockAccount (test.alice, "");
        test.tx1 = test.walletContract.new (
          {from: test.alice, data: walletCode, gas: 1000000}).
          transactionHash;
        test.tx2 = test.walletContract.new (
          {from: test.alice, data: walletCode, gas: 1000000}).
          transactionHash;
        test.tx3 = test.walletContract.new (
          {from: test.alice, data: walletCode, gas: 1000000}).
          transactionHash;
      }},
    { name: "Make sure contracts were deployed",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx1) &&
          web3.eth.getTransactionReceipt (test.tx2) &&
          web3.eth.getTransactionReceipt (test.tx3);
      },
      body: function (test) {
        miner.stop ();

        test.bob = getDeployedContract ("Bob", test.walletContract, test.tx1);
        test.carol = getDeployedContract ("Carol", test.walletContract, test.tx2);
        test.dave = getDeployedContract ("Dave", test.walletContract, test.tx3);
      }},
    { name: "Alice deploys INSPromoToken contract",
      body: function (test) {
        test.insPromoTokenContract =
          loadContract ("INSPromoToken");
        var insPromoTokenCode =
          loadContractCode ("INSPromoToken");

        personal.unlockAccount (test.alice, "");
        test.tx = test.insPromoTokenContract.new (
          {
            from: test.alice,
            data: insPromoTokenCode,
            gas:1000000
          }).transactionHash;
      }},
    { name: "Make sure contract was deployed",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();

        test.insPromoToken = getDeployedContract (
          "INSPromoToken",
          test.insPromoTokenContract,
          test.tx);

        assertEquals (
          "test.insPromoToken.name()",
          "INS Promo",
          test.insPromoToken.name());

        assertEquals (
          "test.insPromoToken.symbol()",
          "INSP",
          test.insPromoToken.symbol());

        assertBNEquals (
          "test.insPromoToken.decimals()",
          0,
          test.insPromoToken.decimals());

        assertBNEquals (
          "test.insPromoToken.totalSupply()",
          0,
          test.insPromoToken.totalSupply());
      }},
    { name: "Alice tells Bob to accept payments",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.bob.setAcceptsPayments (
          true,
          { from: test.alice, gas: 1000000 });
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Alice sends Bob 0.099999999999999999 ether",
      body: function (test) {
        assertBalance (
          "test.bob)",
          "0",
          "ether",
          test.bob.address);

        assertBNEquals (
          "test.insPromoToken.balanceOf(test.bob.address)",
          0,
          test.insPromoToken.balanceOf(test.bob.address));

        personal.unlockAccount (test.alice, "");
        test.tx = web3.eth.sendTransaction ({
          from: test.alice,
          to: test.bob.address,
          value: web3.toWei ("0.099999999999999999", "ether"),
          gas: 1000000 });
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertBalance (
          "test.bob)",
          "0.099999999999999999",
          "ether",
          test.bob.address);

        assertBNEquals (
          "test.insPromoToken.balanceOf(test.bob.address)",
          0,
          test.insPromoToken.balanceOf(test.bob.address));
      }},
    { name: "Alice sends Bob 1 Wei",
      body: function (test) {
        assertBalance (
          "test.bob)",
          "0.099999999999999999",
          "ether",
          test.bob.address);

        assertBNEquals (
          "test.insPromoToken.balanceOf(test.bob.address)",
          0,
          test.insPromoToken.balanceOf(test.bob.address));

        personal.unlockAccount (test.alice, "");
        test.tx = web3.eth.sendTransaction ({
          from: test.alice,
          to: test.bob.address,
          value: web3.toWei ("1", "wei"),
          gas: 1000000 });
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertBalance (
          "test.bob)",
          "0.1",
          "ether",
          test.bob.address);

        assertBNEquals (
          "test.insPromoToken.balanceOf(test.bob.address)",
          "777",
          test.insPromoToken.balanceOf(test.bob.address));
      }},
    { name: "Bob tries to send mass notify",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.bob.execute (
          test.insPromoToken.address,
          test.insPromoToken.massNotify.getData ([
            test.bob.address, test.carol.address, test.dave.address]),
          0,
          { from: test.alice, value: 0, gas: 1000000 });
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.bob.Result",
          test.bob,
          test.bob.Result,
          test.tx,
          { _value: false });

        assertEvents (
          "test.insPromoToken.Transfer",
          test.insPromoToken,
          test.insPromoToken.Transfer,
          test.tx);
      }},
    { name: "Alice sends mass notify",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.insPromoToken.massNotify ([
          test.bob.address, test.carol.address, test.dave.address],
          { from: test.alice, value: 0, gas: 1000000 });
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.insPromoToken.Transfer",
          test.insPromoToken,
          test.insPromoToken.Transfer,
          test.tx,
          {
            _from: "0x0000000000000000000000000000000000000000",
            _to: test.bob.address,
            _value: web3.toBigNumber ("777")
          },{
            _from: "0x0000000000000000000000000000000000000000",
            _to: test.carol.address,
            _value: web3.toBigNumber ("777")
          },{
            _from: "0x0000000000000000000000000000000000000000",
            _to: test.dave.address,
            _value: web3.toBigNumber ("777")
          });
      }},
    { name: "Bob tries to kill token contract",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.bob.execute (
          test.insPromoToken.address,
          test.insPromoToken.kill.getData (),
          0,
          { from: test.alice, value: 0, gas: 1000000 });
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.bob.Result",
          test.bob,
          test.bob.Result,
          test.tx,
          { _value: false });

        assertEvents (
          "test.insPromoToken.Transfer",
          test.insPromoToken,
          test.insPromoToken.Transfer,
          test.tx);
      }},
    { name: "Alise kills token contract",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.insPromoToken.kill (
          { from: test.alice, value: 0, gas: 1000000 });
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEquals (
          "web3.eth.getCode (test.insPromoToken.address)",
          "0x",
          web3.eth.getCode (test.insPromoToken.address));
      }}
  ]});
