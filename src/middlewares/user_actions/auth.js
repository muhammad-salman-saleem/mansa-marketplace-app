const jwt = require("jsonwebtoken");
const User = require("../../models/userModel");
const ErrorHandler = require("../../utils/errorHandler");
const asyncErrorHandler = require("../helpers/asyncErrorHandler");

exports.isAuthenticatedUser = asyncErrorHandler(async (req, res, next) => {

  const { token } = req.cookies;

  if (!token) {
    // return next(new ErrorHandler("Please Login to Access", 401))
    return res.status(401).json({ message: "Please Login to Access" });
  }

  const decodedData = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decodedData.id);
  next();
});

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      // return next(new ErrorHandler(`Role: ${req.user.role} is not allowed`, 403));
      return res
        .status(403)
        .json({ message: `Role: ${req.user.role} is not allowed` });
    }
    next();
  };
};
