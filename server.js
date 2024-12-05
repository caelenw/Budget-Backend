const express = require("express");
const cors = require("cors");
const Joi = require("joi");
const mongoose = require("mongoose");

const app = express();

app.use(express.static("public"));
app.use(express.json());
app.use(cors());

const validateSpending = (transaction) => {
  const schema = Joi.object({
    _id: Joi.allow(""),
    logo: Joi.string(),
    item: Joi.string().min(1).required(),
    Price: Joi.number().min(1).required(),
    Account: Joi.string().min(1).required(),
    Date: Joi.string().min(1).required(),
    Categorie: Joi.string().min(1).required(),
    Status: Joi.string().min(1).required(),
    Comment: Joi.alternatives().try(
      Joi.string(),
      Joi.array().items(Joi.string())
    ).default([]),
  });

  const result = schema.validate(transaction, { allowUnknown: true });
  console.log("Validation result:", result);
  return result;
};

const spendingSchema = new mongoose.Schema({
  logo: String,
  item: String,
  Price: Number,
  Account: String,
  Date: String,
  Status: String,
  Categorie: String,
  Comment: {
    type: mongoose.Schema.Types.Mixed, 
    default: [],
  },
});

const Spending = mongoose.model("Spending", spendingSchema);
mongoose
  .connect("mongodb+srv://Vydw4EykLl2G7Wt5:PJlTMHsS7uxdPx7s@budgetwithin.wnbzq.mongodb.net/")
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.log("Error connecting to MongoDB", error);
  });

app.post("/api/spending", async (req, res) => {
  const transactionData = { ...req.body };
  delete transactionData.__v; // Remove __v field

  const result = validateSpending(transactionData);

  if (result.error) {
    return res.status(400).send(result.error.details[0].message);
  }

  const transaction = new Spending(transactionData);

  try {
    const newSpending = await transaction.save();
    res.status(200).send(newSpending);
  } catch (err) {
    res.status(500).send("Error saving transaction");
  }
});

app.put("/api/spending/:id", async (req, res) => {
  const transactionData = { ...req.body };
  delete transactionData.__v; 

  const result = validateSpending(transactionData);

  if (result.error) {
    return res.status(400).send(result.error.details[0].message);
  }

  try {
    const updatedSpending = await Spending.findByIdAndUpdate(
      req.params.id,
      transactionData,
      { new: true }
    );
    if (!updatedSpending) {
      return res.status(404).send("Transaction not found");
    }
    res.status(200).send(updatedSpending);
  } catch (err) {
    res.status(500).send("Error updating transaction: " + err.message);
  }
});

app.delete("/api/spending/:id", async (req, res) => {
  try {
    const spending = await Spending.findByIdAndDelete(req.params.id);
    if (!spending) {
      return res.status(404).send("Transaction not found");
    }
    res.status(200).send(spending);
  } catch (err) {
    res.status(500).send("Error deleting transaction");
  }
});

app.get("/api/spending", async (req, res) => {
  try {
    const spending = await Spending.find();
    res.send(spending);
  } catch (err) {
    res.status(500).send("Error fetching spending data");
  }
});

app.listen(3001, () => {
  console.log("listening... I'm running");
});
