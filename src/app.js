import express from 'express';
import cookieParser from 'cookie-parser';
import { connectDB } from './db/index.js';
import { PORT } from './config/serverConfig.js';

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to the database:', err);
    process.exit(1); // Exit the process with failure
  });
