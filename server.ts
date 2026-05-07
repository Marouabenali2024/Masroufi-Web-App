import express from "express";
import path from "path";
import helmet from "helmet";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import transactionRoutes from "./server/routes/transactionRoutes.ts";
import budgetRoutes from "./server/routes/budgetRoutes.ts";
import aiRoutes from "./server/routes/aiRoutes.ts";
import { errorHandler } from "./server/middleware/error.ts";

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || "3000");

  console.log("[Server] Starting Masroufi backend...");

  // Security Middlewares
  app.use(helmet({
    contentSecurityPolicy: false,
  }));
  app.use(cors());
  app.use(express.json());

  // API Routes
  app.use("/api/transactions", transactionRoutes);
  app.use("/api/budgets", budgetRoutes);
  app.use("/api/ai", aiRoutes);

  // Health Check
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      service: "Masroufi API"
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
