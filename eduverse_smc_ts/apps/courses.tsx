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

const courses = new Courses()
const edu = new EduverseClient(private_key)

// Gets all courses in contact
courseRouter.get('/', async (req, res) => {
    const response = await courses.getAllCoursesDetails()
    console.log(response)
    res.send(response)
})

// Gets a Course using its id (object id)
courseRouter.get('/:id', async (req, res) => {
  const response = await courses.getCourseDetails(req.params.id)
  if (!response) return res.status(404).send(`Error: Course with id ${req.params.id} is not found`)
  
  return res.send(response)
})

// Creates a new course
const createCourseSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  category: Joi.string().required(),
  creatorAddress: Joi.string().required(),
  xp: Joi.number().required(),
  difficulty: Joi.number().required(),
  image: Joi.string().required()
})
courseRouter.post('/', async (req, res) => {
  const { error, value } = createCourseSchema.validate(req.body)
  if (error) return res.status(400).send(error.details[0].message)

  const { name, description, category, creatorAddress, xp, difficulty, image } = value
  const objectId = await courses.createCourse(name, description, category, creatorAddress, xp, difficulty, image)
  if (!objectId) return res.status(500).send(`Error: could not create course of name ${name}`)
  
  const response = await courses.getCourseDetails(objectId)
  res.send({ id: objectId, ...response })
})

// Add a question to a course
const addQuestionSchema = Joi.object({
  course: Joi.string().required(),
  question: Joi.string().required(),
  answer: Joi.string().required(),
});
courseRouter.post('/add-question', async (req, res) => {
  const { error } = addQuestionSchema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const { course, question, answer } = req.body;
  const success = await courses.addQuestion(course, question, answer);
  if (success) return res.send('Question added successfully');
  
  return res.status(500).send('Error: Could not add question');
});

// Enroll a student in a course
const enrollStudentSchema = Joi.object({
  course: Joi.string().required(),
  student: Joi.string().required(),
});
courseRouter.post('/enroll-student', async (req, res) => {
  const { error } = enrollStudentSchema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const { course, student } = req.body;
  const success = await courses.enrollStudent(course, student);
  if (success) return res.send('Student enrolled successfully');
  
  return res.status(500).send('Error: Could not enroll student');
});

// Unenroll a student from a course
courseRouter.post('/unenroll-student', async (req, res) => {
  const { error } = enrollStudentSchema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const { course, student } = req.body;
  const success = await courses.unEnrollStudent(course, student);
  if (success) return res.send('Student unenrolled successfully');
  
  return res.status(500).send('Error: Could not unenroll student');
});

// Remove a question from a course
const removeQuestionSchema = Joi.object({
  course: Joi.string().required(),
  question: Joi.string().required(),
});
courseRouter.post('/remove-question', async (req, res) => {
  const { error } = removeQuestionSchema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const { course, question } = req.body;
  const success = await courses.removeQuestion(course, question);
  if (success) return res.send('Question removed successfully');
  
  return res.status(500).send('Error: Could not remove question');
});

// Update course name
const updateCourseNameSchema = Joi.object({
  course: Joi.string().required(),
  name: Joi.string().required(),
});
courseRouter.post('/update-course-name', async (req, res) => {
  const { error } = updateCourseNameSchema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const { course, name } = req.body;
  const success = await courses.updateCourseName(course, name);
  if (success) return res.send('Course name updated successfully');
  
  return res.status(500).send('Error: Could not update course name');
});

// Update course description
const updateCourseDescriptionSchema = Joi.object({
  course: Joi.string().required(),
  description: Joi.string().required(),
});
courseRouter.post('/update-course-description', async (req, res) => {
  const { error } = updateCourseDescriptionSchema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const { course, description } = req.body;
  const success = await courses.updateCourseDescription(course, description);
  if (success) return res.send('Course description updated successfully');
  
  return res.status(500).send('Error: Could not update course description');
});

// Update course image URL
const updateCourseImageURLSchema = Joi.object({
  course: Joi.string().required(),
  image: Joi.string().required(),
});
courseRouter.post('/update-course-image', async (req, res) => {
  const { error } = updateCourseImageURLSchema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const { course, image } = req.body;
  const success = await courses.updateCourseImageURL(course, image);
  if (success) return res.send('Course image updated successfully');
  
  return res.status(500).send('Error: Could not update course image');
});

// Update course difficulty
const updateCourseDifficultySchema = Joi.object({
  course: Joi.string().required(),
  difficulty: Joi.number().required(),
});
courseRouter.post('/update-course-difficulty', async (req, res) => {
  const { error } = updateCourseDifficultySchema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const { course, difficulty } = req.body;
  const success = await courses.updateCourseDifficulty(course, difficulty);
  if (success) return res.send('Course difficulty updated successfully');
  
  return res.status(500).send('Error: Could not update course difficulty');
});

// Update course XP
const updateCourseXPSchema = Joi.object({
  course: Joi.string().required(),
  xp: Joi.number().required(),
});
courseRouter.post('/update-course-xp', async (req, res) => {
  const { error } = updateCourseXPSchema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const { course, xp } = req.body;
  const success = await courses.updateCourseXP(course, xp);
  if (success) return res.send('Course XP updated successfully');
  
  return res.status(500).send('Error: Could not update course XP');
});

// Add a review to a course
const addReviewSchema = Joi.object({
  course: Joi.string().required(),
  student: Joi.string().required(),
  rating: Joi.number().required(),
  review: Joi.string().required(),
});
courseRouter.post('/add-review', async (req, res) => {
  const { error } = addReviewSchema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const { course, student, rating, review } = req.body;
  const success = await courses.addReview(course, student, rating, review);
  if (success) return res.send('Review added successfully');
  
  return res.status(500).send('Error: Could not add review');
});

// Check correct answer for a question
const checkCorrectAnswerSchema = Joi.object({
  course: Joi.string().required(),
  question: Joi.string().required(),
  answer: Joi.string().required(),
});
courseRouter.post('/check-correct-answer', async (req, res) => {
  const { error } = checkCorrectAnswerSchema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const { course, question, answer } = req.body;
  const isCorrect = await courses.checkCorrectAnswer(course, question, answer);
  if (isCorrect !== null) return res.send({ isCorrect });
  
  return res.status(500).send('Error: Could not check answer');
});

// View questions for a course
courseRouter.get('/:id/questions', async (req, res) => {
  const questions = await courses.viewQuestions(req.params.id);
  if (questions) return res.send(questions);
  
  return res.status(404).send('Error: Questions not found');
});

// View reviews for a course
courseRouter.get('/:id/reviews', async (req, res) => {
  const reviews = await courses.viewReviews(req.params.id);
  if (reviews) return res.send(reviews);
  
  return res.status(404).send('Error: Reviews not found');
});

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
courseRouter.get('/:id', async (req, res) => {
  const response = await edu.removeCourse(req.params.id)
  if (!response) return res.status(404).send(`Error: Course with id ${req.params.id} is not found`)
  
  return res.status(402).sent(`course of id ${req.params.id} has been deleted`)
})

// Update the delete course method to use DELETE
courseRouter.delete('/:id', async (req, res) => {
  const response = await edu.removeCourse(req.params.id)
  if (!response) return res.status(404).send(`Error: Course with id ${req.params.id} not found`)
  
  return res.status(200).send(`Course of id ${req.params.id} has been deleted`)
})