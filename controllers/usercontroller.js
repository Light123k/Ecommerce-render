const User = require("../models/usermodel.js")
const Errorhandler = require("../utils/errorHandler.js");
const catchAsyncErrors = require("../middleware/catchAsyncErrors.js");
const sendToken = require("../utils/jwtToken.js")
const sendEmail = require("../utils/sendEmail.js")
const crypto = require('crypto')
const cloudinary = require("cloudinary")


exports.registeruser = catchAsyncErrors(async (req, res, next) => {

    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: "avatars",
        width: 150,
        crop: "scale"
    })

    const { name, email, password } = req.body
    const user = await User.create({
        name,
        email,
        password,
        avatar: {
            public_id: myCloud.public_id,
            url: myCloud.secure_url
        }
    })

    sendToken(user, 201, res)
})


exports.loginuser = catchAsyncErrors(async (req, res, next) => {

    const { email, password } = req.body

    if (!email || !password) {
        return next(new Errorhandler("please give email and password", 400))
    }

    const user = await User.findOne({ email }).select("+password")

    if (!user) {
        return next(new Errorhandler("Invalid user", 401))
    }

    const ispasswordmtched = user.comparePassword(password)

    if (!ispasswordmtched) {
        return next(new Errorhandler("Invalid email or password", 401))
    }

    sendToken(user, 201, res)

})



exports.logoutuser = catchAsyncErrors(async (req, res, next) => {

    res.cookie("token", null, {
        httpOnly: true,
        expires: new Date(Date.now())
    })

    res.status(201).json({
        success: true,
        message: "logged out"
    })
})


exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email })

    if (!user) {
        return next(new Errorhandler("user not found", 401))
    }

    const resetToken = user.resetPassword()

    await user.save({ validateBeforeSave: false })

    const resetPasswordURL = `${req.protocol}://${req.get(
        "host"
    )}/password/reset/${resetToken}`

    const message = `Your password reset token is ttemp \n\n ${resetPasswordURL} \n\n If you have not asked for reset password kindly ignore this message`

    try {
        await sendEmail({
            email: user.email,
            subject: "Ecommerce reset password",
            message
        })

        res.status(201).json({
            success: true,
            message: `Email sent to ${user.email} successfully `
        })
    } catch (err) {
        user.resetPassword = undefined
        user.resetPasswordExpire = undefined

        await user.save({ validateBeforeSave: false })

        return next(new Errorhandler(err.message, 404))
    }

})


exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
    // creating token hash
    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
        return next(
            new Errorhandler(
                "Reset Password Token is invalid or has been expired",
                400
            )
        );
    }

    if (req.body.password !== req.body.confirmPassword) {
        return next(new Errorhandler("Password does not match confirmpassword", 400));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user, 200, res);
});

//GET USER DETAILS
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        user,
    });
});


// update User password
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id).select("+password");

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    if (!isPasswordMatched) {
        return next(new Errorhandler("Old password is incorrect", 400));
    }

    if (req.body.newPassword !== req.body.confirmPassword) {
        return next(new Errorhandler("password does not match", 400));
    }

    user.password = req.body.newPassword;

    await user.save();

    sendToken(user, 200, res);
});


//UPDATE USER PROFILE
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
    }

    //WE WILL ADD CLOUDINARY LATER
    if (req.body.avatar != "") {
        const user = await User.findById(req.user.id);

        const imageId = user.avatar.public_id;

        await cloudinary.v2.uploader.destroy(imageId);

        const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
            folder: "avatars",
            width: 150,
            crop: "scale",
        });

        newUserData.avatar = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
        };
    }

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true,
    });
});

// Get all users(admin)
exports.getAllUser = catchAsyncErrors(async (req, res, next) => {
    const users = await User.find();

    res.status(200).json({
        success: true,
        users,
    });
});

// Get single user (admin)
exports.getSingleUser = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(
            new Errorhandler(`User does not exist with Id: ${req.params.id}`)
        );
    }

    res.status(200).json({
        success: true,
        user,
    });
});


// update User Role -- Admin
exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {


    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
    };

    await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true,
    });
});

// Delete User --Admin
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(
            new Errorhandler(`User does not exist with Id: ${req.params.id}`, 400)
        );
    }

    //we will remove cloudinary later

    const imageId = user.avatar.public_id;

    await cloudinary.v2.uploader.destroy(imageId);


    await user.deleteOne({ id: req.params.id })

    res.status(200).json({
        success: true,
        message: "User Deleted Successfully",
    });
});



