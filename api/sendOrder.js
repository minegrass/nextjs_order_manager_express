import express from "express";
const app = express();
const router = express.Router();
import jwt from "jsonwebtoken";
import { prisma } from "../prisma/dbserver.js";
import { verifyJWT } from "../AuthMidware.js";
import { dcSendOrder } from "../discordBot.js";

// getting order data
router.post("/post", verifyJWT, async (req, res) => {
  // console.log(req.body);
  const { order_id } = req.body;
  const result = await prisma.orderlist.findUnique({
    where: {
      order_id: parseInt(order_id),
    },
  });
  if (result) {
    await dcSendOrder(order_id, result.request, `${result.price}`);
    res.json({
      auth: true,
      message: "done",
      status: 201,
    });
  } else {
    res.json({
      auth: true,
      message: `Not Found order id: ${order_id}`,
      status: 404,
    });
  }
});

module.exports = router;
