import express from 'express'
import Joi from 'joi'
import 'dotenv/config'
import { EduverseClient } from '../scripts/smc_interaction'


export const userRouter = express.Router()
userRouter.use(express.json())

const private_key = process.env.PRIVATE_KEY
if (!private_key) {
  console.log('Error: Private key needed')
  process.exit(1)
}

const user = new EduverseClient(private_key)

// Gets detalls of a users
userRouter.get('/:id', (req, res) => {
    const response = user.getUserDetails(req.param.id)
    if (!response) return res.status(404).send(`user with id ${req.param.id}`)
    
    res.send(response)
})

// Adds a user
const addUserSchema = Joi.object({
    name: Joi.string().required(),
    userAdress: Joi.string().required()
})
userRouter.post('/', async (req, res) => {
    const {error, value} = addUserSchema.validate(req.body)
    if ( error ) return res.status(400).send(error.details[0].message)
  
    const {name, userAdress} = value
    const result = await user.addUser(name, userAdress)

    res.send(`user of address ${userAdress} created`)
})

//  Removes user
const removeUserSchema = Joi.object({
    userAdress: Joi.string().required()
})
userRouter.post('/', async (req, res) => {
    const {error, value} = removeUserSchema.validate(req.body)
    if ( error ) return res.status(400).send(error.details[0].message)
  
    const { userAdress} = value
    const result = await user.removeUser(userAdress)
    if (!result) return res.status(404).send(`user address ${userAdress} not found`)

    res.send(`user of address ${userAdress} removed`)
})