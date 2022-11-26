const pinataSdk = require("@pinata/sdk");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_API_SECRET = process.env.PINATA_API_SECRET;
const pinata = new pinataSdk(PINATA_API_KEY, PINATA_API_SECRET);

async function storeImages(imagesFilePath) {
  console.log("Uploading to IPFS");

  const fullImagesPath = path.resolve(imagesFilePath);

  const files = fs.readdirSync(fullImagesPath);

  let responses = [];

  for (const fileIndex in files) {
    const readableStreamForFiles = fs.createReadStream(
      `${fullImagesPath}/${files[fileIndex]}`
    );
    const options = {
      pinataMetadata: {
        name: files[fileIndex],
      },
    };
    try {
      await pinata
        .pinFileToIPFS(readableStreamForFiles, options)
        .then((res) => {
          responses.push(res);
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (err) {
      console.log(err);
    }
  }
  return { responses, files };
}

async function storeTokenUriMetadata(metadata) {
  const options = {
    pinataMetadata: {
      name: metadata.name,
    },
  };
  try {
    const res = await pinata.pinJSONToIPFS(metadata, options);
    return res;
  } catch (error) {
    console.log(error);
  }
  return null;
}

module.exports = { storeImages, storeTokenUriMetadata };
