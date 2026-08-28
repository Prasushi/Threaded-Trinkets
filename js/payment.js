/* =========================================================
   THREADED TRINKETS
   CHECKOUT + CUSTOMER + UPI PAYMENT + ORDER CREATION
========================================================= */


/* =========================================================
   STORAGE KEYS
========================================================= */

const CART_KEY = "cart";

const OLD_CART_KEY =
    "threadedTrinketsCart";

const CUSTOMER_KEY =
    "threadedTrinketsCustomer";

const ORDERS_KEY =
    "threadedTrinketsOrders";

const LAST_ORDER_KEY =
    "threadedTrinketsLastOrder";

const PAYMENT_STATUS_KEY =
    "threadedTrinketsPaymentStatus";

const PAYMENT_AMOUNT_KEY =
    "threadedTrinketsPaymentAmount";


/* =========================================================
   UPI DETAILS
========================================================= */

const UPI_ID =
    "7842391877@ibl";

const UPI_NAME =
    "Threaded Trinkets";


/* =========================================================
   GET CART
========================================================= */

function getPaymentCart() {

    let cart = [];

    try {

        let savedCart =
            localStorage.getItem(CART_KEY);

        /*
           If the main cart key does not exist,
           also support the older key.
        */

        if (!savedCart) {

            savedCart =
                localStorage.getItem(
                    OLD_CART_KEY
                );

        }


        if (savedCart) {

            const parsed =
                JSON.parse(savedCart);

            if (Array.isArray(parsed)) {
                cart = parsed;
            }

        }

    } catch (error) {

        console.error(
            "Unable to read cart:",
            error
        );

    }


    return cart;
}


/* =========================================================
   GET CUSTOMER
========================================================= */

function getCustomerDetails() {

    try {

        const saved =
            localStorage.getItem(
                CUSTOMER_KEY
            );


        if (!saved) {
            return null;
        }


        const customer =
            JSON.parse(saved);


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


    return null;
}


/* =========================================================
   SAVE CUSTOMER
========================================================= */

function setupCustomerForm() {

    const form =
        document.getElementById(
            "customerForm"
        );


    if (!form) {
        return;
    }


    const savedCustomer =
        getCustomerDetails();


    /*
       Load previously saved details
    */

    if (savedCustomer) {

        const fields = {

            customerName:
                savedCustomer.name,

            customerPhone:
                savedCustomer.phone,

            customerEmail:
                savedCustomer.email,

            customerAddress:
                savedCustomer.address,

            customerCity:
                savedCustomer.city,

            customerState:
                savedCustomer.state,

            customerPincode:
                savedCustomer.pincode,

            customerLandmark:
                savedCustomer.landmark

        };


        Object.keys(fields).forEach(
            function (id) {

                const element =
                    document.getElementById(id);


                if (element) {

                    element.value =
                        fields[id] || "";

                }

            }
        );

    }


    form.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const customer = {

                name:
                    document
                        .getElementById(
                            "customerName"
                        )
                        ?.value
                        .trim() || "",

                phone:
                    document
                        .getElementById(
                            "customerPhone"
                        )
                        ?.value
                        .trim() || "",

                email:
                    document
                        .getElementById(
                            "customerEmail"
                        )
                        ?.value
                        .trim() || "",

                address:
                    document
                        .getElementById(
                            "customerAddress"
                        )
                        ?.value
                        .trim() || "",

                city:
                    document
                        .getElementById(
                            "customerCity"
                        )
                        ?.value
                        .trim() || "",

                state:
                    document
                        .getElementById(
                            "customerState"
                        )
                        ?.value
                        .trim() || "",

                pincode:
                    document
                        .getElementById(
                            "customerPincode"
                        )
                        ?.value
                        .trim() || "",

                landmark:
                    document
                        .getElementById(
                            "customerLandmark"
                        )
                        ?.value
                        .trim() || ""

            };


            if (
                !customer.name ||
                !customer.phone ||
                !customer.address ||
                !customer.city ||
                !customer.state ||
                !customer.pincode
            ) {

                showCustomerMessage(
                    "Please fill all required customer details.",
                    "error"
                );

                return;
            }


            localStorage.setItem(
                CUSTOMER_KEY,
                JSON.stringify(customer)
            );


            showCustomerMessage(
                "Customer details saved successfully ✓",
                "success"
            );

        }
    );

}


