const express = require('express');
const { getAllProducts, createProduct, updateProduct, deleteProduct, getSingleProduct, createProductReview, getProductReviews, deleteReview,
    getAdminProducts } = require("../controllers/productcontroller.js")
const router = express.Router();
const { isAuthenticatedUser, AuthorizeRoles } = require("../middleware/auth.js")

router.route("/products").get(getAllProducts)

router
    .route("/admin/products")
    .get(isAuthenticatedUser, AuthorizeRoles("admin"), getAdminProducts);

router.route("/admin/product/new").post(isAuthenticatedUser, AuthorizeRoles("admin"), createProduct)

router.route("/admin/product/:id")
    .put(isAuthenticatedUser, AuthorizeRoles("admin"), updateProduct)
    .delete(isAuthenticatedUser, AuthorizeRoles("admin"), deleteProduct)

router.route("/product/:id").get(getSingleProduct)

router.route("/review").put(isAuthenticatedUser, createProductReview);
router.route("/reviews").get(getProductReviews).delete(isAuthenticatedUser, deleteReview)


module.exports = router;

