const Product = require('../models/productModel');
const asyncErrorHandler = require('../middlewares/helpers/asyncErrorHandler');
const SearchFeatures = require('../utils/searchFeatures');
const ErrorHandler = require('../utils/errorHandler');
const cloudinary = require('cloudinary');

// Get All Products
exports.getAllProducts = asyncErrorHandler(async (req, res, next) => {
    try {
        const resultPerPage = 12;
        const productsCount = await Product.countDocuments();

        const searchFeature = new SearchFeatures(Product.find(), req.query)
            .search()
            .filter();

        let products = await searchFeature.query;
        let filteredProductsCount = products.length;

        searchFeature.pagination(resultPerPage);

        products = await searchFeature.query.clone();

        res.status(200).json({
            success: true,
            products,
            productsCount,
            resultPerPage,
            filteredProductsCount,
        });
    } catch (error) {
        return res.status(500).json({ error: error.message, message: "Invalid System Error" });
    }

});

// Get All Products ---Product Sliders
exports.getProducts = asyncErrorHandler(async (req, res, next) => {
    try {
        const products = await Product.find();

        res.status(200).json({
            success: true,
            products,
        });
    } catch (error) {
        return res.status(500).json({ error: error.message, message: "Invalid System Error" });
    }

});

// Get Product Details
exports.getProductDetails = asyncErrorHandler(async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            // return next(new ErrorHandler("Product Not Found", 404));
            return res.status(404).json({ message: "Product Not Found" });
        }

        res.status(200).json({
            success: true,
            product,
        });
    } catch (error) {
        return res.status(500).json({ error: error.message, message: "Invalid System Error" });
    }

});

// Get All Products ---ADMIN
exports.getAdminProducts = asyncErrorHandler(async (req, res, next) => {
    try {
        const products = await Product.find();

        res.status(200).json({
            success: true,
            products,
        });
    } catch (error) {
        return res.status(500).json({ error: error.message, message: "Invalid System Error" });
    }

});

// Create Product ---ADMIN
exports.createProduct = asyncErrorHandler(async (req, res, next) => {
    try {
        let images = [];
        if (typeof req.body.images === "string") {
            images.push(req.body.images);
        } else {
            images = req.body.images;
        }

        const imagesLink = [];

        for (let i = 0; i < images.length; i++) {
            const result = await cloudinary.v2.uploader.upload(images[i], {
                folder: "products",
            });

            imagesLink.push({
                public_id: result.public_id,
                url: result.secure_url,
            });
        }

        const result = await cloudinary.v2.uploader.upload(req.body.logo, {
            folder: "brands",
        });
        const brandLogo = {
            public_id: result.public_id,
            url: result.secure_url,
        };

        req.body.brand = {
            name: req.body.brandname,
            logo: brandLogo
        }
        req.body.images = imagesLink;
        req.body.user = req.user.id;

        let specs = [];
        req.body.specifications.forEach((s) => {
            try {
                specs.push(JSON.parse(s));
            } catch (error) {
                console.error("Parsing error:", error);
            }
        });
        req.body.specifications = specs;

        const product = await Product.create(req.body);

        res.status(201).json({
            success: true,
            product
        });
    } catch (error) {
        return res.status(500).json({ error: error.message, message: "Invalid System Error" });
    }
});


// Update Product ---ADMIN
exports.updateProduct = asyncErrorHandler(async (req, res, next) => {
    try {
        let product = await Product.findById(req.params.id);

        if (!product) {
            // return next(new ErrorHandler("Product Not Found", 404));
            return res.status(404).json({ message: "Product Not Found" });
        }

        if (req.body.images !== undefined) {
            let images = [];
            if (typeof req.body.images === "string") {
                images.push(req.body.images);
            } else {
                images = req.body.images;
            }
            for (let i = 0; i < product.images.length; i++) {
                await cloudinary.v2.uploader.destroy(product.images[i].public_id);
            }

            const imagesLink = [];

            for (let i = 0; i < images.length; i++) {
                const result = await cloudinary.v2.uploader.upload(images[i], {
                    folder: "products",
                });

                imagesLink.push({
                    public_id: result.public_id,
                    url: result.secure_url,
                });
            }
            req.body.images = imagesLink;
        }

        if (req.body.logo.length > 0) {
            await cloudinary.v2.uploader.destroy(product.brand.logo.public_id);
            const result = await cloudinary.v2.uploader.upload(req.body.logo, {
                folder: "brands",
            });
            const brandLogo = {
                public_id: result.public_id,
                url: result.secure_url,
            };

            req.body.brand = {
                name: req.body.brandname,
                logo: brandLogo
            }
        }

        let specs = [];
        req.body.specifications.forEach((s) => {
            specs.push(JSON.parse(s))
        });
        req.body.specifications = specs;
        req.body.user = req.user.id;

        product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        });

        res.status(201).json({
            success: true,
            product
        });
    } catch (error) {
        return res.status(500).json({ error: error.message, message: "Invalid System Error" });
    }
});

