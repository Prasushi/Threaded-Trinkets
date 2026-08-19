/* =========================================
   THREADED TRINKETS
   PAYMENT JAVASCRIPT
========================================= */

const PAYMENT_CART_KEY =
    "threadedTrinketsCart";

const CUSTOMER_KEY =
    "threadedTrinketsCustomer";

const PENDING_ORDER_KEY =
    "threadedTrinketsPendingOrder";

const UPI_ID =
    "7842391877@ibl";


/* =========================================
   GET CART
========================================= */

function getPaymentCart() {

    const savedCart =
        localStorage.getItem(PAYMENT_CART_KEY);

    if (!savedCart) {
        return [];
    }

    try {

        const cart =
            JSON.parse(savedCart);

        return Array.isArray(cart)
            ? cart
            : [];

    } catch (error) {

        console.error(
            "Cart error:",
            error
        );

        return [];
    }
}


/* =========================================
   GET CUSTOMER
========================================= */

function getCustomerDetails() {

    const saved =
        localStorage.getItem(CUSTOMER_KEY);

    if (!saved) {
        return null;
    }

    try {

        return JSON.parse(saved);

    } catch (error) {

        return null;
    }
}


/* =========================================
   CALCULATE TOTAL
========================================= */

function getPaymentTotal() {

    const cart =
        getPaymentCart();

    return cart.reduce(
        (total, item) => {

            return total +
                (
                    Number(item.price || 0) *
                    Number(item.quantity || 0)
                );

        },
        0
    );
}


/* =========================================
   DISPLAY ORDER
========================================= */

function displayPaymentOrder() {

    const paymentItems =
        document.getElementById(
            "paymentItems"
        );

    const paymentSubtotal =
        document.getElementById(
            "paymentSubtotal"
        );

    const paymentTotal =
        document.getElementById(
            "paymentTotal"
        );

    const paymentTotalSummary =
        document.getElementById(
            "paymentTotalSummary"
        );


    if (!paymentItems) {
        return;
    }


    const cart =
        getPaymentCart();


    paymentItems.innerHTML = "";


    if (cart.length === 0) {

        paymentItems.innerHTML = `

            <div class="checkout-empty">

                <h3>
                    Your cart is empty
                </h3>

                <p>
                    Please add products before making payment.
                </p>

                <a href="products.html">
                    Continue Shopping
                </a>

            </div>

        `;

        if (paymentSubtotal) {
            paymentSubtotal.textContent = "₹0";
        }

        if (paymentTotal) {
            paymentTotal.textContent = "₹0";
        }

        if (paymentTotalSummary) {
            paymentTotalSummary.textContent = "₹0";
        }

        return;
    }


    let subtotal = 0;


    cart.forEach(item => {

        const price =
            Number(item.price || 0);

        const quantity =
            Number(item.quantity || 0);

        const itemTotal =
            price * quantity;


        subtotal += itemTotal;


        const itemElement =
            document.createElement("div");


        itemElement.className =
            "checkout-item";


        itemElement.innerHTML = `

            <div>

                <div class="checkout-item-name">
                    ${item.name}
                </div>

                <div class="checkout-item-quantity">
                    Quantity: ${quantity}
                </div>

            </div>

            <div class="checkout-item-price">
                ₹${itemTotal}
            </div>

        `;


        paymentItems.appendChild(
            itemElement
        );

    });


    paymentSubtotal.textContent =
        `₹${subtotal}`;

    paymentTotal.textContent =
        `₹${subtotal}`;

    paymentTotalSummary.textContent =
        `₹${subtotal}`;
}


/* =========================================
   CART COUNT
========================================= */

function updatePaymentCartCount() {

    const cartCount =
        document.getElementById(
            "cartCount"
        );

    if (!cartCount) {
        return;
    }


    const cart =
        getPaymentCart();


    const count =
        cart.reduce(
            (total, item) => {

                return total +
                    Number(
                        item.quantity || 0
                    );

            },
            0
        );


    cartCount.textContent =
        count;
}


/* =========================================
   CREATE UPI LINK
========================================= */

function createUPILink() {

    const amount =
        getPaymentTotal();


    return (
        "upi://pay" +

        "?pa=" +
        encodeURIComponent(UPI_ID) +

        "&pn=" +
        encodeURIComponent(
            "Threaded Trinkets"
        ) +

        "&am=" +
        encodeURIComponent(
            amount.toFixed(2)
        ) +

        "&cu=INR" +

        "&tn=" +
        encodeURIComponent(
            "Threaded Trinkets Order"
        )
    );
}


/* =========================================
   CREATE QR CODE
========================================= */

