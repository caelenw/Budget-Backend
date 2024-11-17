const express = require("express");
const cors = require("cors");
const Joi = require("joi");
const multer = require("multer");
const app = express();

app.use(express.static("public")); // Serves all static files from the public folder
app.use("/uploads", express.static("uploads")); // If you need a separate upload path
app.use("/images", express.static("public/images")); // Serve images from public/images
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
    logo: "car",
    Item: "Doctor Appointment",
    Price: "$120",
    Account: "Insurance",
    Date: "2024-09-22",
    Categorie: "Health",
    Status: "Paid",
    Comments: ["Routine check-up, very thorough!"],
  },
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
    ...req.body,
    logo: req.file ? `/images/${req.file.filename}` : "", 
  };

  spending.push(newTransaction); 
  res.send(newTransaction);
});

app.get("/api/spending", (req, res) => {
  res.json(spending);
});

app.listen(3002, () => {
  console.log("Server is running on port 3002");
});
