const express = require('express')
const { isAuthenticatedUser, AuthorizeRoles } = require('../middleware/auth')
const { newOrder, getSingleOrder, myOrders, getAllOrders, updateOrder, deleteOrder } = require('../controllers/ordercontroller')
const router = express.Router()

router.route("/order/new").post(isAuthenticatedUser, newOrder)

router.route("/order/:id").get(isAuthenticatedUser, getSingleOrder)
router.route("/orders/me").get(isAuthenticatedUser, myOrders)

router
    .route("/admin/orders")
    .get(isAuthenticatedUser, AuthorizeRoles("admin"), getAllOrders);

router
    .route("/admin/order/:id")
    .put(isAuthenticatedUser, AuthorizeRoles("admin"), updateOrder)
    .delete(isAuthenticatedUser, AuthorizeRoles("admin"), deleteOrder);


module.exports = router