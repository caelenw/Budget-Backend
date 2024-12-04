const express = require("express");
const cors = require("cors");
const Joi = require("joi");
const multer = require("multer");
const mongoose = require("mongoose");
const app = express();

app.use(cors());
app.use(express.static("public"));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/images/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

mongoose
  .connect("mongodb+srv://Vydw4EykLl2G7Wt5:UGqvFXYYKlawhYkU@budgetwithin.wnbzq.mongodb.net/")
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.log("Couldn't connect to MongoDB", error);
  });

const spendingSchema = new mongoose.Schema({
  logo: String,
  item: { type: String, required: true },
  price: { type: String, required: true },
  account: { type: String, required: true },
  date: { type: String, required: true },
  category: { type: String, required: true },
  status: { type: String, required: true },
  comments: { type: [String], default: [] },
});

const Spending = mongoose.model("Spending", spendingSchema);

const validateSpending = (transaction) => {
  const schema = Joi.object({
    logo: Joi.string(),
    item: Joi.string().min(3).required(),
    price: Joi.string().min(1).required(),
    account: Joi.string().min(1).required(),
    date: Joi.string().min(1).required(),
    category: Joi.string().min(1).required(),
    status: Joi.string().min(1).required(),
    comments: Joi.array().items(Joi.string()).default([]),
  });

  return schema.validate(transaction);
};

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/api/spending", async (req, res) => {
  try {
    const spendingData = await Spending.find();
    res.json(spendingData);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

app.post("/api/spending", upload.single("logo"), async (req, res) => {
  const { error } = validateSpending(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const newTransaction = new Spending({
    ...req.body,
    logo: req.file ? req.file.filename : undefined,
  });

  try {
    const savedTransaction = await newTransaction.save();
    res.status(200).send(savedTransaction);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

app.put("/api/spending/:id", upload.single("logo"), async (req, res) => {
  const { id } = req.params;
  const { error } = validateSpending(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  try {
    const transaction = await Spending.findById(id);
    if (!transaction) {
      return res.status(404).send("Transaction not found");
    }

    Object.assign(transaction, req.body);
    if (req.file) {
      transaction.logo = req.file.filename;
    }
    await transaction.save();
    res.status(200).send(transaction);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

app.delete("/api/spending/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const transaction = await Spending.findByIdAndDelete(id);
    if (!transaction) {
      return res.status(404).send("Transaction ID not found");
    }
    res.status(200).send(transaction);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

app.listen(3003, () => {
  console.log("Server is running on port 3003");
});
