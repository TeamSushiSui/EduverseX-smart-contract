import express from 'express';
import { nftRouter } from './apps/nft';
import { courseRouter } from './apps/courses';
import { userRouter } from './apps/users';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Root endpoint to serve the documentation
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use('/nfts', nftRouter);
app.use('/courses', courseRouter);
app.use('/users', userRouter);

app.listen(port, () => {
  console.log(`Starting EduXverse\nlistening on port ${port}`);
});