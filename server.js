const express = require("express");
const cors = require("cors");
const app = express();
const Joi = require("joi");
const multer = require("multer");
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));
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

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

let houses = [
    [
        {
            "logo": "insurance",
            "Item": "Doctor Appointment",
            "Price": "$120",
            "Account": "Insurance",
            "Date": "2024-09-22",
            "Categorie": "Health",
            "Status": "Paid",
            "Comments": [
                "Routine check-up, very thorough!"
            ]
        },
        {
            "logo": "health",
            "Item": "Pharmacy Purchase",
            "Price": "$45",
            "Account": "Debit Card",
            "Date": "2024-09-23",
            "Categorie": "Health",
            "Status": "Paid",
            "Comments": [
                "Needed some meds and supplements."
            ]
        },
        {
            "logo": "rent",
            "Item": "Monthly Rent",
            "Price": "$1200",
            "Account": "Bank Transfer",
            "Date": "2024-09-24",
            "Categorie": "Rent",
            "Status": "Paid",
            "Comments": [
                "Paid on time, love this place!"
            ]
        },
        {
            "logo": "pets",
            "Item": "Pet Food",
            "Price": "$30",
            "Account": "Credit Card",
            "Date": "2024-09-25",
            "Categorie": "Pets",
            "Status": "Paid",
            "Comments": [
                "My dog loves this brand!"
            ]
        },
        {
            "logo": "insurance",
            "Item": "Health Insurance Premium",
            "Price": "$300",
            "Account": "Visa",
            "Date": "2024-09-26",
            "Categorie": "Insurance",
            "Status": "Paid",
            "Comments": [
                "Monthly premium for peace of mind."
            ]
        },
        {
            "logo": "kids",
            "Item": "Kids' Toys",
            "Price": "$50",
            "Account": "Master Card",
            "Date": "2024-09-27",
            "Categorie": "Kids",
            "Status": "Paid",
            "Comments": [
                "They loved their new toys!"
            ]
        },
        {
            "logo": "debt",
            "Item": "Credit Card Payment",
            "Price": "$200",
            "Account": "Debit Card",
            "Date": "2024-09-28",
            "Categorie": "Debt",
            "Status": "Paid",
            "Comments": [
                "Making progress on my debt."
            ]
        },
        {
            "logo": "rent",
            "Item": "Mortgage Payment",
            "Price": "$1500",
            "Account": "Bank Transfer",
            "Date": "2024-09-29",
            "Categorie": "Rent/House",
            "Status": "Paid",
            "Comments": [
                "Steady payment towards ownership."
            ]
        },
        {
            "logo": "car",
            "Item": "Car Insurance",
            "Price": "$100",
            "Account": "Credit Card",
            "Date": "2024-09-30",
            "Categorie": "Car",
            "Status": "Paid",
            "Comments": [
                "Necessary for driving safely."
            ]
        },
        {
            "logo": "savings",
            "Item": "Savings Account Deposit",
            "Price": "$500",
            "Account": "Bank Transfer",
            "Date": "2024-10-01",
            "Categorie": "Savings",
            "Status": "Deposited",
            "Comments": [
                "Saving for a vacation!"
            ]
        },
        {
            "logo": "other",
            "Item": "Gift for a Friend",
            "Price": "$25",
            "Account": "Cash",
            "Date": "2024-10-02",
            "Categorie": "Other",
            "Status": "Paid",
            "Comments": [
                "A lovely gift for their birthday."
            ]
        },
        {
            "logo": "health",
            "Item": "Gym Membership",
            "Price": "$40",
            "Account": "Credit Card",
            "Date": "2024-10-03",
            "Categorie": "Health",
            "Status": "Paid",
            "Comments": [
                "Staying fit and healthy!"
            ]
        },
        {
            "logo": "car",
            "Item": "Gasoline",
            "Price": "$30",
            "Account": "Debit Card",
            "Date": "2024-10-04",
            "Categorie": "Car",
            "Status": "Paid",
            "Comments": [
                "Filled up the tank for the week."
            ]
        },
        {
            "logo": "kids",
            "Item": "School Supplies",
            "Price": "$15",
            "Account": "Cash",
            "Date": "2024-10-05",
            "Categorie": "Kids",
            "Status": "Paid",
            "Comments": [
                "Ready for the school year!"
            ]
        },
        {
            "logo": "pets",
            "Item": "Vet Check-up",
            "Price": "$70",
            "Account": "Debit Card",
            "Date": "2024-10-06",
            "Categorie": "Pets",
            "Status": "Paid",
            "Comments": [
                "Routine check-up for my cat."
            ]
        }
    ]
    
];

app.get("/api/houses", (req, res) => {
  res.send(houses);
});

app.post("/api/houses", upload.single("img"), (req, res) => {
  const result = validateHouse(req.body);

  if (result.error) {
    res.status(400).send(result.error.details[0].message);
    return;
  }

  const house = {
    _id: houses.length + 1,
    name: req.body.name,
    size: req.body.size,
    bedrooms: req.body.bedrooms,
    bathrooms: req.body.bathrooms,
  };

  if (req.file) {
    house.main_image = "images/" + req.file.filename;
  }

  houses.push(house);
  res.status(200).send(house);
});

app.put("/api/houses/:id", upload.single("img"), (req, res) => {
  let house = houses.find((h) => h._id === parseInt(req.params.id));

  if (!house) res.status(400).send("House with given id was not found");

  const result = validateHouse(req.body);

  if (result.error) {
    res.status(400).send(result.error.details[0].message);
    return;
  }

  house.name = req.body.name;
  house.description = req.body.description;
  house.size = req.body.size;
  house.bathrooms = req.body.bathrooms;
  house.bedrooms = req.body.bedrooms;

  if (req.file) {
    house.main_image = "images/" + req.file.filename;
  }

  res.send(house);
});

app.delete("/api/houses/:id", (req, res) => {
  const house = houses.find((h) => h._id === parseInt(req.params.id));

  if (!house) {
    res.status(404).send("The house with the given id was not found");
  }

  const index = houses.indexOf(house);
  houses.splice(index, 1);
  res.send(house);
});

const validateHouse = (house) => {
  const schema = Joi.object({
    _id: Joi.allow(""),
    name: Joi.string().min(3).required(),
    size: Joi.number().required(),
    bedrooms: Joi.number().required(),
    bathrooms: Joi.number().required(),
  });

  return schema.validate(house);
};

app.listen(3002, () => {
  console.log("I'm listening");
});