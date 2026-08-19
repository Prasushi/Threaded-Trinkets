```javascript
/* =========================================
   THREADED TRINKETS
   CHECKOUT + UPI PAYMENT JAVASCRIPT

   IMPORTANT:
   This is a FRONTEND payment interface.

   It does NOT automatically verify UPI
   transactions.

   The customer manually confirms that
   payment was completed.
========================================= */


/* =========================================
   STORAGE KEYS
========================================= */

const PAYMENT_CART_KEY =
    "threadedTrinketsCart";

const CUSTOMER_KEY =
    "threadedTrinketsCustomer";

const LAST_ORDER_KEY =
    "threadedTrinketsLastOrder";

const PAYMENT_STATUS_KEY =
    "threadedTrinketsPaymentStatus";

const PAYMENT_AMOUNT_KEY =
    "threadedTrinketsPaymentAmount";


/* =========================================
   UPI DETAILS
========================================= */

const UPI_ID =
    "7842391877@ibl";

const UPI_NAME =
    "Threaded Trinkets";


/* =========================================
   GET CART
========================================= */

function getPaymentCart() {

    const savedCart =
        localStorage.getItem(
            PAYMENT_CART_KEY
        );

    if (!savedCart) {
        return [];
    }

    try {

        const cart =
            JSON.parse(savedCart);

        if (!Array.isArray(cart)) {
            return [];
        }

        return cart;

    } catch (error) {

        console.error(
            "Unable to read cart:",
            error
        );

        return [];
    }
}


/* =========================================
   GET CUSTOMER
========================================= */

function getCustomerDetails() {

    const savedCustomer =
        localStorage.getItem(
            CUSTOMER_KEY
        );

    if (!savedCustomer) {
        return null;
    }

    try {

        return JSON.parse(
            savedCustomer
        );

    } catch (error) {

        console.error(
            "Unable to read customer:",
            error
        );

        return null;
    }
}


/* =========================================
   CALCULATE ITEM PRICE
========================================= */

function getItemTotal(item) {

    const price =
        Number(item.price) || 0;

    const quantity =
        Number(item.quantity) || 0;

    return price * quantity;
}


/* =========================================
   CALCULATE CART TOTAL
========================================= */

function getPaymentTotal() {

    const cart =
        getPaymentCart();

    return cart.reduce(
        function(total, item) {

            return total +
                getItemTotal(item);

        },
        0
    );
}


/* =========================================
   FORMAT MONEY
========================================= */

function formatMoney(amount) {

    return "₹" +
        Number(amount || 0)
            .toLocaleString(
                "en-IN"
            );
}


/* =========================================
   DISPLAY ORDER ITEMS
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


    if (!paymentItems) {
        return;
    }


    const cart =
        getPaymentCart();


    paymentItems.innerHTML = "";


    /* =====================================
       EMPTY CART
    ===================================== */

    if (cart.length === 0) {

        paymentItems.innerHTML = `

            <div class="checkout-empty">

                <h3>
                    Your cart is empty
                </h3>

                <p>
                    Please add products before
                    proceeding to checkout.
                </p>

                <a href="products.html">
                    Continue Shopping
                </a>

            </div>

        `;


        if (paymentSubtotal) {
            paymentSubtotal.textContent =
                formatMoney(0);
        }


        if (paymentTotal) {
            paymentTotal.textContent =
                formatMoney(0);
        }


        disablePaymentSection();

        return;
    }


    /* =====================================
       DISPLAY ITEMS
    ===================================== */

    let subtotal = 0;


    cart.forEach(
        function(item) {

            const itemTotal =
                getItemTotal(item);


            const quantity =
                Number(
                    item.quantity
                ) || 0;


            subtotal +=
                itemTotal;


            const itemElement =
                document.createElement(
                    "div"
                );


            itemElement.className =
                "checkout-item";


            const itemName =
                escapeHTML(
                    item.name ||
                    "Product"
                );


            itemElement.innerHTML = `

                <div>

                    <div class="checkout-item-name">
                        ${itemName}
                    </div>

                    <div class="checkout-item-quantity">
                        Quantity: ${quantity}
                    </div>

                </div>

                <div class="checkout-item-price">
                    ${formatMoney(itemTotal)}
                </div>

            `;


            paymentItems.appendChild(
                itemElement
            );

        }
    );


    /* =====================================
       DISPLAY TOTALS
    ===================================== */

    if (paymentSubtotal) {

        paymentSubtotal.textContent =
            formatMoney(subtotal);

    }


    if (paymentTotal) {

        paymentTotal.textContent =
            formatMoney(subtotal);

    }
}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(value) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        String(value);

    return div.innerHTML;
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
            function(total, item) {

                return total +
                    (
                        Number(
                            item.quantity
                        ) || 0
                    );

            },
            0
        );


    cartCount.textContent =
        count;
}


/* =========================================
   CREATE UPI PAYMENT LINK
========================================= */

function createUPILink() {

    const amount =
        getPaymentTotal();


    if (amount <= 0) {
        return "#";
    }


    const params =
        new URLSearchParams();


    params.set(
        "pa",
        UPI_ID
    );


    params.set(
        "pn",
        UPI_NAME
    );


    params.set(
        "am",
        amount.toFixed(2)
    );


    params.set(
        "cu",
        "INR"
    );


    params.set(
        "tn",
        "Threaded Trinkets Order"
    );


    return (
        "upi://pay?" +
        params.toString()
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


    qrElement.innerHTML = "";


    const amount =
        getPaymentTotal();


    if (
        amount <= 0 ||
        typeof QRCode === "undefined"
    ) {
        return;
    }


    const upiLink =
        createUPILink();


    try {

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

    } catch (error) {

        console.error(
            "QR code error:",
            error
        );

        qrElement.innerHTML = `

            <p class="payment-error">
                Unable to generate QR code.
                Please use the UPI ID instead.
            </p>

        `;
    }
}


/* =========================================
   SETUP PAY WITH UPI
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

            setPaymentMessage(
                "UPI payment opened. Complete the payment in your UPI app, then return to this page.",
                "warning"
            );

        }
    );
}


/* =========================================
   PAYMENT CONFIRMATION BUTTON
========================================= */

function setupPaymentConfirmation() {

    const button =
        document.getElementById(
            "paymentSuccessBtn"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        function() {

            const total =
                getPaymentTotal();


            if (total <= 0) {

                setPaymentMessage(
                    "Your cart is empty.",
                    "error"
                );

                return;
            }


            /*
               This does NOT verify the UPI
               transaction.

               It only records that the
               customer confirmed payment.
            */

            localStorage.setItem(
                PAYMENT_STATUS_KEY,
                "Customer Confirmed Payment"
            );


            localStorage.setItem(
                PAYMENT_AMOUNT_KEY,
                total.toString()
            );


            const status =
                document.getElementById(
                    "paymentStatus"
                );


            if (status) {

                status.textContent =
                    "Payment marked as completed ✓";

                status.classList.remove(
                    "payment-warning",
                    "payment-error"
                );

                status.classList.add(
                    "payment-success"
                );
            }


            const message =
                document.getElementById(
                    "paymentMessage"
                );


            if (message) {

                message.textContent =
                    "Thank you. You can now confirm your order.";

            }


            /*
               Hide UPI button
            */

            const openButton =
                document.getElementById(
                    "openUpiBtn"
                );


            if (openButton) {

                openButton.style.display =
                    "none";

            }


            /*
               Hide payment confirmation
               button
            */

            button.style.display =
                "none";


            /*
               Show order confirmation
            */

            const confirmButton =
                document.getElementById(
                    "confirmOrderBtn"
                );


            if (confirmButton) {

                confirmButton.style.display =
                    "block";

            }

        }
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


            /* =================================
               VALIDATION
            ================================= */

            if (cart.length === 0) {

                alert(
                    "Your cart is empty."
                );

                return;
            }


            if (!customer) {

                alert(
                    "Customer details were not found. Please return to checkout and enter your details."
                );

                return;
            }


            if (total <= 0) {

                alert(
                    "Invalid order amount."
                );

                return;
            }


            const paymentStatus =
                localStorage.getItem(
                    PAYMENT_STATUS_KEY
                );


            if (
                paymentStatus !==
                "Customer Confirmed Payment"
            ) {

                alert(
                    "Please confirm that you have completed the UPI payment first."
                );

                return;
            }


            /* =================================
               CREATE ORDER
            ================================= */

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
                    "Customer Confirmed Payment",

                paymentMethod:
                    "UPI",

                paymentVerification:
                    "Frontend customer confirmation - not automatically verified",

                upiId:
                    UPI_ID,

                createdAt:
                    new Date().toISOString()

            };


            /* =================================
               SAVE LAST ORDER
            ================================= */

            localStorage.setItem(
                LAST_ORDER_KEY,
                JSON.stringify(order)
            );


            /* =================================
               CLEAR CART
            ================================= */

            localStorage.removeItem(
                PAYMENT_CART_KEY
            );


            /* =================================
               CLEAR PAYMENT STATE
            ================================= */

            localStorage.removeItem(
                PAYMENT_STATUS_KEY
            );

            localStorage.removeItem(
                PAYMENT_AMOUNT_KEY
            );


            /* =================================
               GO TO SUCCESS PAGE
            ================================= */

            window.location.href =
                "order-success.html";

        }
    );
}


/* =========================================
   PAYMENT MESSAGE
========================================= */

function setPaymentMessage(
    message,
    type
) {

    const element =
        document.getElementById(
            "paymentMessage"
        );


    if (!element) {
        return;
    }


    element.textContent =
        message;


    element.classList.remove(
        "payment-success",
        "payment-warning",
        "payment-error"
    );


    if (type === "success") {

        element.classList.add(
            "payment-success"
        );

    } else if (type === "warning") {

        element.classList.add(
            "payment-warning"
        );

    } else if (type === "error") {

        element.classList.add(
            "payment-error"
        );

    }
}


/* =========================================
   DISABLE PAYMENT SECTION
========================================= */

function disablePaymentSection() {

    const openButton =
        document.getElementById(
            "openUpiBtn"
        );

    const successButton =
        document.getElementById(
            "paymentSuccessBtn"
        );

    const confirmButton =
        document.getElementById(
            "confirmOrderBtn"
        );


    if (openButton) {

        openButton.style.display =
            "none";

    }


    if (successButton) {

        successButton.style.display =
            "none";

    }


    if (confirmButton) {

        confirmButton.style.display =
            "none";

    }
}


/* =========================================
   INITIALIZE CHECKOUT
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        displayPaymentOrder();

        updatePaymentCartCount();

        displayUPIId();

        createQRCode();

        setupOpenUPI();

        setupPaymentConfirmation();

        setupConfirmOrder();

    }
);
```
