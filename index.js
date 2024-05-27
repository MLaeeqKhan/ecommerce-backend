const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

const PORT = process.env.PORT;
const connection = require("./DB/conn");
const AuthRouter = require("./Router/auth");
const EcommerceRouter = require("./Router/ecommerceController");
const cors = require("cors");
const bodyParser = require("body-parser");

app.use(cors());
// app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(bodyParser.json());

app.use("/", AuthRouter);
app.use("/", EcommerceRouter);

connection()
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log(`Server is running at port No http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error connecting to the database:", err);
  });