function createQRCode() {

    const qrElement =
        document.getElementById(
            "upiQRCode"
        );


    if (!qrElement) {
        return;
    }


    const amount =
        getPaymentTotal();


    qrElement.innerHTML = "";


    if (amount <= 0) {
        return;
    }


    const upiLink =
        createUPILink();


    new QRCode(
        qrElement,
        {
            text: upiLink,
            width: 260,
            height: 260,
            correctLevel:
                QRCode.CorrectLevel.H
        }
    );
}


/* =========================================
   DISPLAY UPI ID
========================================= */

function displayUPIId() {

    const element =
        document.getElementById(
            "upiIdDisplay"
        );


    if (!element) {
        return;
    }


    element.textContent =
        UPI_ID;
}


/* =========================================
   OPEN UPI
========================================= */

function setupOpenUPI() {

    const button =
        document.getElementById(
            "openUpiBtn"
        );


    if (!button) {
        return;
    }


    const amount =
        getPaymentTotal();


    if (amount <= 0) {

        button.style.display =
            "none";

        return;
    }


    const upiLink =
        createUPILink();


    button.href =
        upiLink;


    button.addEventListener(
        "click",
        function() {

            const status =
                document.getElementById(
                    "paymentStatus"
                );


            const message =
                document.getElementById(
                    "paymentMessage"
                );


            if (status) {

                status.textContent =
                    "Payment Processing...";

            }


            if (message) {

                message.textContent =
                    "Complete the UPI payment. After returning to the website, your order can be confirmed.";

            }

        }
    );
}


/* =========================================
   PAYMENT SUCCESS
========================================= */

function showPaymentSuccess() {

    const status =
        document.getElementById(
            "paymentStatus"
        );

    const successButton =
        document.getElementById(
            "paymentSuccessBtn"
        );

    const confirmButton =
        document.getElementById(
            "confirmOrderBtn"
        );

    const openButton =
        document.getElementById(
            "openUpiBtn"
        );

    const message =
        document.getElementById(
            "paymentMessage"
        );


    if (status) {

        status.textContent =
            "Payment Successful ✓";

        status.classList.add(
            "payment-success"
        );
    }


    if (openButton) {

        openButton.style.display =
            "none";
    }


    if (successButton) {

        successButton.style.display =
            "block";
    }


    if (confirmButton) {

        confirmButton.style.display =
            "block";
    }


    if (message) {

        message.textContent =
            "Your payment has been completed successfully.";

    }


    localStorage.setItem(
        "threadedTrinketsPaymentStatus",
        "Payment Successful"
    );


    localStorage.setItem(
        "threadedTrinketsPaymentAmount",
        getPaymentTotal().toString()
    );
}


/* =========================================
   CONFIRM ORDER
========================================= */

function setupConfirmOrder() {

    const button =
        document.getElementById(
            "confirmOrderBtn"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        function() {

            const cart =
                getPaymentCart();


            const customer =
                getCustomerDetails();


            const total =
                getPaymentTotal();


            if (
                cart.length === 0 ||
                !customer ||
                total <= 0
            ) {

                alert(
                    "Unable to confirm the order."
                );

                return;
            }


            const order = {

                orderId:
                    "TT" +
                    Date.now(),

                customer:
                    customer,

                items:
                    cart,

                subtotal:
                    total,

                delivery:
                    0,

                total:
                    total,

                paymentStatus:
                    "Payment Successful",

                paymentMethod:
                    "UPI",

                createdAt:
                    new Date().toISOString()

            };


            localStorage.setItem(
                "threadedTrinketsLastOrder",
                JSON.stringify(order)
            );


            /*
               CLEAR CART
            */

            localStorage.removeItem(
                PAYMENT_CART_KEY
            );


            /*
               GO TO SUCCESS PAGE
            */

            window.location.href =
                "order-success.html";

        }
    );
}


/* =========================================
   DEMO PAYMENT FLOW
========================================= */

/*
   IMPORTANT:

   A normal HTML/JavaScript website cannot
   actually verify PhonePe's transaction.

   This demo flow removes the confirmation
   question and displays the success state
   after the UPI payment flow is initiated.

   For real automatic verification, a
   PhonePe/payment-gateway backend is required.
*/

function setupDemoPaymentFlow() {

    const openButton =
        document.getElementById(
            "openUpiBtn"
        );


    if (!openButton) {
        return;
    }


    openButton.addEventListener(
        "click",
        function() {

            /*
               Demo presentation flow.

               Give the UPI app time to open.
            */

            setTimeout(
                function() {

                    showPaymentSuccess();

                },
                4000
            );

        }
    );
}


/* =========================================
   START
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        displayPaymentOrder();

        updatePaymentCartCount();

        displayUPIId();

        createQRCode();

        setupOpenUPI();

        setupConfirmOrder();

        setupDemoPaymentFlow();

    }
);
