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

// // ✅ Define your allowed frontend origins (dev + prod)
// const allowedOrigins = [
//   "http://localhost:5173",               // local dev
//   "https://comm-sync-ai.vercel.app",
//   "https://comm-sync-ai-3vjv-5s0kf088b-gaurav-prakashs-projects.vercel.app",    // your live Vercel frontend
//   "https://comm-sync-ai-3vjv.vercel.app"
// ];

// // 🆕 ADD CROSS-ORIGIN ISOLATION HEADERS FOR WEBCONTAINER
// app.use((req, res, next) => {
//   res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
//   res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
//   next();
// });

// // ✅ Robust CORS middleware
// const corsOptions = {
//   origin: function (origin, callback) {
//     if (!origin) return callback(null, true); // allow tools like Postman
//     if (allowedOrigins.includes(origin)) {
//       return callback(null, true);
//     } else {
//       console.warn("🚫 Blocked by CORS:", origin);
//       return callback(new Error("Not allowed by CORS"));
//     }
//   },
//   methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"],
//   optionsSuccessStatus: 200,
// };

// app.use(cors(corsOptions));
// app.use(morgan("dev"));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());

// // ✅ Routes
// app.use("/users", userRoutes);
// app.use("/projects", projectRoutes);
// app.use("/ai", aiRoutes);

// // ✅ Health check route
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
  "https://comm-sync-ai-3vjv-5s0kf088b-gaurav-prakashs-projects.vercel.app",
  "https://comm-sync-ai-3vjv.vercel.app"
];

// 🔧 REMOVE THESE HEADERS - They can interfere with CORS
// app.use((req, res, next) => {
//   res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
//   res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
//   next();
// });

// ✅ Enhanced CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.warn("🚫 Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type", 
    "Authorization", 
    "X-Requested-With",
    "Accept",
    "Origin"
  ],
  credentials: true, // Important for cookies/auth
  optionsSuccessStatus: 200, // For legacy browser support
  preflightContinue: false, // Pass control to next handler
};

// 🆕 Apply CORS before other middleware
app.use(cors(corsOptions));

// 🆕 Explicit OPTIONS handler for all routes
app.options('*', cors(corsOptions));

// 🆕 Additional manual CORS headers as fallback
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

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

// 🆕 Error handling middleware
app.use((err, req, res, next) => {
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ 
      error: "CORS Error", 
      message: "Origin not allowed",
      origin: req.headers.origin 
    });
  }
  next(err);
});

export default app;