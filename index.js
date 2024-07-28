const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");

const app = express();

const port = 3000;

// app.listen(port, () => {
//     console.log()
// })

app.get("/", (req, res) => {
  res.send(`There is API Server`);
});

app.get("/fetch-api", async (req, res) => {
  try {
    const response = await axios.get(
      "https://s3.amazonaws.com/roxiler.com/product_transaction.json"
    );
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error in fetching data");
  }
});

app.get("/fetch-api-product/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.get(
      "https://s3.amazonaws.com/roxiler.com/product_transaction.json"
    );
    const product = response.data.find((item) => item.id.toString() === id);

    if (product) {
      res.status(200).json(product);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error in fetching data" });
  }
});

mongoose
  .connect("mongodb://localhost:27017/mern-challenge")
  .then(() => {
    console.log("Connected to database!");
    app.listen(port, () => {
        console.log(`Server is running at ${port}`)
    })
  })
  .catch((err) => {
    console.error("Connection failed!", err);
  });

const transactionSchema = new mongoose.Schema({
  id: Number,
  title: String,
  price: Number,
  description: String,
  category: String,
  image: String,
});

const Transaction = mongoose.model("Transaction", transactionSchema);

const fetchAndInsertData = async () => {
  try {
    const response = await axios.get(
      "https://s3.amazonaws.com/roxiler.com/product_transaction.json"
    );
    const transactions = response.data;

    await Transaction.insertMany(transactions);
    console.log("Data inserted successfully!");
  } catch (err) {
    console.error("Error fetching or inserting data", err);
  } finally {
    mongoose.connection.close();
  }
};

fetchAndInsertData();
