const jwt = require("jsonwebtoken");
const Errorhandler = require("../utils/errorHandler.js");
const catchAsyncErrors = require("./catchAsyncErrors.js");
const User = require("../models/usermodel.js");


exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {

    const token = req.cookies.token

    //console.log(token)

    if (!token) {
        return next(new Errorhandler("Please login to access products", 201))
    }

    const decodeData = jwt.verify(token, process.env.JWT_SECRET)

    req.user = await User.findById(decodeData.id)

    next()


})

exports.AuthorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new Errorhandler(`Role ${req.user.role} is not allowed to access this resource`, 403))
        }

        next()
    }
}