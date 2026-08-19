/* =========================================
   THREADED TRINKETS
   CHECKOUT + UPI PAYMENT
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
   CALCULATE ITEM TOTAL
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
            .toLocaleString("en-IN");
}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        String(value);

    return div.innerHTML;
}


/* =========================================
   DISPLAY ORDER
========================================= */

function displayPaymentOrder() {

    const checkoutItems =
        document.getElementById(
            "checkoutItems"
        );

    const checkoutSubtotal =
        document.getElementById(
            "checkoutSubtotal"
        );

    const checkoutTotal =
        document.getElementById(
            "checkoutTotal"
        );


    if (!checkoutItems) {
        return;
    }


    const cart =
        getPaymentCart();


    checkoutItems.innerHTML = "";


    if (cart.length === 0) {

        checkoutItems.innerHTML = `

            <div class="checkout-empty">

                <h3>Your cart is empty</h3>

                <p>
                    Please add products before
                    proceeding to checkout.
                </p>

                <a href="products.html">
                    Continue Shopping
                </a>

            </div>

        `;


        if (checkoutSubtotal) {
            checkoutSubtotal.textContent =
                formatMoney(0);
        }


        if (checkoutTotal) {
            checkoutTotal.textContent =
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
                Number(item.quantity) || 0;

            subtotal += itemTotal;


            const itemElement =
                document.createElement("div");

            itemElement.className =
                "checkout-item";


            const itemName =
                escapeHTML(
                    item.name || "Product"
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


            checkoutItems.appendChild(
                itemElement
            );

        }
    );


    if (checkoutSubtotal) {

        checkoutSubtotal.textContent =
            formatMoney(subtotal);

    }


    if (checkoutTotal) {

        checkoutTotal.textContent =
            formatMoney(subtotal);

    }
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
                        Number(item.quantity) || 0
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


    const qrMessage =
        document.getElementById(
            "qrMessage"
        );


    if (qrMessage) {
        qrMessage.textContent = "";
    }


    const amount =
        getPaymentTotal();


    if (amount <= 0) {

        if (qrMessage) {
            qrMessage.textContent =
                "Add products to your cart to generate the payment QR code.";
        }

        return;
    }


    if (
        typeof QRCode === "undefined"
    ) {

        console.error(
            "QRCode library was not loaded."
        );


        if (qrMessage) {
            qrMessage.textContent =
                "QR code library could not be loaded. Please use the UPI ID above.";
        }

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


        if (qrMessage) {

            qrMessage.textContent =
                "Unable to generate QR code. Please use the UPI ID above.";

        }

    }
}


/* =========================================
   CUSTOMER DETAILS FORM
========================================= */

function setupCustomerForm() {

    const form =
        document.getElementById(
            "customerForm"
        );


    if (!form) {
        return;
    }


    const customer =
        getCustomerDetails();


    /*
       Load previously saved details
    */

    if (customer) {

        setInputValue(
            "customerName",
            customer.name
        );

        setInputValue(
            "customerPhone",
            customer.phone
        );

        setInputValue(
            "customerEmail",
            customer.email
        );

        setInputValue(
            "customerAddress",
            customer.address
        );

        setInputValue(
            "customerCity",
            customer.city
        );

        setInputValue(
            "customerState",
            customer.state
        );

        setInputValue(
            "customerPincode",
            customer.pincode
        );

        setInputValue(
            "customerLandmark",
            customer.landmark
        );
    }


    form.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const name =
                getInputValue(
                    "customerName"
                );

            const phone =
                getInputValue(
                    "customerPhone"
                );

            const email =
                getInputValue(
                    "customerEmail"
                );

            const address =
                getInputValue(
                    "customerAddress"
                );

            const city =
                getInputValue(
                    "customerCity"
                );

            const state =
                getInputValue(
                    "customerState"
                );

            const pincode =
                getInputValue(
                    "customerPincode"
                );

            const landmark =
                getInputValue(
                    "customerLandmark"
                );


            /* =================================
               VALIDATION
            ================================= */

            if (
                !name ||
                !phone ||
                !address ||
                !city ||
                !state ||
                !pincode
            ) {

                showCustomerMessage(
                    "Please fill in all required customer details.",
                    "error"
                );

                return;
            }


            const cleanPhone =
                phone.replace(
                    /\D/g,
                    ""
                );


            if (
                cleanPhone.length !== 10
            ) {

                showCustomerMessage(
                    "Please enter a valid 10-digit phone number.",
                    "error"
                );

                return;
            }


            const cleanPincode =
                pincode.replace(
                    /\D/g,
                    ""
                );


            if (
                cleanPincode.length !== 6
            ) {

                showCustomerMessage(
                    "Please enter a valid 6-digit pincode.",
                    "error"
                );

                return;
            }


            /* =================================
               SAVE CUSTOMER
            ================================= */

            const customerDetails = {

                name:
                    name,

                phone:
                    cleanPhone,

                email:
                    email,

                address:
                    address,

                city:
                    city,

                state:
                    state,

                pincode:
                    cleanPincode,

                landmark:
                    landmark

            };


            localStorage.setItem(
                CUSTOMER_KEY,
                JSON.stringify(
                    customerDetails
                )
            );


            showCustomerMessage(
                "Customer details saved successfully ✓",
                "success"
            );

        }
    );
}


/* =========================================
   INPUT HELPERS
========================================= */

function getInputValue(id) {

    const element =
        document.getElementById(id);

    if (!element) {
        return "";
    }

    return element.value.trim();
}


function setInputValue(
    id,
    value
) {

    const element =
        document.getElementById(id);

    if (!element) {
        return;
    }

    element.value =
        value || "";
}


/* =========================================
   CUSTOMER MESSAGE
========================================= */

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


    element.classList.remove(
        "customer-success",
        "customer-error"
    );


    if (type === "success") {

        element.classList.add(
            "customer-success"
        );

    } else {

        element.classList.add(
            "customer-error"
        );

    }
}


/* =========================================
   PAY WITH UPI
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
   PAYMENT CONFIRMATION
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


            const customer =
                getCustomerDetails();


            if (!customer) {

                setPaymentMessage(
                    "Please save your customer details before confirming payment.",
                    "error"
                );

                return;
            }


            /*
               This does NOT automatically
               verify the UPI transaction.
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
                    "Please enter and save your customer details first."
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
                    "TT" + Date.now(),

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


            /*
               Also save order for admin/order
               systems that use this key.
            */

            localStorage.setItem(
                "threadedTrinketsLastOrder",
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

        setupCustomerForm();

        setupOpenUPI();

        setupPaymentConfirmation();

        setupConfirmOrder();

    }
);
