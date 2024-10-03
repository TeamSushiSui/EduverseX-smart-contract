import express from 'express';
import Joi from 'joi';
import { NFT } from '../scripts/nft_interaction';
import 'dotenv/config';

// Create a router for NFT-related routes
export const nftRouter = express.Router();
nftRouter.use(express.json());

// Check for the presence of the private key
const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
  console.error('Error: Private key needed');
  process.exit(1);
}

const nft = new NFT(privateKey);

// Validation schemas
const createSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  image: Joi.string().required(),
});

const listForSaleSchema = Joi.object({
  id: Joi.string().required(),
  price: Joi.number().required(),
});

// Route: Get all NFTs in contract
nftRouter.get('/', async (req, res) => {
  try {
    const result = await nft.getAllNFTsDetails();
    if (!result) {
      return res.status(500).send('Error: Could not fetch data from server');
    }
    res.send(result);
  } catch (error) {
    res.status(500).send('Error: An unexpected error occurred');
  }
});

// Route: Get NFT detail using ID
nftRouter.get('/:id', async (req, res) => {
  try {
    const nftId = req.params.id;
    const response = await nft.getNFT(nftId);
    if (!response) return res.status(404).send('Error: NFT not found');
    
    res.send(response);
  } catch (error) {
    res.status(500).send('Error: An unexpected error occurred');
  }
});

// Route: Create a new NFT
nftRouter.post('/', async (req, res) => {
  const { error } = createSchema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  
  const { name, description, image } = req.body;
  try {
    const objectId = await nft.createNFT(name, description, image);
    if (!objectId) return res.status(500).send('Error: Failed to create NFT');
    
    const result = await nft.getNFT(objectId);
    res.send({ id: objectId, ...result });
  } catch (error) {
    res.status(500).send('Error: An unexpected error occurred');
  }
});

// Route: List an NFT for sale
nftRouter.put('/list-for-sale', async (req, res) => {
  const { error } = listForSaleSchema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  
  const { id, price } = req.body;
  try {
    const currentNFT = await nft.getNFT(id);
    if (!currentNFT) return res.status(404).send('Error: NFT not found');
    if (currentNFT.is_for_sale) return res.send(currentNFT);
    
    const response = await nft.listForSale(id, price);
    if (response) {
      currentNFT.price = price;
      currentNFT.is_for_sale = true;
      return res.send(currentNFT);
    }
    
    return res.status(500).send('Error: Could not list NFT for sale');
  } catch (error) {
    res.status(500).send('Error: An unexpected error occurred');
  }
});

// Route: Remove NFT from sale
nftRouter.put('/remove-from-sale', async (req, res) => {
  const schema = Joi.object({
    id: Joi.string().required(),
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  
  const { id } = req.body;
  try {
    const currentNFT = await nft.getNFT(id);
    if (!currentNFT) return res.status(404).send('Error: NFT not found');
    if (!currentNFT.is_for_sale) return res.send(currentNFT);
    
    const response = await nft.RemoveFromSale(id);
    if (response) {
      currentNFT.is_for_sale = false;
      return res.send(currentNFT);
    }
    
    return res.status(500).send('Error: Could not change NFT status');
  } catch (error) {
    res.status(500).send('Error: An unexpected error occurred');
  }
});