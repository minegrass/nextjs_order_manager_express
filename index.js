import express from "express";
import cors from "cors";
import cookiePraser from "cookie-parser";
import { config } from "dotenv";
import jwt from "jsonwebtoken";
import { dcLogin, dcListenTakeOrder } from "./discordBot.js";
config();
const app = express();
const port = process.env.PORT || 3001;
app.use(express.json());
app.use(cors());
app.use(cookiePraser());
//routes

app.use("/sendorder", require("./api/sendOrder"));
app.use("/", require("./api/index"));

app.listen(port, () => {
  console.log(`server running on ${port}`);
});

app.on("uncaughtException", (err) => {
  console.log(err);
});
