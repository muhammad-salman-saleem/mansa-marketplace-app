const asyncErrorHandler = require('../middlewares/helpers/asyncErrorHandler');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const paytm = require('paytmchecksum');
const https = require('https');
const Payment = require('../models/paymentModel');
const { v4: uuidv4 } = require('uuid');


exports.processPaymentStripe = async (req, res, next) => {
    try {
        const { amount, email, phoneNo } = req.body;
        const actualAmount = amount * 100

        const myPayment = await stripe.paymentIntents.create({
            amount: actualAmount,
            currency: "inr",
            receipt_email: email,
            metadata: {
                company: "AtEMkart",
            },
        });
        console.log('myPayment :>> ', myPayment);
        await addPayment({
            resultInfo: {
                resultStatus: "Success",
                resultCode: "Success",
                resultMsg: "Payment successful",
            },
            txnId: myPayment.id,
            bankTxnId: myPayment.client_secret,
            orderId: "oid" + uuidv4(),
            txnAmount: `${(actualAmount / 100).toFixed(2)} ${myPayment.currency}`,
            txnType: "Credit",
            gatewayName: "Stripe",
            bankName: "MCB International bank",
            mid: process.env.STRIPE_ACCOUNT_MID,
            paymentMode: "Card",
            refundAmt: "0",
            txnDate: new Date().toISOString(),
        });

        res.status(200).json({
            success: true,
            client_secret: myPayment.client_secret,
        });
    } catch (error) {
        console.error("Error creating payment intent of Stripe:", error);
        res.status(500).json({ success: false, error: "Error creating payment intent of Stripe" });
    }
};


exports.sendStripeApiKey = asyncErrorHandler(async (req, res, next) => {
    res.status(200).json({ stripeApiKey: process.env.STRIPE_API_KEY });
});

// Process Payment Paytm
exports.processPaymentPaytm = asyncErrorHandler(async (req, res, next) => {
    try {
        const { amount, email, phoneNo } = req.body;
        var params = {};

        /* initialize an array */
        params["MID"] = process.env.PAYTM_MID;
        params["WEBSITE"] = process.env.PAYTM_WEBSITE;
        params["CHANNEL_ID"] = process.env.PAYTM_CHANNEL_ID;
        params["INDUSTRY_TYPE_ID"] = process.env.PAYTM_INDUSTRY_TYPE;
        params["ORDER_ID"] = "oid" + uuidv4();
        params["CUST_ID"] = process.env.PAYTM_CUST_ID;
        params["TXN_AMOUNT"] = JSON.stringify(amount);
        // params["CALLBACK_URL"] = `${req.protocol}://${req.get("host")}/api/v1/callback`;
        params["CALLBACK_URL"] = `https://${req.get("host")}/api/v1/callback`;
        params["EMAIL"] = email;
        params["MOBILE_NO"] = phoneNo;

        let paytmChecksum = paytm.generateSignature(params, process.env.PAYTM_MERCHANT_KEY);
        paytmChecksum.then(function (checksum) {

            let paytmParams = {
                ...params,
                "CHECKSUMHASH": checksum,
            };

            res.status(200).json({
                success: true,
                paytmParams
            });

        }).catch(function (error) {
            console.log(error.message);
        });
    } catch (error) {
        console.error("Error creating payment intent of Paytm:", error);
        res.status(500).json({ success: false, error: "Error creating payment intent of Paytm" });
    }

});

// Paytm Callback
exports.paytmResponse = (req, res, next) => {
    try {
        let paytmChecksum = req.body.CHECKSUMHASH;
        delete req.body.CHECKSUMHASH;

        let isVerifySignature = paytm.verifySignature(req.body, process.env.PAYTM_MERCHANT_KEY, paytmChecksum);
        if (isVerifySignature) {
            // console.log("Checksum Matched");

            var paytmParams = {};

            paytmParams.body = {
                "mid": req.body.MID,
                "orderId": req.body.ORDERID,
            };

            paytm.generateSignature(JSON.stringify(paytmParams.body), process.env.PAYTM_MERCHANT_KEY).then(function (checksum) {

                paytmParams.head = {
                    "signature": checksum
                };

                /* prepare JSON string for request */
                var post_data = JSON.stringify(paytmParams);

                var options = {
                    /* for Staging */
                    hostname: 'securegw-stage.paytm.in',
                    /* for Production */
                    // hostname: 'securegw.paytm.in',
                    port: 443,
                    path: '/v3/order/status',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': post_data.length
                    }
                };

                // Set up the request
                var response = "";
                var post_req = https.request(options, function (post_res) {
                    post_res.on('data', function (chunk) {
                        response += chunk;
                    });

                    post_res.on('end', function () {
                        let { body } = JSON.parse(response);
                        // let status = body.resultInfo.resultStatus;
                        // res.json(body);
                        addPayment(body);
                        // res.redirect(`${req.protocol}://${req.get("host")}/order/${body.orderId}`)
                        res.redirect(`https://${req.get("host")}/order/${body.orderId}`)
                    });
                });

                // post the data
                post_req.write(post_data);
                post_req.end();
            });

        } else {
            console.log("Checksum Mismatched");
        }
    } catch (error) {
        console.error("Error in Callback Function", error);
        res.status(500).json({ success: false, error: "Error in Callback Function" });
    }


}

const addPayment = async (data) => {
    try {
        await Payment.create(data);
    } catch (error) {
        console.log("Payment Failed!");
    }
}

exports.getPaymentStatus = asyncErrorHandler(async (req, res, next) => {

    try {
        const payment = await Payment.findOne({ orderId: req.params.id });

        if (!payment) {
            // return next(new ErrorHandler("Payment Details Not Found", 404));
            return res.status(404).json({ message: "Payment Details Not Found" });
        }

        const txn = {
            id: payment.txnId,
            status: payment.resultInfo.resultStatus,
        }

        res.status(200).json({
            success: true,
            txn,
        });
    } catch (error) {
        console.error("Error in Payment Status", error);
        res.status(500).json({ success: false, error: "Error in Payment Status" });
    }

});
