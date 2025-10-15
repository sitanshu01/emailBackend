// FIXME: no formID in user table but Form is presnet and also make it many not one single form submitted by user
// FIXME: remvoe unnecessary data sent by database
import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import { otpRouter } from "./src/otp/otp.controller";
import { authRouter } from "./src/auth/auth.controller";
import { superAdminRouter } from "./src/super_admin/super_admin.controller";
import { studentRouter } from "./src/student/student.controller";
import { isAdmin, isStudent, isSuperAdmin } from "./src/middleware";
import { decodeRequestId } from "./src/middleware/requestId";
import { rateLimit } from "express-rate-limit";
import { adminRouter } from "./src/admin/admin.controller";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-8", // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
  // store: ... , // Redis, Memcached, etc. See below.
});

const app = express();

app.use(limiter);
app.use(express.json());
app.use(cookieParser());

// CORS configuration
const corsOptions = {
  origin: function (origin: any, callback: any) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5174",
    ];

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // Allow cookies to be sent
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Cookie",
    "X-Requested-With",
  ],
  exposedHeaders: ["Set-Cookie"],
};

app.use(cors(corsOptions));

app.get("/health_check", (req, res) => {
  return res.json({
    msg: "OK",
  });
});
app.use("/api/v1/otp", decodeRequestId, otpRouter);
app.use("/api/v1/auth", authRouter);
// app.use("/api/v1/admin", isAdmin, adminRouter);
app.use("/api/v1/admin", isAdmin, adminRouter);
app.use("/api/v1/super_admin", isSuperAdmin, superAdminRouter);
app.use("/api/v1/student", isStudent, studentRouter);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