/* =========================================================
   CUSTOMER MESSAGE
========================================================= */

function showCustomerMessage(
    message,
    type
) {

    const element =
        document.getElementById(
            "customerMessage"
        );


    if (!element) {
        return;
    }


    element.textContent =
        message;


    element.className =
        "customer-message";


    if (type === "success") {

        element.classList.add(
            "payment-success"
        );

    }


    if (type === "error") {

        element.classList.add(
            "payment-error"
        );

    }

}


/* =========================================================
   ITEM TOTAL
========================================================= */

function getItemTotal(item) {

    const price =
        Number(item.price) || 0;

    const quantity =
        Number(item.quantity) || 1;

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
   FORMAT MONEY
========================================================= */

function formatMoney(amount) {

    return "₹" +
        Number(amount || 0)
            .toLocaleString("en-IN");

}


/* =========================================================
   ESCAPE HTML
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

    const container =
        document.getElementById(
            "checkoutItems"
        );

    const subtotalElement =
        document.getElementById(
            "checkoutSubtotal"
        );

    const totalElement =
        document.getElementById(
            "checkoutTotal"
        );


    if (!container) {
        return;
    }


    const cart =
        getPaymentCart();


    container.innerHTML =
        "";


    if (cart.length === 0) {

        container.innerHTML = `

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


        if (subtotalElement) {
            subtotalElement.textContent =
                formatMoney(0);
        }


        if (totalElement) {
            totalElement.textContent =
                formatMoney(0);
        }


        disablePaymentSection();

        return;
    }


    let subtotal = 0;


    cart.forEach(
        function(item) {

            const itemTotal =
                getItemTotal(item);


            const quantity =
                Number(item.quantity) || 1;


            subtotal +=
                itemTotal;


            const element =
                document.createElement("div");


            element.className =
                "checkout-item";


            element.innerHTML = `

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


            container.appendChild(element);

        }
    );


    if (subtotalElement) {

        subtotalElement.textContent =
            formatMoney(subtotal);

    }


    if (totalElement) {

        totalElement.textContent =
            formatMoney(subtotal);

    }

}


/* =========================================================
   CART COUNT
========================================================= */

function updatePaymentCartCount() {

    const element =
        document.getElementById(
            "cartCount"
        );


    if (!element) {
        return;
    }


    const cart =
        getPaymentCart();


    let count = 0;


    cart.forEach(
        function(item) {

            const quantity =
                Number(item.quantity);


            count +=
                quantity > 0
                    ? quantity
                    : 1;

        }
    );


    element.textContent =
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


/* =========================================================
   DISPLAY UPI ID
========================================================= */

function displayUPIId() {

    const element =
        document.getElementById(
            "upiIdDisplay"
        );


    if (element) {

        element.textContent =
            UPI_ID;

    }

}


/* =========================================================
   CREATE QR
========================================================= */

function createQRCode() {

    const qr =
        document.getElementById(
            "upiQRCode"
        );


    if (!qr) {
        return;
    }


    qr.innerHTML =
        "";


    const amount =
        getPaymentTotal();


    if (
        amount <= 0 ||
        typeof QRCode === "undefined"
    ) {

        return;

    }


    try {

        new QRCode(
            qr,
            {
                text:
                    createUPILink(),

                width:
                    260,

                height:
                    260,

                correctLevel:
                    QRCode.CorrectLevel.H

            }
        );

    } catch (error) {

        console.error(
            "QR code error:",
            error
        );

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
        async function() {

            setPaymentMessage(
                "UPI payment opened. Complete the payment and return here.",
                "warning"
            );

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

    }


    if (type === "warning") {

        element.classList.add(
            "payment-warning"
        );

    }


    if (type === "error") {

        element.classList.add(
            "payment-error"
        );

    }

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


            const customer =
                getCustomerDetails();


            if (!customer) {

                setPaymentMessage(
                    "Please save your customer details first.",
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

                status.className =
                    "payment-success";

            }


            setPaymentMessage(
                "Thank you. You can now confirm your order.",
                "success"
            );


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
                    "Please save customer details first."
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
                    "Please confirm that you completed the UPI payment first."
                );

                return;

            }


            /* =====================================
               CREATE COMPLETE ORDER
            ===================================== */

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

                paymentMethod:
                    "UPI",

                paymentStatus:
                    "Customer Confirmed Payment",

                paymentVerification:
                    "Customer confirmed payment on website. Automatic UPI verification is not available.",

                upiId:
                    UPI_ID,

                createdAt:
                    new Date().toISOString(),

                orderStatus:
                    "New"

            };


            /* =====================================
               SAVE ALL ORDERS
            ===================================== */

            let orders = [];


            try {

                orders =
                    JSON.parse(
                        localStorage.getItem(
                            ORDERS_KEY
                        )
                    ) || [];


                if (!Array.isArray(orders)) {
                    orders = [];
                }

            } catch (error) {

                orders = [];

            }


            orders.unshift(order);


            localStorage.setItem(
                ORDERS_KEY,
                JSON.stringify(orders)
            );

            /* =====================================
               SAVE TO CLOUD ORDERS (GOOGLE SHEETS)
               This is awaited before leaving checkout
               so the order is not lost between devices.
            ===================================== */
            try {
                const ordersApi =
                    "https://script.google.com/macros/s/AKfycbxWnapTLFStJ7VYJd4XqWPi-QArun6dSP_ws7WiN0_-FgcAqmN-g2v_fbW6Q2_fYbfE0A/exec";

                const cloudResponse = await fetch(ordersApi, {
                    method: "POST",
                    headers: {
                        "Content-Type": "text/plain;charset=utf-8"
                    },
                    body: JSON.stringify(order)
                });

                if (!cloudResponse.ok) {
                    throw new Error("Orders API HTTP " + cloudResponse.status);
                }
            } catch (cloudError) {
                console.error("Cloud order save failed:", cloudError);

                alert(
                    "Your order was saved on this device, but could not be sent to the online Orders system. Please try again."
                );
                return;
            }


            /* =====================================
               SAVE LAST ORDER
            ===================================== */

            localStorage.setItem(
                LAST_ORDER_KEY,
                JSON.stringify(order)
            );


            /* =====================================
               CLEAR CART
            ===================================== */

            localStorage.removeItem(
                CART_KEY
            );

            localStorage.removeItem(
                OLD_CART_KEY
            );


            /* =====================================
               CLEAR PAYMENT STATE
            ===================================== */

            localStorage.removeItem(
                PAYMENT_STATUS_KEY
            );

            localStorage.removeItem(
                PAYMENT_AMOUNT_KEY
            );


            /* =====================================
               SUCCESS PAGE
            ===================================== */

            window.location.href =
                "order-success.html";

        }
    );

}


/* =========================================================
   DISABLE PAYMENT
========================================================= */

function disablePaymentSection() {

    const elements = [

        "openUpiBtn",
        "paymentSuccessBtn",
        "confirmOrderBtn"

    ];


    elements.forEach(
        function(id) {

            const element =
                document.getElementById(id);


            if (element) {

                element.style.display =
                    "none";

            }

        }
    );

}


/* =========================================================
   START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        displayPaymentOrder();

        updatePaymentCartCount();

        setupCustomerForm();

        displayUPIId();

        createQRCode();

        setupOpenUPI();

        setupPaymentConfirmation();

        setupConfirmOrder();

    }
);
