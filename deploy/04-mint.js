const { ethers, network } = require("hardhat");

module.exports = async function ({ getNamedAccounts }) {
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  /*Basic Nft*/
  const basicNft = await ethers.getContract("BasicNft", deployer);
  const basicNftTx = await basicNft.mintNft();
  await basicNftTx.wait(1);
  console.log(`Basic NFT index 0 has tokenURI ${await basicNft.tokenURI(0)}`);

  /**Dynamic Nft */

  const highValue = ethers.utils.parseEther("4000");
  const dynamicSvgNft = await ethers.getContract("DynamicSvgNft", deployer);
  const dynamicTx = await dynamicSvgNft.mintNft(highValue);
  await dynamicTx.wait(1);
  console.log(
    `Dynamic SVG NFT index 0 tokenURI: ${await dynamicSvgNft.tokenURI(0)}`
  );

  /*Random NFT*/
  const randomIpfsNft = await ethers.getContract("RandomIpfsNft", deployer);
  const mintFee = await randomIpfsNft.getMintFee();
  const randomIpfsNftMintTx = await randomIpfsNft.requestNft({
    value: mintFee.toString(),
  });
  const randomIpfsNftMintTxReceipt = await randomIpfsNftMintTx.wait(1);
  //listener for mintNft
  await new Promise(async (resolve, reject) => {
    setTimeout(() => reject("Timeout: MINT NFT event dit not fire"), 300000);
    randomIpfsNft.once("NftMinted", async () => {
      resolve();
    });
    if (chainId == 31337) {
      const requestId =
        randomIpfsNftMintTxReceipt.events[1].args.requestId.toString();

      const vrfCoordinatorV2Mock = await ethers.getContract(
        "VRFCoordinatorV2Mock",
        deployer
      );
      await vrfCoordinatorV2Mock.fulfillRandomWords(
        requestId,
        randomIpfsNft.address
      );
    }
  });
  console.log(
    `Random IPFS NFT index 0 tokenURI: ${await randomIpfsNft.tokenURI(0)}`
  );
};

module.exports.tags = ["all", "mint"];
