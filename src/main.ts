import express from "express";
import connectDB from "./config/dbConnect";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import routes from "./routes/index";

// Load env variables
dotenv.config();

const app = express();
const port = process.env.BACKEND_PORT ?? 3100;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.use(cors({
    origin: process.env.FRONTEND_ORIGIN,
    credentials: true
}))

// Routes
app.use(routes);

// Start the app only after DB connection
(async () => {
  try {
    // Connect with DB
    await connectDB();

    // Start the server
    app.listen(port, () => {
      console.log(`✅ cachex-001 running on port: ${port}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
})();
