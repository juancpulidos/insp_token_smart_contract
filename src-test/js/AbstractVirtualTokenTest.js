/*
 * Test for Abstract Virtual Token Smart Contract.
 * Copyright © 2017 by ABDK Consulting.
 * Author: Mikhail Vladimirov <mikhail.vladimirov@gmail.com>
 */

tests.push ({
  name: "AbstractVirtualToken",
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
    { name: "Alice deploys AbstractVirtualTokenWrapper contract",
      body: function (test) {
        test.abstractVirtualTokenWrapperContract =
          loadContract ("AbstractVirtualTokenWrapper");
        var abstractVirtualTokenWrapperCode =
          loadContractCode ("AbstractVirtualTokenWrapper");

        personal.unlockAccount (test.alice, "");
        test.tx = test.abstractVirtualTokenWrapperContract.new (
          test.bob.address,
          1000000,
          {
            from: test.alice,
            data: abstractVirtualTokenWrapperCode,
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

        test.abstractVirtualTokenWrapper = getDeployedContract (
          "AbstractVirtualTokenWrapper",
          test.abstractVirtualTokenWrapperContract,
          test.tx);

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.totalSupply()",
          0,
          test.abstractVirtualTokenWrapper.totalSupply());
      }},
    { name: "Carol allows Bob to transfer 2 of her tokens",
      body: function (test) {
        assertBNEquals (
          "test.abstractVirtualTokenWrapper.allowance(test.carol.address, test.bob.address)",
          0,
          test.abstractVirtualTokenWrapper.allowance(test.carol.address, test.bob.address));

        personal.unlockAccount (test.alice, "");
        test.tx = test.carol.execute (
          test.abstractVirtualTokenWrapper.address,
          test.abstractVirtualTokenWrapper.approve.getData (
            test.bob.address, 2),
          0,
          { from: test.alice, gas: 1000000 });
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.carol.Result",
          test.carol,
          test.carol.Result,
          test.tx,
          { _value: true });

        assertEvents (
          "test.abstractVirtualTokenWrapper.Approval",
          test.abstractVirtualTokenWrapper,
          test.abstractVirtualTokenWrapper.Approval,
          test.tx,
          {
            _owner: test.carol.address,
            _spender: test.bob.address,
            _value: 2
          });

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.allowance(test.carol.address, test.bob.address)",
          2,
          test.abstractVirtualTokenWrapper.allowance(test.carol.address, test.bob.address));
      }},
    { name: "Bob tries to send 2 tokens to Dave but Bob does not have such many tokens",
      body: function (test) {
        assertBNEquals (
          "test.abstractVirtualTokenWrapper.totalSupply()",
          0,
          test.abstractVirtualTokenWrapper.totalSupply());

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.balanceOf(test.bob.address)",
          0,
          test.abstractVirtualTokenWrapper.balanceOf(test.bob.address));

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.balanceOf(test.dave.address)",
          0,
          test.abstractVirtualTokenWrapper.balanceOf(test.dave.address));

        personal.unlockAccount (test.alice, "");
        test.tx = test.bob.execute (
          test.abstractVirtualTokenWrapper.address,
          test.abstractVirtualTokenWrapper.transfer.getData (
            test.dave.address, 2),
          0,
          { from: test.alice, gas: 1000000 });
      }},
    { name: "Make sure transaction succeeded but no events were logged",
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
          { _value: true });

        assertEvents (
          "test.abstractVirtualTokenWrapper.Result",
          test.abstractVirtualTokenWrapper,
          test.abstractVirtualTokenWrapper.Result,
          test.tx,
          { _value: false });

        assertEvents (
          "test.abstractVirtualTokenWrapper.Transfer",
          test.abstractVirtualTokenWrapper,
          test.abstractVirtualTokenWrapper.Transfer,
          test.tx);

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.totalSupply()",
          0,
          test.abstractVirtualTokenWrapper.totalSupply());

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.balanceOf(test.bob.address)",
          0,
          test.abstractVirtualTokenWrapper.balanceOf(test.bob.address));

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.balanceOf(test.dave.address)",
          0,
          test.abstractVirtualTokenWrapper.balanceOf(test.dave.address));
      }},
    { name: "Bob sends zero tokens to Dave",
      body: function (test) {
        assertBNEquals (
          "test.abstractVirtualTokenWrapper.totalSupply()",
          0,
          test.abstractVirtualTokenWrapper.totalSupply());

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.balanceOf(test.bob.address)",
          0,
          test.abstractVirtualTokenWrapper.balanceOf(test.bob.address));

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.balanceOf(test.dave.address)",
          0,
          test.abstractVirtualTokenWrapper.balanceOf(test.dave.address));

        personal.unlockAccount (test.alice, "");
        test.tx = test.bob.execute (
          test.abstractVirtualTokenWrapper.address,
          test.abstractVirtualTokenWrapper.transfer.getData (
            test.dave.address, 0),
          0,
          { from: test.alice, gas: 1000000 });
      }},
    { name: "Make sure transaction succeeded but no events were logged",
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
          { _value: true });

        assertEvents (
          "test.abstractVirtualTokenWrapper.Result",
          test.abstractVirtualTokenWrapper,
          test.abstractVirtualTokenWrapper.Result,
          test.tx,
          { _value: true });

        assertEvents (
          "test.abstractVirtualTokenWrapper.Transfer",
          test.abstractVirtualTokenWrapper,
          test.abstractVirtualTokenWrapper.Transfer,
          test.tx);

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.totalSupply()",
          0,
          test.abstractVirtualTokenWrapper.totalSupply());

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.balanceOf(test.bob.address)",
          0,
          test.abstractVirtualTokenWrapper.balanceOf(test.bob.address));

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.balanceOf(test.dave.address)",
          0,
          test.abstractVirtualTokenWrapper.balanceOf(test.dave.address));
      }},
    { name: "Bob tries to send 2 tokens from Carol to Dave",
      body: function (test) {
        assertBNEquals (
          "test.abstractVirtualTokenWrapper.totalSupply()",
          0,
          test.abstractVirtualTokenWrapper.totalSupply());

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.balanceOf(test.carol.address)",
          0,
          test.abstractVirtualTokenWrapper.balanceOf(test.carol.address));

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.balanceOf(test.dave.address)",
          0,
          test.abstractVirtualTokenWrapper.balanceOf(test.dave.address));

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.allowance(test.carol.address, test.bob.address)",
          2,
          test.abstractVirtualTokenWrapper.allowance(test.carol.address, test.bob.address));

        personal.unlockAccount (test.alice, "");
        test.tx = test.bob.execute (
          test.abstractVirtualTokenWrapper.address,
          test.abstractVirtualTokenWrapper.transferFrom.getData (
            test.carol.address, test.dave.address, 2),
          0,
          { from: test.alice, gas: 1000000 });
      }},
    { name: "Make sure transaction succeeded but no events were logged",
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
          { _value: true });

        assertEvents (
          "test.abstractVirtualTokenWrapper.Result",
          test.abstractVirtualTokenWrapper,
          test.abstractVirtualTokenWrapper.Result,
          test.tx,
          { _value: false });

        assertEvents (
          "test.abstractVirtualTokenWrapper.Transfer",
          test.abstractVirtualTokenWrapper,
          test.abstractVirtualTokenWrapper.Transfer,
          test.tx);

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.totalSupply()",
          0,
          test.abstractVirtualTokenWrapper.totalSupply());

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.balanceOf(test.carol.address)",
          0,
          test.abstractVirtualTokenWrapper.balanceOf(test.carol.address));

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.balanceOf(test.dave.address)",
          0,
          test.abstractVirtualTokenWrapper.balanceOf(test.dave.address));

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.allowance(test.carol.address, test.bob.address)",
          2,
          test.abstractVirtualTokenWrapper.allowance(test.carol.address, test.bob.address));
      }},
    { name: "Bob sends zero tokens from Carol to Dave",
      body: function (test) {
        assertBNEquals (
          "test.abstractVirtualTokenWrapper.totalSupply()",
          0,
          test.abstractVirtualTokenWrapper.totalSupply());

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.balanceOf(test.carol.address)",
          0,
          test.abstractVirtualTokenWrapper.balanceOf(test.carol.address));

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.balanceOf(test.dave.address)",
          0,
          test.abstractVirtualTokenWrapper.balanceOf(test.dave.address));

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.allowance(test.carol.address, test.bob.address)",
          2,
          test.abstractVirtualTokenWrapper.allowance(test.carol.address, test.bob.address));

        personal.unlockAccount (test.alice, "");
        test.tx = test.bob.execute (
          test.abstractVirtualTokenWrapper.address,
          test.abstractVirtualTokenWrapper.transferFrom.getData (
            test.carol.address, test.dave.address, 0),
          0,
          { from: test.alice, gas: 1000000 });
      }},
    { name: "Make sure transaction succeeded but no events were logged",
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
          { _value: true });

        assertEvents (
          "test.abstractVirtualTokenWrapper.Result",
          test.abstractVirtualTokenWrapper,
          test.abstractVirtualTokenWrapper.Result,
          test.tx,
          { _value: true });

        assertEvents (
          "test.abstractVirtualTokenWrapper.Transfer",
          test.abstractVirtualTokenWrapper,
          test.abstractVirtualTokenWrapper.Transfer,
          test.tx);

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.totalSupply()",
          0,
          test.abstractVirtualTokenWrapper.totalSupply());

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.balanceOf(test.carol.address)",
          0,
          test.abstractVirtualTokenWrapper.balanceOf(test.carol.address));

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.balanceOf(test.dave.address)",
          0,
          test.abstractVirtualTokenWrapper.balanceOf(test.dave.address));

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.allowance(test.carol.address, test.bob.address)",
          2,
          test.abstractVirtualTokenWrapper.allowance(test.carol.address, test.bob.address));
      }},
    { name: "Alice sets Bobs virtual balance to 1",
      body: function (test) {
        assertBNEquals (
          "test.abstractVirtualTokenWrapper.totalSupply()",
          0,
          test.abstractVirtualTokenWrapper.totalSupply());

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.balanceOf(test.bob.address)",
          0,
          test.abstractVirtualTokenWrapper.balanceOf(test.bob.address));

        personal.unlockAccount (test.alice, "");
        test.tx = test.abstractVirtualTokenWrapper.setVirtualBalance (
          test.bob.address,
          1,
          { from: test.alice, gas: 1000000 });
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.totalSupply()",
          0,
          test.abstractVirtualTokenWrapper.totalSupply());

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.balanceOf(test.bob.address)",
          1,
          test.abstractVirtualTokenWrapper.balanceOf(test.bob.address));
      }},
    { name: "Alice sets Carol's virtual balance to 1",
      body: function (test) {
        assertBNEquals (
          "test.abstractVirtualTokenWrapper.totalSupply()",
          0,
          test.abstractVirtualTokenWrapper.totalSupply());

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.balanceOf(test.carol.address)",
          0,
          test.abstractVirtualTokenWrapper.balanceOf(test.carol.address));

        personal.unlockAccount (test.alice, "");
        test.tx = test.abstractVirtualTokenWrapper.setVirtualBalance (
          test.carol.address,
          1,
          { from: test.alice, gas: 1000000 });
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.totalSupply()",
          0,
          test.abstractVirtualTokenWrapper.totalSupply());

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.balanceOf(test.carol.address)",
          1,
          test.abstractVirtualTokenWrapper.balanceOf(test.carol.address));
      }},
    { name: "Bob tries to send 2 tokens to Dave but Bob does not have such many tokens",
      body: function (test) {
        assertBNEquals (
          "test.abstractVirtualTokenWrapper.totalSupply()",
          0,
          test.abstractVirtualTokenWrapper.totalSupply());

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.balanceOf(test.bob.address)",
          1,
          test.abstractVirtualTokenWrapper.balanceOf(test.bob.address));

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.balanceOf(test.dave.address)",
          0,
          test.abstractVirtualTokenWrapper.balanceOf(test.dave.address));

        personal.unlockAccount (test.alice, "");
        test.tx = test.bob.execute (
          test.abstractVirtualTokenWrapper.address,
          test.abstractVirtualTokenWrapper.transfer.getData (
            test.dave.address, 2),
          0,
          { from: test.alice, gas: 1000000 });
      }},
    { name: "Make sure transaction succeeded but no events were logged",
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
          { _value: true });

        assertEvents (
          "test.abstractVirtualTokenWrapper.Result",
          test.abstractVirtualTokenWrapper,
          test.abstractVirtualTokenWrapper.Result,
          test.tx,
          { _value: false });

        assertEvents (
          "test.abstractVirtualTokenWrapper.Transfer",
          test.abstractVirtualTokenWrapper,
          test.abstractVirtualTokenWrapper.Transfer,
          test.tx);

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.totalSupply()",
          0,
          test.abstractVirtualTokenWrapper.totalSupply());

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.balanceOf(test.bob.address)",
          1,
          test.abstractVirtualTokenWrapper.balanceOf(test.bob.address));

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.balanceOf(test.dave.address)",
          0,
          test.abstractVirtualTokenWrapper.balanceOf(test.dave.address));
      }},
    { name: "Bob tries to send 2 tokens from Carol to Dave",
      body: function (test) {
        assertBNEquals (
          "test.abstractVirtualTokenWrapper.totalSupply()",
          0,
          test.abstractVirtualTokenWrapper.totalSupply());

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.balanceOf(test.carol.address)",
          1,
          test.abstractVirtualTokenWrapper.balanceOf(test.carol.address));

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.balanceOf(test.dave.address)",
          0,
          test.abstractVirtualTokenWrapper.balanceOf(test.dave.address));

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.allowance(test.carol.address, test.bob.address)",
          2,
          test.abstractVirtualTokenWrapper.allowance(test.carol.address, test.bob.address));

        personal.unlockAccount (test.alice, "");
        test.tx = test.bob.execute (
          test.abstractVirtualTokenWrapper.address,
          test.abstractVirtualTokenWrapper.transferFrom.getData (
            test.carol.address, test.dave.address, 2),
          0,
          { from: test.alice, gas: 1000000 });
      }},
    { name: "Make sure transaction succeeded but no events were logged",
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
          { _value: true });

        assertEvents (
          "test.abstractVirtualTokenWrapper.Result",
          test.abstractVirtualTokenWrapper,
          test.abstractVirtualTokenWrapper.Result,
          test.tx,
          { _value: false });

        assertEvents (
          "test.abstractVirtualTokenWrapper.Transfer",
          test.abstractVirtualTokenWrapper,
          test.abstractVirtualTokenWrapper.Transfer,
          test.tx);

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.totalSupply()",
          0,
          test.abstractVirtualTokenWrapper.totalSupply());

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.balanceOf(test.carol.address)",
          1,
          test.abstractVirtualTokenWrapper.balanceOf(test.carol.address));

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.balanceOf(test.dave.address)",
          0,
          test.abstractVirtualTokenWrapper.balanceOf(test.dave.address));

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.allowance(test.carol.address, test.bob.address)",
          2,
          test.abstractVirtualTokenWrapper.allowance(test.carol.address, test.bob.address));
      }},
    { name: "Alice sets Bobs virtual balance to 2",
      body: function (test) {
        assertBNEquals (
          "test.abstractVirtualTokenWrapper.totalSupply()",
          0,
          test.abstractVirtualTokenWrapper.totalSupply());

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.balanceOf(test.bob.address)",
          1,
          test.abstractVirtualTokenWrapper.balanceOf(test.bob.address));

        personal.unlockAccount (test.alice, "");
        test.tx = test.abstractVirtualTokenWrapper.setVirtualBalance (
          test.bob.address,
          2,
          { from: test.alice, gas: 1000000 });
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.totalSupply()",
          0,
          test.abstractVirtualTokenWrapper.totalSupply());

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.balanceOf(test.bob.address)",
          2,
          test.abstractVirtualTokenWrapper.balanceOf(test.bob.address));
      }},
    { name: "Alice sets Carol's virtual balance to 3",
      body: function (test) {
        assertBNEquals (
          "test.abstractVirtualTokenWrapper.totalSupply()",
          0,
          test.abstractVirtualTokenWrapper.totalSupply());

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.balanceOf(test.carol.address)",
          1,
          test.abstractVirtualTokenWrapper.balanceOf(test.carol.address));

        personal.unlockAccount (test.alice, "");
        test.tx = test.abstractVirtualTokenWrapper.setVirtualBalance (
          test.carol.address,
          3,
          { from: test.alice, gas: 1000000 });
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.totalSupply()",
          0,
          test.abstractVirtualTokenWrapper.totalSupply());

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.balanceOf(test.carol.address)",
          3,
          test.abstractVirtualTokenWrapper.balanceOf(test.carol.address));
      }},
    { name: "Bob sends 2 virtual tokens to Dave",
      body: function (test) {
        assertBNEquals (
          "test.abstractVirtualTokenWrapper.totalSupply()",
          0,
          test.abstractVirtualTokenWrapper.totalSupply());

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.balanceOf(test.bob.address)",
          2,
          test.abstractVirtualTokenWrapper.balanceOf(test.bob.address));

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.balanceOf(test.dave.address)",
          0,
          test.abstractVirtualTokenWrapper.balanceOf(test.dave.address));

        personal.unlockAccount (test.alice, "");
        test.tx = test.bob.execute (
          test.abstractVirtualTokenWrapper.address,
          test.abstractVirtualTokenWrapper.transfer.getData (
            test.dave.address, 2),
          0,
          { from: test.alice, gas: 1000000 });
      }},
    { name: "Make sure transaction succeeded and two tokens were materialized",
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
          { _value: true });

        assertEvents (
          "test.abstractVirtualTokenWrapper.Result",
          test.abstractVirtualTokenWrapper,
          test.abstractVirtualTokenWrapper.Result,
          test.tx,
          { _value: true });

        assertEvents (
          "test.abstractVirtualTokenWrapper.Transfer",
          test.abstractVirtualTokenWrapper,
          test.abstractVirtualTokenWrapper.Transfer,
          test.tx,
          {
            _from: test.bob.address,
            _to: test.dave.address,
            _value: 2
          });

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.totalSupply()",
          2,
          test.abstractVirtualTokenWrapper.totalSupply());

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.balanceOf(test.bob.address)",
          0,
          test.abstractVirtualTokenWrapper.balanceOf(test.bob.address));

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.balanceOf(test.dave.address)",
          2,
          test.abstractVirtualTokenWrapper.balanceOf(test.dave.address));
      }},
    { name: "Bob tries to send 3 virtual tokens from Carol to Dave but he is allowed to transfer only 2",
      body: function (test) {
        assertBNEquals (
          "test.abstractVirtualTokenWrapper.totalSupply()",
          2,
          test.abstractVirtualTokenWrapper.totalSupply());

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.balanceOf(test.carol.address)",
          3,
          test.abstractVirtualTokenWrapper.balanceOf(test.carol.address));

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.balanceOf(test.dave.address)",
          2,
          test.abstractVirtualTokenWrapper.balanceOf(test.dave.address));

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.allowance(test.carol.address, test.bob.address)",
          2,
          test.abstractVirtualTokenWrapper.allowance(test.carol.address, test.bob.address));

        personal.unlockAccount (test.alice, "");
        test.tx = test.bob.execute (
          test.abstractVirtualTokenWrapper.address,
          test.abstractVirtualTokenWrapper.transferFrom.getData (
            test.carol.address, test.dave.address, 3),
          0,
          { from: test.alice, gas: 1000000 });
      }},
    { name: "Make sure transaction succeeded but no events were logged",
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
          { _value: true });

        assertEvents (
          "test.abstractVirtualTokenWrapper.Result",
          test.abstractVirtualTokenWrapper,
          test.abstractVirtualTokenWrapper.Result,
          test.tx,
          { _value: false });

        assertEvents (
          "test.abstractVirtualTokenWrapper.Transfer",
          test.abstractVirtualTokenWrapper,
          test.abstractVirtualTokenWrapper.Transfer,
          test.tx);

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.totalSupply()",
          2,
          test.abstractVirtualTokenWrapper.totalSupply());

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.balanceOf(test.carol.address)",
          3,
          test.abstractVirtualTokenWrapper.balanceOf(test.carol.address));

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.balanceOf(test.dave.address)",
          2,
          test.abstractVirtualTokenWrapper.balanceOf(test.dave.address));

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.allowance(test.carol.address, test.bob.address)",
          2,
          test.abstractVirtualTokenWrapper.allowance(test.carol.address, test.bob.address));
      }},
    { name: "Bob sends 2 virtual tokens from Carol to Dave",
      body: function (test) {
        assertBNEquals (
          "test.abstractVirtualTokenWrapper.totalSupply()",
          2,
          test.abstractVirtualTokenWrapper.totalSupply());

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.balanceOf(test.carol.address)",
          3,
          test.abstractVirtualTokenWrapper.balanceOf(test.carol.address));

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.balanceOf(test.dave.address)",
          2,
          test.abstractVirtualTokenWrapper.balanceOf(test.dave.address));

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.allowance(test.carol.address, test.bob.address)",
          2,
          test.abstractVirtualTokenWrapper.allowance(test.carol.address, test.bob.address));

        personal.unlockAccount (test.alice, "");
        test.tx = test.bob.execute (
          test.abstractVirtualTokenWrapper.address,
          test.abstractVirtualTokenWrapper.transferFrom.getData (
            test.carol.address, test.dave.address, 2),
          0,
          { from: test.alice, gas: 1000000 });
      }},
    { name: "Make sure transaction succeeded and three tokens were materialized",
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
          { _value: true });

        assertEvents (
          "test.abstractVirtualTokenWrapper.Result",
          test.abstractVirtualTokenWrapper,
          test.abstractVirtualTokenWrapper.Result,
          test.tx,
          { _value: true });

        assertEvents (
          "test.abstractVirtualTokenWrapper.Transfer",
          test.abstractVirtualTokenWrapper,
          test.abstractVirtualTokenWrapper.Transfer,
          test.tx,
          {
            _from: test.carol.address,
            _to: test.dave.address,
            _value: 2
          });

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.totalSupply()",
          5,
          test.abstractVirtualTokenWrapper.totalSupply());

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.balanceOf(test.carol.address)",
          1,
          test.abstractVirtualTokenWrapper.balanceOf(test.carol.address));

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.balanceOf(test.dave.address)",
          4,
          test.abstractVirtualTokenWrapper.balanceOf(test.dave.address));

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.allowance(test.carol.address, test.bob.address)",
          0,
          test.abstractVirtualTokenWrapper.allowance(test.carol.address, test.bob.address));
      }},
    { name: "Bob tries to send 1 token to Dave but he does not have any tokens and his virtual balance is already materialized",
      body: function (test) {
        assertBNEquals (
          "test.abstractVirtualTokenWrapper.totalSupply()",
          5,
          test.abstractVirtualTokenWrapper.totalSupply());

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.balanceOf(test.bob.address)",
          0,
          test.abstractVirtualTokenWrapper.balanceOf(test.bob.address));

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.balanceOf(test.dave.address)",
          4,
          test.abstractVirtualTokenWrapper.balanceOf(test.dave.address));

        personal.unlockAccount (test.alice, "");
        test.tx = test.bob.execute (
          test.abstractVirtualTokenWrapper.address,
          test.abstractVirtualTokenWrapper.transfer.getData (
            test.dave.address, 1),
          0,
          { from: test.alice, gas: 1000000 });
      }},
    { name: "Make sure transaction succeeded but no events were logged",
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
          { _value: true });

        assertEvents (
          "test.abstractVirtualTokenWrapper.Result",
          test.abstractVirtualTokenWrapper,
          test.abstractVirtualTokenWrapper.Result,
          test.tx,
          { _value: false });

        assertEvents (
          "test.abstractVirtualTokenWrapper.Transfer",
          test.abstractVirtualTokenWrapper,
          test.abstractVirtualTokenWrapper.Transfer,
          test.tx);

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.totalSupply()",
          5,
          test.abstractVirtualTokenWrapper.totalSupply());

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.balanceOf(test.bob.address)",
          0,
          test.abstractVirtualTokenWrapper.balanceOf(test.bob.address));

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.balanceOf(test.dave.address)",
          4,
          test.abstractVirtualTokenWrapper.balanceOf(test.dave.address));
      }},
    { name: "Carol allows Bob to transfer 2 of her tokens",
      body: function (test) {
        assertBNEquals (
          "test.abstractVirtualTokenWrapper.allowance(test.carol.address, test.bob.address)",
          0,
          test.abstractVirtualTokenWrapper.allowance(test.carol.address, test.bob.address));

        personal.unlockAccount (test.alice, "");
        test.tx = test.carol.execute (
          test.abstractVirtualTokenWrapper.address,
          test.abstractVirtualTokenWrapper.approve.getData (
            test.bob.address, 2),
          0,
          { from: test.alice, gas: 1000000 });
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.carol.Result",
          test.carol,
          test.carol.Result,
          test.tx,
          { _value: true });

        assertEvents (
          "test.abstractVirtualTokenWrapper.Approval",
          test.abstractVirtualTokenWrapper,
          test.abstractVirtualTokenWrapper.Approval,
          test.tx,
          {
            _owner: test.carol.address,
            _spender: test.bob.address,
            _value: 2
          });

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.allowance(test.carol.address, test.bob.address)",
          2,
          test.abstractVirtualTokenWrapper.allowance(test.carol.address, test.bob.address));
      }},
    { name: "Bob tries to send 2 tokens from Carol to Dave but she does not have such many tokens and her virtual balance is already meterialized",
      body: function (test) {
        assertBNEquals (
          "test.abstractVirtualTokenWrapper.totalSupply()",
          5,
          test.abstractVirtualTokenWrapper.totalSupply());

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.balanceOf(test.carol.address)",
          1,
          test.abstractVirtualTokenWrapper.balanceOf(test.carol.address));

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.balanceOf(test.dave.address)",
          4,
          test.abstractVirtualTokenWrapper.balanceOf(test.dave.address));

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.allowance(test.carol.address, test.bob.address)",
          2,
          test.abstractVirtualTokenWrapper.allowance(test.carol.address, test.bob.address));

        personal.unlockAccount (test.alice, "");
        test.tx = test.bob.execute (
          test.abstractVirtualTokenWrapper.address,
          test.abstractVirtualTokenWrapper.transferFrom.getData (
            test.carol.address, test.dave.address, 2),
          0,
          { from: test.alice, gas: 1000000 });
      }},
    { name: "Make sure transaction succeeded but no events were logged",
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
          { _value: true });

        assertEvents (
          "test.abstractVirtualTokenWrapper.Result",
          test.abstractVirtualTokenWrapper,
          test.abstractVirtualTokenWrapper.Result,
          test.tx,
          { _value: false });

        assertEvents (
          "test.abstractVirtualTokenWrapper.Transfer",
          test.abstractVirtualTokenWrapper,
          test.abstractVirtualTokenWrapper.Transfer,
          test.tx);

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.totalSupply()",
          5,
          test.abstractVirtualTokenWrapper.totalSupply());

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.balanceOf(test.carol.address)",
          1,
          test.abstractVirtualTokenWrapper.balanceOf(test.carol.address));

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.balanceOf(test.dave.address)",
          4,
          test.abstractVirtualTokenWrapper.balanceOf(test.dave.address));

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.allowance(test.carol.address, test.bob.address)",
          2,
          test.abstractVirtualTokenWrapper.allowance(test.carol.address, test.bob.address));
      }},
    { name: "Alice sets Dave's virtual balance to 5",
      body: function (test) {
        assertBNEquals (
          "test.abstractVirtualTokenWrapper.totalSupply()",
          5,
          test.abstractVirtualTokenWrapper.totalSupply());

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.balanceOf(test.dave.address)",
          4,
          test.abstractVirtualTokenWrapper.balanceOf(test.dave.address));

        personal.unlockAccount (test.alice, "");
        test.tx = test.abstractVirtualTokenWrapper.setVirtualBalance (
          test.dave.address,
          5,
          { from: test.alice, gas: 1000000 });
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.totalSupply()",
          5,
          test.abstractVirtualTokenWrapper.totalSupply());

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.balanceOf(test.dave.address)",
          9,
          test.abstractVirtualTokenWrapper.balanceOf(test.dave.address));
      }},
    { name: "Alice sets Dave's virtual balance to 2^255-1",
      body: function (test) {
        assertBNEquals (
          "test.abstractVirtualTokenWrapper.totalSupply()",
          5,
          test.abstractVirtualTokenWrapper.totalSupply());

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.balanceOf(test.dave.address)",
          9,
          test.abstractVirtualTokenWrapper.balanceOf(test.dave.address));

        personal.unlockAccount (test.alice, "");
        test.tx = test.abstractVirtualTokenWrapper.setVirtualBalance (
          test.dave.address,
          "0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
          { from: test.alice, gas: 1000000 });
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.totalSupply()",
          5,
          test.abstractVirtualTokenWrapper.totalSupply());

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.balanceOf(test.dave.address)",
          "0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFE",
          test.abstractVirtualTokenWrapper.balanceOf(test.dave.address));
      }},
    { name: "Dave sends 3 real tokens to Bob",
      body: function (test) {
        assertBNEquals (
          "test.abstractVirtualTokenWrapper.totalSupply()",
          5,
          test.abstractVirtualTokenWrapper.totalSupply());

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.balanceOf(test.bob.address)",
          0,
          test.abstractVirtualTokenWrapper.balanceOf(test.bob.address));

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.balanceOf(test.dave.address)",
          "0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFE",
          test.abstractVirtualTokenWrapper.balanceOf(test.dave.address));

        personal.unlockAccount (test.alice, "");
        test.tx = test.dave.execute (
          test.abstractVirtualTokenWrapper.address,
          test.abstractVirtualTokenWrapper.transfer.getData (
            test.bob.address, 3),
          0,
          { from: test.alice, gas: 1000000 });
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.dave.Result",
          test.dave,
          test.dave.Result,
          test.tx,
          { _value: true });

        assertEvents (
          "test.abstractVirtualTokenWrapper.Result",
          test.abstractVirtualTokenWrapper,
          test.abstractVirtualTokenWrapper.Result,
          test.tx,
          { _value: true });

        assertEvents (
          "test.abstractVirtualTokenWrapper.Transfer",
          test.abstractVirtualTokenWrapper,
          test.abstractVirtualTokenWrapper.Transfer,
          test.tx,
          {
            _from: test.dave.address,
            _to: test.bob.address,
            _value: 3
          });

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.totalSupply()",
          5,
          test.abstractVirtualTokenWrapper.totalSupply());

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.balanceOf(test.bob.address)",
          3,
          test.abstractVirtualTokenWrapper.balanceOf(test.bob.address));

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.balanceOf(test.dave.address)",
          "0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFB",
          test.abstractVirtualTokenWrapper.balanceOf(test.dave.address));
      }},
    { name: "Dave sends 1 real and 2 virtual tokens to Bob",
      body: function (test) {
        assertBNEquals (
          "test.abstractVirtualTokenWrapper.totalSupply()",
          5,
          test.abstractVirtualTokenWrapper.totalSupply());

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.balanceOf(test.bob.address)",
          3,
          test.abstractVirtualTokenWrapper.balanceOf(test.bob.address));

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.balanceOf(test.dave.address)",
          "0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFB",
          test.abstractVirtualTokenWrapper.balanceOf(test.dave.address));

        personal.unlockAccount (test.alice, "");
        test.tx = test.dave.execute (
          test.abstractVirtualTokenWrapper.address,
          test.abstractVirtualTokenWrapper.transfer.getData (
            test.bob.address, 3),
          0,
          { from: test.alice, gas: 1000000 });
      }},
    { name: "Make sure transaction succeeded and 2^255-5 tokens were materialized",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.dave.Result",
          test.dave,
          test.dave.Result,
          test.tx,
          { _value: true });

        assertEvents (
          "test.abstractVirtualTokenWrapper.Result",
          test.abstractVirtualTokenWrapper,
          test.abstractVirtualTokenWrapper.Result,
          test.tx,
          { _value: true });

        assertEvents (
          "test.abstractVirtualTokenWrapper.Transfer",
          test.abstractVirtualTokenWrapper,
          test.abstractVirtualTokenWrapper.Transfer,
          test.tx,
          {
            _from: test.dave.address,
            _to: test.bob.address,
            _value: 3
          });

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.totalSupply()",
          "0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
          test.abstractVirtualTokenWrapper.totalSupply());

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.balanceOf(test.bob.address)",
          6,
          test.abstractVirtualTokenWrapper.balanceOf(test.bob.address));

        assertBNEquals (
          "test.abstractVirtualTokenWrapper.balanceOf(test.dave.address)",
          "0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF8",
          test.abstractVirtualTokenWrapper.balanceOf(test.dave.address));
      }}
  ]});