
const Product = require("../models/productmodel.js");
const Errorhandler = require("../utils/errorHandler.js");
const catchAsyncErrors = require("../middleware/catchAsyncErrors.js");
const Apifeatures = require("../utils/apifeatures.js");
const cloudinary = require("cloudinary")

// Get All Product (Admin)
exports.getAdminProducts = catchAsyncErrors(async (req, res, next) => {
    const products = await Product.find();

    res.status(200).json({
        success: true,
        products,
    });
});

//CREATE A PRODUCT---ADMIN 
exports.createProduct = catchAsyncErrors(
    async (req, res, next) => {

        let images = [];

        if (typeof req.body.images === "string") {
            images.push(req.body.images);
        } else {
            images = req.body.images;
        }

        const imagesLinks = [];

        for (let i = 0; i < images.length; i++) {
            const result = await cloudinary.v2.uploader.upload(images[i], {
                folder: "products",
            });

            imagesLinks.push({
                product_id: result.public_id,
                url: result.secure_url,
            });
        }

        req.body.images = imagesLinks;

        req.body.user = req.user._id

        const product = await Product.create(req.body);

        res.status(201).json({
            success: "true",
            product
        })
    })


//GET ALL PRODUCTS FROM DATABASE
exports.getAllProducts = catchAsyncErrors(
    async (req, res, next) => {



        const productcount = await Product.countDocuments()
        const resultperpage = 5
        // const currentpage = req.query.page || 1
        // const skip = resultperpage * (currentpage - 1)

        // const totalproductsincurrentpage = (productcount - skip != productcount) ? productcount - skip : resultperpage
        const apifeatures = new Apifeatures(Product.find(), req.query)
            .search()
            .filter()

        let products = await apifeatures.query
        let filteredProductsCount = products.length
        apifeatures.pagination(resultperpage)

        res.status(201).json({
            success: "true",
            products,
            productcount,
            resultperpage,
            filteredProductsCount
        })
    }
)



//DETAILS OF SINGLE PRODUCT
exports.getSingleProduct = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.params.id)




    if (!product) {
        return next(new Errorhandler("Product not found", 400))
    }

    res.status(201).json({
        success: "true",
        product
    })
})

//UPDATING A PRODUCT--ADMIN
exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
    let product = await Product.findById(req.params.id)

    if (!product) {
        return next(new Errorhandler("Product not found", 400))
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: true
    })

    res.status(201).json({
        success: "true",
        product
    })

})



//DELETING A PRODUCT--ADMIN
exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
    let product = await Product.findById(req.params.id)

    if (!product) {
        return next(new Errorhandler("Product not found", 400))
    }

    for (let i = 0; i < product.images.length; i++) {
        await cloudinary.v2.uploader.destroy(product.images[i].product_id)
    }
    await product.deleteOne({ id: req.params.id })

    res.status(201).json({
        success: "true",
        message: "deleted"
    })

})


// Create New Review or Update the review
exports.createProductReview = catchAsyncErrors(async (req, res, next) => {
    const { rating, comment, productId } = req.body;

    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment,
    };

    const product = await Product.findById(productId);

    const isReviewed = product.reviews.find(
        (rev) => rev.user.toString() === req.user._id.toString()
    );

    if (isReviewed) {
        product.reviews.forEach((rev) => {
            if (rev.user.toString() === req.user._id.toString())
                (rev.rating = rating), (rev.comment = comment);
        });
    } else {
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length;
    }

    let sumOfRatings = 0;

    product.reviews.forEach((rev) => {
        sumOfRatings += rev.rating;
    });

    product.rating = sumOfRatings / product.reviews.length;

    await product.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
    });
});


// Get All Reviews of a product
exports.getProductReviews = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.query.id);

    if (!product) {
        return next(new ErrorHander("Product not found", 404));
    }

    res.status(200).json({
        success: true,
        reviews: product.reviews,
    });
});


// Delete Review
exports.deleteReview = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.query.productId);

    if (!product) {
        return next(new Errorhandler("Product not found", 404));
    }

    const reviews = product.reviews.filter(
        (rev) => rev._id.toString() !== req.query.id.toString()
    );

    let avg = 0;

    reviews.forEach((rev) => {
        avg += rev.rating;
    });

    let rating = 0;

    if (reviews.length === 0) {
        rating = 0;
    } else {
        rating = avg / reviews.length;
    }

    const numOfReviews = reviews.length;

    await Product.findByIdAndUpdate(
        req.query.productId,
        {
            reviews,
            rating,
            numOfReviews,
        },
        {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        }
    );

    res.status(200).json({
        success: true,
    });
});
