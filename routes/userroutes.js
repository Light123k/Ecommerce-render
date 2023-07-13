const express = require('express');
const { registeruser, loginuser, logoutuser, forgotPassword, resetPassword, getUserDetails, updatePassword, updateProfile, getAllUser, getSingleUser, updateUserRole, deleteUser } = require('../controllers/usercontroller');
const { isAuthenticatedUser, AuthorizeRoles } = require('../middleware/auth');
const router = express.Router();

router.route("/register").post(registeruser)
router.route("/login").post(loginuser)
router.route("/logout").get(logoutuser)

router.route("/password/forgot").post(forgotPassword)
router.route("/password/reset/:token").put(resetPassword)

router.route("/me").get(isAuthenticatedUser, getUserDetails)
router.route("/password/update").put(isAuthenticatedUser, updatePassword)
router.route("/me/update").put(isAuthenticatedUser, updateProfile)

router.route("/admin/users").get(isAuthenticatedUser, AuthorizeRoles("admin"), getAllUser)

router.route("/admin/user/:id")
    .get(isAuthenticatedUser, AuthorizeRoles("admin"), getSingleUser)
    .put(isAuthenticatedUser, AuthorizeRoles("admin"), updateUserRole)
    .delete(isAuthenticatedUser, AuthorizeRoles("admin"), deleteUser)

module.exports = router