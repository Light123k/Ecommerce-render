const express = require("express");
const {
    processPayment,
    sendStripeApiKey,
} = require("../controllers/paymentcontroller");
const router = express.Router();
const { isAuthenticatedUser } = require("../middleware/auth");

router.route("/order/payment").post(isAuthenticatedUser, processPayment);

router.route("/stripeapikey").get(isAuthenticatedUser, sendStripeApiKey);

module.exports = router;