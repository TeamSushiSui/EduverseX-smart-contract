import express from 'express';
import { nftRouter } from './apps/nft';
import { courseRouter } from './apps/courses';
import { userRouter } from './apps/users';
import cors from 'cors';

const app = express();
const port = process.env.PORT ?? 3000;

// Apply CORS and JSON parsing middleware
app.use(cors({
  origin: '*',  // Allow all origins for testing
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());  // This line allows parsing of JSON requests

// Routes
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/nfts', nftRouter);
app.use('/courses', courseRouter);
app.use('/users', userRouter);

// Start the server
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
