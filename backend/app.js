// import express from "express";
// import morgan from "morgan";
// import connect from "./db/db.js";
// import userRoutes from "./routes/user.routes.js";
// import projectRoutes from "./routes/project.routes.js";
// import aiRoutes from "./routes/ai.routes.js";
// import cookieParser from "cookie-parser";
// import cors from "cors";
// connect();

// const app = express();

// app.use(cors());
// app.use(morgan("dev"));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());

// app.use("/users", userRoutes);
// app.use("/projects", projectRoutes);
// app.use("/ai", aiRoutes);

// app.get("/", (req, res) => {
//   res.send("Hello World!");
// });

// export default app;

import express from "express";
import morgan from "morgan";
import connect from "./db/db.js";
import userRoutes from "./routes/user.routes.js";
import projectRoutes from "./routes/project.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";

connect();

const app = express();

// ✅ Define your allowed frontend origins (dev + prod)
const allowedOrigins = [
  "http://localhost:5173",               // local dev
  "https://comm-sync-ai.vercel.app",
  "https://comm-sync-ai-3vjv.vercel.app"     // your live Vercel frontend
];

// ✅ Robust CORS middleware
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow tools like Postman
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.warn("🚫 Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ Routes
app.use("/users", userRoutes);
app.use("/projects", projectRoutes);
app.use("/ai", aiRoutes);

// ✅ Health check route
app.get("/", (req, res) => {
  res.send("Hello World!");
});

export default app;
