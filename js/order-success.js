/* =========================================
   THREADED TRINKETS
   ORDER SUCCESS JAVASCRIPT
========================================= */


/* =========================================
   GET LAST ORDER
========================================= */

function getLastOrder() {

    const savedOrder =
        localStorage.getItem(
            "threadedTrinketsLastOrder"
        );

    if (!savedOrder) {
        return null;
    }

    try {

        return JSON.parse(savedOrder);

    } catch (error) {

        console.error(
            "Unable to read last order:",
            error
        );

        return null;
    }
}


/* =========================================
   DISPLAY ORDER DETAILS
========================================= */

function displaySuccessDetails() {

    const order =
        getLastOrder();


    /* =====================================
       NO ORDER FOUND
    ===================================== */

    if (!order) {

        console.warn(
            "No completed order found."
        );

        return;
    }


    /* =====================================
       ORDER ID
    ===================================== */

    const orderId =
        document.getElementById(
            "successOrderId"
        );

    if (orderId) {

        orderId.textContent =
            order.orderId || "—";

    }


    /* =====================================
       CUSTOMER
    ===================================== */

    const customerName =
        document.getElementById(
            "successCustomer"
        );


    if (
        customerName &&
        order.customer
    ) {

        customerName.textContent =
            order.customer.fullName || "—";

    }


    /* =====================================
       PHONE
    ===================================== */

    const customerPhone =
        document.getElementById(
            "successPhone"
        );


    if (
        customerPhone &&
        order.customer
    ) {

        customerPhone.textContent =
            order.customer.phone || "—";

    }


    /* =====================================
       TOTAL
    ===================================== */

    const total =
        document.getElementById(
            "successTotal"
        );


    if (total) {

        total.textContent =
            `₹${Number(
                order.total || 0
            ).toLocaleString("en-IN")}`;

    }

}


/* =========================================
   UPDATE CART COUNT
========================================= */

function updateSuccessCartCount() {

    const cartCount =
        document.getElementById(
            "cartCount"
        );


    if (!cartCount) {
        return;
    }


    const savedCart =
        localStorage.getItem(
            "threadedTrinketsCart"
        );


    if (!savedCart) {

        cartCount.textContent = "0";

        return;
    }


    try {

        const cart =
            JSON.parse(savedCart);


        const count =
            Array.isArray(cart)

                ? cart.reduce(
                    (total, item) =>
                        total +
                        Number(
                            item.quantity || 0
                        ),
                    0
                )

                : 0;


        cartCount.textContent =
            count;


    } catch (error) {

        cartCount.textContent =
            "0";

    }

}


/* =========================================
   START
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        displaySuccessDetails();

        updateSuccessCartCount();

    }
);