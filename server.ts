import express from "express";
import path from "path";
import mongoose from "mongoose";
import helmet from "helmet";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import { connectDB } from "./src/lib/db.ts";
import transactionRoutes from "./server/routes/transactionRoutes.ts";
import budgetRoutes from "./server/routes/budgetRoutes.ts";
import aiRoutes from "./server/routes/aiRoutes.ts";
import { errorHandler } from "./server/middleware/error.ts";

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || "3000");

  // Connect to MongoDB
  console.log("[Server] Initializing database connection...");
  connectDB().catch(err => {
    console.error("[Server] Critical: Database connection failed:", err);
  });

  // Security Middlewares
  app.use(helmet({
    contentSecurityPolicy: false, // Vite development needs this disabled or carefully configured
  }));
  app.use(cors());
  app.use(express.json());

  // Middleware to check DB connection for API routes
  const checkDB = (req: any, res: any, next: any) => {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        error: "Database not connected", 
        details: "Please ensure MONGODB_URI is set and accessible." 
      });
    }
    next();
  };

  // API Routes
  app.use("/api/transactions", checkDB, transactionRoutes);
  app.use("/api/budgets", checkDB, budgetRoutes);
  app.use("/api/ai", checkDB, aiRoutes);

  // Health Check
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      service: "Masroufi API",
      database: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
    });
  });

  // Global Error Handler
  app.use(errorHandler);

  // Vite / Static Assets
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