// Delete Product ---ADMIN
exports.deleteProduct = asyncErrorHandler(async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            // return next(new ErrorHandler("Product Not Found", 404));
            return res.status(404).json({ message: "Product Not Found" });
        }

        for (let i = 0; i < product.images.length; i++) {
            await cloudinary.v2.uploader.destroy(product.images[i].public_id);
        }

        await product.remove();

        res.status(201).json({
            success: true
        });
    } catch (error) {
        return res.status(500).json({ error: error.message, message: "Invalid System Error" });
    }
});

// Create OR Update Reviews
exports.createProductReview = asyncErrorHandler(async (req, res, next) => {
    try {
        const { rating, comment, productId } = req.body;

        const review = {
            user: req.user._id,
            name: req.user.name,
            rating: Number(rating),
            comment,
        }

        const product = await Product.findById(productId);

        if (!product) {
            // return next(new ErrorHandler("Product Not Found", 404));
            return res.status(404).json({ message: "Product Not Found" });
        }

        const isReviewed = product.reviews.find(review => review.user.toString() === req.user._id.toString());

        if (isReviewed) {

            product.reviews.forEach((rev) => {
                if (rev.user.toString() === req.user._id.toString())
                    (rev.rating = rating, rev.comment = comment);
            });
        } else {
            product.reviews.push(review);
            product.numOfReviews = product.reviews.length;
        }

        let avg = 0;

        product.reviews.forEach((rev) => {
            avg += rev.rating;
        });

        product.ratings = avg / product.reviews.length;

        await product.save({ validateBeforeSave: false });

        res.status(200).json({
            success: true
        });
    } catch (error) {
        return res.status(500).json({ error: error.message, message: "Invalid System Error" });
    }
});

// Get All Reviews of Product
exports.getProductReviews = asyncErrorHandler(async (req, res, next) => {
    try {
        const product = await Product.findById(req.query.id);

        if (!product) {
            // return next(new ErrorHandler("Product Not Found", 404));
            return res.status(404).json({ message: "Product Not Found" });
        }

        res.status(200).json({
            success: true,
            reviews: product.reviews
        });
    } catch (error) {
        return res.status(500).json({ error: error.message, message: "Invalid System Error" });
    }


});


// // Delete Reveiws
// exports.deleteReview = asyncErrorHandler(async (req, res, next) => {

//     const product = await Product.findById(req.query.productId);
//     console.log("object found", product);

//     if (!product) {
//         // return next(new ErrorHandler("Product Not Found", 404));
//         return res.status(404).json({ message: "Product Not Found" });
//     }

//     const reviews = product.reviews.filter((rev) => rev._id.toString() !== req.query.id.toString());

//     let avg = 0;

//     reviews.forEach((rev) => {
//         avg += rev.rating;
//     });

//     let ratings = 0;

//     if (reviews.length === 0) {
//         ratings = 0;
//     } else {
//         ratings = avg / reviews.length;
//     }

//     const numOfReviews = reviews.length;

//     await Product.findByIdAndUpdate(req.query.productId, {
//         reviews,
//         ratings: Number(ratings),
//         numOfReviews,
//     }, {
//         new: true,
//         runValidators: true,
//         useFindAndModify: false,
//     });

//     res.status(200).json({
//         success: true,
//     });
// });

// Delete Review
exports.deleteReview = asyncErrorHandler(async (req, res, next) => {
    try {
        const reviewId = req.query.id;
        const product = await Product.findOne({ "reviews._id": reviewId });
        if (!product) {
            return res.status(404).json({ message: "Product Not Found" });
        }
        const reviews = product.reviews.filter((rev) => rev._id.toString() !== req.query.id.toString());
        const numOfReviews = reviews.length;
        let avg = 0;
        reviews.forEach((rev) => {
            avg += rev.rating;
        });

        let ratings = 0;
        if (numOfReviews === 0) {
            ratings = 0;
        } else {
            ratings = avg / numOfReviews;
        }
        await Product.findByIdAndUpdate(product._id, {
            reviews,
            numOfReviews,
            ratings: Number(ratings),
        }, {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        });
        res.status(200).json({
            success: true,
        });
    } catch (error) {
        return res.status(500).json({ error: error.message, message: "Invalid System Error" });
    }

});



// Get All Product All Reviews 
exports.getAllProductAllReviews = asyncErrorHandler(async (req, res, next) => {
    try {
        const products = await Product?.find({});

        const allReviews = products.reduce((reviews, product) => {
            if (product?.reviews && product.reviews?.length > 0) {
                reviews?.push(...product.reviews);
            }
            return reviews;
        }, []);

        res.status(200).json({
            success: true,
            reviews: allReviews
        });
    } catch (error) {
        return res.status(500).json({ error: error.message, message: "Invalid System Error" });
    }
});