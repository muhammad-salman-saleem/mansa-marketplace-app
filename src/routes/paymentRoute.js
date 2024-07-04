const express = require('express');
const { processPaymentStripe,processPaymentPaytm, paytmResponse, getPaymentStatus,sendStripeApiKey } = require('../controllers/paymentController');
const { isAuthenticatedUser } = require('../middlewares/user_actions/auth');

const router = express.Router();

router.route('/payment/processStripe').post(processPaymentStripe)
router.route('/payment/processPaytm').post(processPaymentPaytm);
router.route('/stripeapikey').get(isAuthenticatedUser, sendStripeApiKey);

router.route('/callback').post(paytmResponse);

router.route('/payment/status/:id').get(isAuthenticatedUser, getPaymentStatus);

module.exports = router;