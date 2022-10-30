import express from "express";
const app = express();
const router = express.Router();

// getting order data
router.get("/", async (req, res) => {
  res.send("OK!");
});

module.exports = router;
