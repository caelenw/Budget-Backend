const express = require("express");
const cors = require("cors");
const Joi = require("joi");
const multer = require("multer");
const app = express();

app.use(express.static("public")); 
app.use("/uploads", express.static("uploads"));
app.use("/images", express.static("public/images")); 
app.use(express.json()); 
app.use(cors());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/images/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

let spending = [
  {
    _id: "1",
    logo: "insurance",
    Item: "Doctor Appointment",
    Price: "$120",
    Account: "Insurance",
    Date: "2024-09-22",
    Categorie: "Health",
    Status: "Paid",
    Comments: ["Routine check-up, very thorough!"],
  },
  {
    _id: "2",
    logo: "car",
    Item: "car Appointment",
    Price: "$120",
    Account: "Insurance",
    Date: "2024-09-22",
    Categorie: "Health",
    Status: "Paid",
    Comments: ["Routine check-up, very thorough!"],
  }
];

const validateSpending = (transaction) => {
  const schema = Joi.object({
    _id: Joi.allow(""),
    logo: Joi.string(),
    Item: Joi.string().min(3).required(),
    Price: Joi.string().min(1).required(),
    Account: Joi.string().min(1).required(),
    Date: Joi.string().min(1).required(),
    Categorie: Joi.string().min(1).required(),
    Status: Joi.string().min(1).required(),
    Comments: Joi.array().items(Joi.string()).default([]),
  });

  return schema.validate(transaction);
};

app.post("/api/spending", upload.single("logo"), (req, res) => {
  if (req.body.Comments) {
    req.body.Comments = JSON.parse(req.body.Comments);
  }

  const { error } = validateSpending(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const newTransaction = {
    _id: Date.now().toString(), 
    ...req.body
  };

  spending.push(newTransaction); 
  res.send(newTransaction);
});

app.put('/api/spending/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updatedTransaction = req.body;
    const index = spending.findIndex(transaction => transaction._id === id);
    
    if (index === -1) {
      return res.status(404).send('Transaction not found');
    }
    spending[index] = { ...spending[index], ...updatedTransaction };

    res.status(200).send(spending[index]);  
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).send('Internal Server Error');
  }
});
app.delete("/api/spending/:id", (req, res) => {
  const id = req.params.id.trim(); 
  const transactionIndex = spending.findIndex((transaction) => transaction._id === id);

  if (transactionIndex === -1) {
    return res.status(404).send("Transaction ID not found");
  }

  const deletedTransaction = spending.splice(transactionIndex, 1);

  res.status(200).send(deletedTransaction[0]); 
});


app.get("/api/spending", (req, res) => {
  res.json(spending);
});

app.listen(3003, () => {
  console.log("Server is running on port 3003");
});

