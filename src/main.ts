import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import routes from "./common/routes/main.route"
import { startupManager } from "./common/services/startup-manager.service";

// Load env variables
dotenv.config();

const app = express();
const port = process.env.BACKEND_PORT ?? 3200;

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
    // Initialize startup manager
    await startupManager.initialize();
    console.log("✅ All services initialized successfully");

    // Start the server
    app.listen(port, () => {
      console.log(`✅ App is up and running on port : ${port}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
})();
