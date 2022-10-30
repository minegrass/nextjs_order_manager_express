import jwt from "jsonwebtoken";
import express, { NextFunction } from "express";
import { config } from "dotenv";
config();

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw Error("no jwt Secret");
}

export const verifyJWT = (req: any, res: any, next: NextFunction) => {
  const token = req.headers["accesstoken"];
  // console.log(req.headers["accesstoken"]);

  if (!token) {
    res.json({ auth: false, message: "No even have token" });
  } else {
    jwt.verify(token.toString(), jwtSecret, (err: any, decoded: any) => {
      if (err) {
        console.error(err);
        res.json({ auth: false, message: "failed to auth" });
      } else {
        next();
      }
    });
  }
};

module.exports = { verifyJWT };
