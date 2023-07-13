const express = require('express');
const cookieParser = require('cookie-parser')
const bodyparser = require("body-parser")
const fileupload = require("express-fileupload")
const cors = require('cors')
const path = require("path");


require("dotenv").config({ path: "backend/config/config.env" });





const app = express();
app.use(express.json())
app.use(cookieParser())
app.use(bodyparser.urlencoded({ extended: true }));
//app.use(bodyparser.urlencoded({ extended: true }))
app.use(fileupload())
app.use(cors())
app.use(express.static(path.join(__dirname, "../frontend/build")));

// console.log("hi")
// console.log(path.join(__dirname, '../frontend/build'))

//getting all routes
const product = require("./routes/productroute.js")
const user = require("./routes/userroutes.js")
const order = require("./routes/orderroute.js")
const payment = require("./routes/paymentroute.js")


const errormiddleware = require("./middleware/error.js")




app.use("/api/v1", product)
app.use("/api/v1", user)
app.use("/api/v1", order)
app.use("/api/v1", payment)



app.get("*", function (req, res) {
    res.sendFile(path.resolve(__dirname, "../frontend/build/index.html"));
});


app.use(errormiddleware)





module.exports = app;