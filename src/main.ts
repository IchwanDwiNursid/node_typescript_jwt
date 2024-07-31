import express from "express";
import dotenv from "dotenv";
import { router } from "./route/userRouter";
import { errorMiddleware } from "./middleware/errorMiddleware";
dotenv.config();
import cookieParser from "cookie-parser";
import { refreshToken } from "./middleware/authMiddleware";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(router);
app.use("/token", refreshToken);
app.use(errorMiddleware);

app.listen(process.env.APP_PORT, () => {
  console.log(`Server Listen On Port ${process.env.APP_PORT}`);
});
