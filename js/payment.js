/* =========================================================
   THREADED TRINKETS
   CHECKOUT + UPI PAYMENT + ORDER STORAGE
========================================================= */


/* =========================================================
   STORAGE KEYS
========================================================= */

const PAYMENT_CART_KEY = "threadedTrinketsCart";
const NORMAL_CART_KEY = "cart";

const CUSTOMER_KEY = "threadedTrinketsCustomer";

const LAST_ORDER_KEY = "threadedTrinketsLastOrder";
const ORDERS_KEY = "threadedTrinketsOrders";

const PAYMENT_STATUS_KEY = "threadedTrinketsPaymentStatus";
const PAYMENT_AMOUNT_KEY = "threadedTrinketsPaymentAmount";


/* =========================================================
   UPI DETAILS
========================================================= */

const UPI_ID = "7842391877@ibl";
const UPI_NAME = "Threaded Trinkets";


/* =========================================================
   GET CART
   Supports both existing cart keys so other website
   features are not disturbed.
========================================================= */

function getPaymentCart() {

    let cart = [];

    const keys = [
        PAYMENT_CART_KEY,
        NORMAL_CART_KEY
    ];

    for (let i = 0; i < keys.length; i++) {

        try {

            const savedCart =
                localStorage.getItem(keys[i]);

            if (!savedCart) {
                continue;
            }

            const parsedCart =
                JSON.parse(savedCart);

            if (
                Array.isArray(parsedCart) &&
                parsedCart.length > 0
            ) {

                cart = parsedCart;
                break;
            }

        } catch (error) {

            console.error(
                "Unable to read cart:",
                error
            );

        }

    }

    return cart;
}


/* =========================================================
   GET CUSTOMER
========================================================= */

function getCustomerDetails() {

    const possibleKeys = [
        CUSTOMER_KEY,
        "customer",
        "checkoutCustomer",
        "threadedTrinketsCheckoutCustomer"
    ];

    for (
        let i = 0;
        i < possibleKeys.length;
        i++
    ) {

        try {

            const savedCustomer =
                localStorage.getItem(
                    possibleKeys[i]
                );

            if (!savedCustomer) {
                continue;
            }

            const customer =
                JSON.parse(savedCustomer);

            if (
                customer &&
                typeof customer === "object"
            ) {

                return customer;

            }

        } catch (error) {

            console.error(
                "Unable to read customer:",
                error
            );

        }

    }

    return null;
}


/* =========================================================
   ITEM TOTAL
========================================================= */

function getItemTotal(item) {

    const price =
        Number(item.price) || 0;

    const quantity =
        Number(item.quantity) || 0;

    return price * quantity;
}


/* =========================================================
   CART TOTAL
========================================================= */

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


/* =========================================================
   MONEY
========================================================= */

function formatMoney(amount) {

    return "₹" +
        Number(amount || 0)
            .toLocaleString("en-IN");
}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        String(value ?? "");

    return div.innerHTML;
}


/* =========================================================
   DISPLAY ORDER
========================================================= */

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


    let subtotal = 0;


    cart.forEach(function(item) {

        const itemTotal =
            getItemTotal(item);

        const quantity =
            Number(item.quantity) || 0;

        subtotal += itemTotal;


        const itemElement =
            document.createElement("div");

        itemElement.className =
            "checkout-item";


        itemElement.innerHTML = `

            <div>

                <div class="checkout-item-name">
                    ${escapeHTML(
                        item.name || "Product"
                    )}
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

    });


    if (paymentSubtotal) {

        paymentSubtotal.textContent =
            formatMoney(subtotal);

    }


    if (paymentTotal) {

        paymentTotal.textContent =
            formatMoney(subtotal);

    }

}


/* =========================================================
   CART COUNT
========================================================= */

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
                        Number(item.quantity) || 1
                    );

            },
            0
        );


    cartCount.textContent =
        count;

}


/* =========================================================
   CREATE UPI LINK
========================================================= */

function createUPILink() {

    const amount =
        getPaymentTotal();

    if (amount <= 0) {
        return "#";
    }


    const params =
        new URLSearchParams();


    params.set("pa", UPI_ID);
    params.set("pn", UPI_NAME);
    params.set("am", amount.toFixed(2));
    params.set("cu", "INR");
    params.set(
        "tn",
        "Threaded Trinkets Order"
    );


    return (
        "upi://pay?" +
        params.toString()
    );

}


/* =========================================================
   DISPLAY UPI ID
========================================================= */

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


/* =========================================================
   QR CODE
========================================================= */

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


/* =========================================================
   OPEN UPI
========================================================= */

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


    button.href =
        createUPILink();


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


/* =========================================================
   PAYMENT CONFIRMATION
========================================================= */

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


            const openButton =
                document.getElementById(
                    "openUpiBtn"
                );


            if (openButton) {

                openButton.style.display =
                    "none";

            }


            button.style.display =
                "none";


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


/* =========================================================
   SAVE ORDER TO ALL ORDERS
========================================================= */

function saveOrderToOrdersList(order) {

    let orders = [];


    try {

        const savedOrders =
            localStorage.getItem(
                ORDERS_KEY
            );


        if (savedOrders) {

            const parsedOrders =
                JSON.parse(savedOrders);


            if (Array.isArray(parsedOrders)) {
                orders = parsedOrders;
            }

        }

    } catch (error) {

        console.error(
            "Unable to read previous orders:",
            error
        );

    }


    orders.unshift(order);


    localStorage.setItem(
        ORDERS_KEY,
        JSON.stringify(orders)
    );

}


/* =========================================================
   CONFIRM ORDER
========================================================= */

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


            /* =========================================
               CREATE ORDER
            ========================================= */

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


            /* =========================================
               SAVE LATEST ORDER
            ========================================= */

            localStorage.setItem(
                LAST_ORDER_KEY,
                JSON.stringify(order)
            );


            /* =========================================
               SAVE ALL ORDERS
            ========================================= */

            saveOrderToOrdersList(
                order
            );


            /* =========================================
               CLEAR CART
            ========================================= */

            localStorage.removeItem(
                PAYMENT_CART_KEY
            );

            localStorage.removeItem(
                NORMAL_CART_KEY
            );


            /* =========================================
               CLEAR PAYMENT STATE
            ========================================= */

            localStorage.removeItem(
                PAYMENT_STATUS_KEY
            );

            localStorage.removeItem(
                PAYMENT_AMOUNT_KEY
            );


            /* =========================================
               SUCCESS PAGE
            ========================================= */

            window.location.href =
                "order-success.html";

        }
    );

}


/* =========================================================
   PAYMENT MESSAGE
========================================================= */

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


/* =========================================================
   DISABLE PAYMENT
========================================================= */

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


/* =========================================================
   START
========================================================= */

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
