import express from 'express'
import Joi from 'joi'
import { NFT } from '../scripts/nft_interaction'
import "dotenv/config";


export const nftRouter = express.Router()
nftRouter.use(express.json())

const private_key = process.env.PRIVATE_KEY
if (!private_key) {
  console.log('Error: Private key needed')
  process.exit(1)
}

const nft = new NFT(private_key)

// Gets all nft in contract
nftRouter.get('/', async (req, res) => {
  const result = await nft.getAllNFTsDetails()
  if (result == undefined) {
    return res.status(500).send('could fetch data, server-side')
  }
    res.send(result)
  }
)

// Get a nft detail using id (object id)
nftRouter.get('/:id', async (req, res) => {
  const response = await nft.getNFT(req.params.id)
  if (!response) return res.status(404).send('Error: object not found')
  
  res.send(response)
  }
)

// Creates a new nft
const createSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  image: Joi.string().required()
})
 
// nftRouter.post('/', async (req, res) => { 
//   const { error } = createSchema.validate(req.body)
//   if ( error ) return res.status(400).send(error.details[0].message)
  
//   const { name, description, image } = req.body
//   const objectId = await nft.createNFT(name, description, image)

//   if (!objectId) return res.status(500).send('Error: failed to create nft')
  
//   const result = await nft.getNFT(objectId)
//   if (!result) return res.status(200).send({id: objectId})
  
//   res.send({id: objectId, ...result})
//   }
// )


// List an nft for sale
nftRouter.put('/list-for-sale', async (req, res) => {
  const schema = Joi.object({
    id: Joi.string(),
    price: Joi.number()
  })

  const { error } = schema.validate(req.body)
  if (error) return res.staus(400).send(error.details[0].message)
  
  const { id, price } = req.body
  const currentNFT = await nft.getNFT(id)
  if (!currentNFT) return res.status(404).send('Error: object not found')
  if (currentNFT.is_for_sale) return res.send(currentNFT)
  
  const response = await nft.listForSale(id, price)

  if (response) {
    currentNFT.price = price
    currentNFT.is_for_sale = true
    return res.send(currentNFT)
  }
  
  return res.status(500).send('Error: could not make nft change')
  }
)

// Removes nft from sales
nftRouter.put('/remove-from-sale', async (req, res) => {
  const schema = Joi.object({
    id: Joi.string(),
    price: Joi.number()
  })

  const { error } = schema.validate(req.body)
  if (error) return res.staus(400).send(error.details[0].message)
  
  const { id, price } = req.body
  const currentNFT = await nft.getNFT(id)
  
  if (!currentNFT) return res.status(404).send('Error: object not found')
  if (!currentNFT.is_for_sale) return res.send(currentNFT)
  
  const response = await nft.RemoveFromSale(id)

  if (response) {
    currentNFT.is_for_sale = false
    return res.send(currentNFT)
  }
  return res.status(500).send('Error: could not make nft change')
  }
)