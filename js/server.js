const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const path = require("path");

const app = express();

app.use(express.json());
app.use(express.static(__dirname));


// ==========================================
// RAZORPAY TEST KEYS
// ==========================================
// Replace these with your Razorpay TEST keys.
// NEVER put the Key Secret inside payment.js.

const razorpay = new Razorpay({
    key_id: "YOUR_RAZORPAY_KEY_ID",
    key_secret: "YOUR_RAZORPAY_KEY_SECRET"
});


// ==========================================
// CREATE RAZORPAY ORDER
// ==========================================

app.post("/api/create-order", async (req, res) => {

    try {

        const amount = Number(req.body.amount);

        if (!amount || amount <= 0) {

            return res.status(400).json({
                success: false,
                message: "Invalid payment amount."
            });

        }


        const order = await razorpay.orders.create({

            amount: Math.round(amount * 100),

            currency: "INR",

            receipt:
                "TT_" +
                Date.now(),

            payment_capture: 1

        });


        res.json({

            success: true,

            orderId: order.id,

            amount: order.amount,

            currency: order.currency

        });


    } catch (error) {

        console.error(
            "Razorpay order error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Unable to create payment order."

        });

    }

});


// ==========================================
// VERIFY PAYMENT
// ==========================================

app.post("/api/verify-payment", (req, res) => {

    try {

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;


        if (
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Payment details are incomplete."

            });

        }


        const generatedSignature =
            crypto
                .createHmac(
                    "sha256",
                    razorpay.key_secret
                )
                .update(
                    razorpay_order_id +
                    "|" +
                    razorpay_payment_id
                )
                .digest("hex");


        const valid =
            crypto.timingSafeEqual(

                Buffer.from(
                    generatedSignature,
                    "utf8"
                ),

                Buffer.from(
                    razorpay_signature,
                    "utf8"
                )

            );


        if (!valid) {

            return res.status(400).json({

                success: false,

                message:
                    "Payment verification failed."

            });

        }


        // ==================================
        // PAYMENT IS GENUINE
        // ==================================

        res.json({

            success: true,

            message:
                "Payment verified successfully.",

            paymentId:
                razorpay_payment_id,

            orderId:
                razorpay_order_id

        });


    } catch (error) {

        console.error(
            "Verification error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Unable to verify payment."

        });

    }

});


// ==========================================
// START SERVER
// ==========================================

const PORT = 5500;

app.listen(PORT, () => {

    console.log(
        `Threaded Trinkets running at http://localhost:${PORT}`
    );

});