const { assert } = require("chai");
const { network, getNamedAccounts, ethers, deployments } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("BasicNft", () => {
      let basicNft, deployer;
      beforeEach(async () => {
        const accounts = await ethers.getSigners();
        deployer = accounts[0];
        await deployments.fixture(["basicnft"]);
        basicNft = await ethers.getContract("BasicNft");
      });

      //Test 1
      describe("constructor", () => {
        it("Should set value of token counter to zero", async () => {
          const tokenCounter = await basicNft.getTokenCounter();
          assert.equal(tokenCounter, 0);
        });
        it("Should set name and symbol of the NFT", async () => {
          const name = await basicNft.name();
          const symbol = await basicNft.symbol();
          assert.equal(name, "Doge");
          assert.equal(symbol, "Dog");
        });
      });

      //Test 2
      describe("mintNft", () => {
        beforeEach(async () => {
          const tx = await basicNft.mintNft();
          await tx.wait(1);
        });
        it("Allows users to mint", async () => {
          const tokenURI = await basicNft.tokenURI(0);
          const tokenCounter = await basicNft.getTokenCounter();
          assert.equal(tokenCounter.toString(), "1");
          assert.equal(tokenURI, await basicNft.TOKEN_URI());
        });
        it("Show the correct balance and owner of an NFT", async () => {
          const deployerAddress = deployer.address;
          const deployerBalance = await basicNft.balanceOf(deployerAddress);
          const owner = await basicNft.ownerOf("0");
          assert.equal(deployerBalance.toString(), "1");
          assert.equal(owner, deployerAddress);
        });
      });
    });
