import express from 'express'
import Joi from 'joi'
import 'dotenv/config'
import { Courses } from '../scripts/courses_smc_interaction'
import { EduverseClient } from '../scripts/smc_interaction'


export const courseRouter = express.Router()
courseRouter.use(express.json())

const private_key = process.env.PRIVATE_KEY
if (!private_key) {
  console.log('Error: Private key needed')
  process.exit(1)
}


const edu = new EduverseClient(private_key)
const courses = new Courses()

// Gets all courses in contact
courseRouter.get('/', async (req, res) => {
    const response = await courses.getAllCoursesDetails()
    console.log(response)
    res.send(response)
})

// Gets a Courses using its id (object id)
courseRouter.get('/:id', async (req, res) => {
  const response = await courses.getCourseDetails(req.params.id)
  if (!response) return res.status(404).send(`Error: Course with id ${req.params.id} is not found`)
  
  return res.send(response)
})

// Creates a new course
const createCourseShema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  category: Joi.string().required(),
  creatorAddress: Joi.string().required(),
  xp: Joi.number().required(),
  difficulty: Joi.number().required(),
  image: Joi.string().required()
})
courseRouter.post('/', async (req, res) => {
  const { error, value } = createCourseShema.validate(req.body)
  if (error) return res.status(400).send(error.details[0].message)

  const { name, description, category, creatorAddress, xp, difficulty, image } = value
  const objectId = await courses.createCourse(name, description, category, creatorAddress, xp, difficulty, image)
  if (!objectId) return res.status(500).send(`Error: could not create course of name ${name}`)
  
  const response = await courses.getCourseDetails(creatorAddress)
  if (!response) return res.send({id: objectId})

  res.send({id: objectId, ...response})
})

// Updates course using id (object id)
const updateCourseShema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  id: Joi.string().required(),
})
courseRouter.put('/', async (req, res) => {
  const { error, value } = updateCourseShema.validate(req.body)
  if (error) return res.status(400).send(error.details[0].message)

  const { name, description, id} = value
  const result = await edu.updateCourse(name, description, id)
  if (!result) return res.status(500).send(`Error: could not update course of id ${id}`)
  
  const response = await courses.getCourseDetails(id)
  if (!response) return res.send({id: id})

  res.send(response)
})

// Get a course detail
// courseRouter.get('/:id', async (req, res) => {
//   const response = await edu.removeCourse(req.params.id)
//   if (!response) return res.status(404).send(`Error: Course with id ${req.params.id} is not found`)
  
//   return res.status(402).sent(`course of id ${req.params.id} has been deleted`)
// })