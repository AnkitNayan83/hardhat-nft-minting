// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "base64-sol/base64.sol";

contract DynamicSvgNft is ERC721 {
    uint256 private s_tokenCounter;
    string private s_lowImageUri;
    string private s_highImageUri;
    // data:image/svg+xml;base64,(base64 code) will give us our image
    string private constant base64EncodedSvgPrefix =
        "data:image/svg+xml;base64,";
    AggregatorV3Interface internal immutable i_priceFeed;
    mapping(uint256 => int256) public s_tokenIdToHighValue;
    event CreatedNFT(uint256 indexed tokenId, int256 highValue);

    constructor(
        address priceFeed,
        string memory lowImageUri,
        string memory highImageUri
    ) ERC721("Dynamic Svg Nft", "DSN") {
        s_tokenCounter = 0;
        s_lowImageUri = svgToImageUri(lowImageUri);
        s_highImageUri = svgToImageUri(highImageUri);
        i_priceFeed = AggregatorV3Interface(priceFeed);
    }

    function svgToImageUri(
        string memory svg
    ) public pure returns (string memory) {
        //we need to add a dependency to convert svg to base64 code
        string memory svgBase64Encoded = Base64.encode(
            bytes(string(abi.encodePacked(svg)))
        );
        return
            string(abi.encodePacked(base64EncodedSvgPrefix, svgBase64Encoded));
    }

    function mintNft(int256 highValue) public {
        s_tokenIdToHighValue[s_tokenCounter] = highValue;
        _safeMint(msg.sender, s_tokenCounter);
        s_tokenCounter += 1;
        emit CreatedNFT(s_tokenCounter, highValue);
    }

    function _baseURI() internal pure override returns (string memory) {
        return "data:application/json;base64,";
    }

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        require(_exists(tokenId), "URI Query for nonexistent token");
        (, int256 price, , , ) = i_priceFeed.latestRoundData();
        string memory imageUri = s_lowImageUri;
        if (price >= s_tokenIdToHighValue[tokenId]) {
            imageUri = s_highImageUri;
        }
        return
            string(
                abi.encodePacked(
                    _baseURI(),
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"name":"',
                                name(),
                                '","description":"An NFT changes base on the ChainLink",',
                                '"attributes": [{"trait_type":"coolness","value":100}],"image":"',
                                imageUri,
                                '"}'
                            )
                        )
                    )
                )
            );
    }

    //getter functions
    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }

    function getLowImageUri() public view returns (string memory) {
        return s_lowImageUri;
    }

    function getHighImageUri() public view returns (string memory) {
        return s_highImageUri;
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return i_priceFeed;
    }
}
