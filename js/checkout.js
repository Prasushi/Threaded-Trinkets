/* =========================================
   THREADED TRINKETS
   CHECKOUT JAVASCRIPT
========================================= */

const CHECKOUT_CART_KEY =
    "threadedTrinketsCart";

const PRODUCTS_KEY =
    "threadedTrinketsProducts";

const CUSTOMER_KEY =
    "threadedTrinketsCustomer";

const PENDING_ORDER_KEY =
    "threadedTrinketsPendingOrder";


/* =========================================
   GET CART
========================================= */

function getCheckoutCart() {

    const savedCart =
        localStorage.getItem(
            CHECKOUT_CART_KEY
        );

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
            "Unable to read cart:",
            error
        );

        return [];
    }
}


/* =========================================
   GET PRODUCTS
========================================= */

function getCheckoutAdminProducts() {

    const savedProducts =
        localStorage.getItem(
            PRODUCTS_KEY
        );

    if (!savedProducts) {
        return [];
    }

    try {

        const products =
            JSON.parse(savedProducts);

        return Array.isArray(products)
            ? products
            : [];

    } catch (error) {

        console.error(
            "Unable to read products:",
            error
        );

        return [];
    }
}


/* =========================================
   DISPLAY ORDER
========================================= */

function displayCheckoutOrder() {

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
        getCheckoutCart();


    checkoutItems.innerHTML = "";


    /* =====================================
       EMPTY CART
    ===================================== */

    if (cart.length === 0) {

        checkoutItems.innerHTML = `

            <div class="checkout-empty">

                <h3>
                    Your cart is empty
                </h3>

                <p>
                    Please add products before checkout.
                </p>

                <a href="products.html">
                    Continue Shopping
                </a>

            </div>

        `;


        if (checkoutSubtotal) {
            checkoutSubtotal.textContent =
                "₹0";
        }


        if (checkoutTotal) {
            checkoutTotal.textContent =
                "₹0";
        }


        return;
    }


    /* =====================================
       DISPLAY ITEMS
    ===================================== */

    let subtotal = 0;


    cart.forEach(function(item) {

        const quantity =
            Math.max(
                1,
                Number(item.quantity) || 1
            );


        const price =
            Number(item.price) || 0;


        const itemTotal =
            price * quantity;


        subtotal += itemTotal;


        const itemElement =
            document.createElement("div");


        itemElement.className =
            "checkout-item";


        itemElement.innerHTML = `

            <div class="checkout-item-info">

                <div class="checkout-item-name">
                    ${escapeCheckoutHTML(
                        item.name || "Product"
                    )}
                </div>

                <div class="checkout-item-quantity">
                    Quantity: ${quantity}
                </div>

            </div>


            <div class="checkout-item-price">
                ₹${itemTotal}
            </div>

        `;


        checkoutItems.appendChild(
            itemElement
        );

    });


    if (checkoutSubtotal) {

        checkoutSubtotal.textContent =
            `₹${subtotal}`;

    }


    if (checkoutTotal) {

        checkoutTotal.textContent =
            `₹${subtotal}`;

    }

}


/* =========================================
   HTML ESCAPE
========================================= */

function escapeCheckoutHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================
   CART COUNT
========================================= */

function updateCheckoutCartCount() {

    const cartCount =
        document.getElementById(
            "cartCount"
        );


    if (!cartCount) {
        return;
    }


    const cart =
        getCheckoutCart();


    const count =
        cart.reduce(
            function(total, item) {

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
   SAVE CUSTOMER
========================================= */

function saveCustomerDetails() {

    const customer = {

        fullName:
            document.getElementById(
                "fullName"
            ).value.trim(),

        phone:
            document.getElementById(
                "phone"
            ).value.trim(),

        email:
            document.getElementById(
                "email"
            ).value.trim(),

        address:
            document.getElementById(
                "address"
            ).value.trim(),

        city:
            document.getElementById(
                "city"
            ).value.trim(),

        state:
            document.getElementById(
                "state"
            ).value.trim(),

        pincode:
            document.getElementById(
                "pincode"
            ).value.trim(),

        landmark:
            document.getElementById(
                "landmark"
            ).value.trim()

    };


    localStorage.setItem(
        CUSTOMER_KEY,
        JSON.stringify(customer)
    );


    return customer;
}


/* =========================================
   CHECK STOCK
========================================= */

function checkCheckoutStock(cart) {

    const products =
        getCheckoutAdminProducts();


    /*
       If there is no admin product list,
       don't block the customer's checkout.
    */

    if (
        !Array.isArray(products) ||
        products.length === 0
    ) {
        return true;
    }


    for (const item of cart) {

        const product =
            products.find(
                function(product) {

                    return Number(product.id) ===
                        Number(item.id);

                }
            );


        /*
           Product isn't in admin storage.
           Keep the existing cart item usable.
        */

        if (!product) {
            continue;
        }


        const stock =
            Number(product.stock);


        if (
            Number.isFinite(stock) &&
            stock <= 0
        ) {

            alert(
                `${product.name} is currently out of stock.`
            );

            return false;
        }


        if (
            Number.isFinite(stock) &&
            Number(item.quantity) > stock
        ) {

            alert(
                `Only ${stock} ${product.name} available in stock.`
            );

            return false;
        }

    }


    return true;
}


/* =========================================
   SUBMIT CHECKOUT
========================================= */

function setupCheckoutForm() {

    const form =
        document.getElementById(
            "checkoutForm"
        );


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        function(event) {

            /*
               VERY IMPORTANT:
               Stop normal form submission.
            */

            event.preventDefault();
            event.stopPropagation();


            const cart =
                getCheckoutCart();


            /* =============================
               CHECK EMPTY CART
            ============================= */

            if (cart.length === 0) {

                alert(
                    "Your cart is empty. Please add a product first."
                );

                window.location.href =
                    "products.html";

                return;
            }


            /* =============================
               CHECK STOCK
            ============================= */

            if (
                !checkCheckoutStock(cart)
            ) {
                return;
            }


            /* =============================
               READ CUSTOMER
            ============================= */

            const fullName =
                document.getElementById(
                    "fullName"
                ).value.trim();


            const phone =
                document.getElementById(
                    "phone"
                ).value.trim();


            const pincode =
                document.getElementById(
                    "pincode"
                ).value.trim();


            /* =============================
               NAME
            ============================= */

            if (!fullName) {

                alert(
                    "Please enter your full name."
                );

                return;
            }


            /* =============================
               PHONE
            ============================= */

            if (
                !/^[0-9]{10}$/.test(phone)
            ) {

                alert(
                    "Please enter a valid 10-digit phone number."
                );

                return;
            }


            /* =============================
               PINCODE
            ============================= */

            if (
                !/^[0-9]{6}$/.test(pincode)
            ) {

                alert(
                    "Please enter a valid 6-digit pincode."
                );

                return;
            }


            /* =============================
               SAVE CUSTOMER
            ============================= */

            const customer =
                saveCustomerDetails();


            /* =============================
               TOTAL
            ============================= */

            const subtotal =
                cart.reduce(
                    function(total, item) {

                        return total +
                            (
                                Number(
                                    item.price || 0
                                ) *
                                Number(
                                    item.quantity || 0
                                )
                            );

                    },
                    0
                );


            if (subtotal <= 0) {

                alert(
                    "Your order total must be greater than ₹0."
                );

                return;
            }


            /* =============================
               CREATE PENDING ORDER
            ============================= */

            const pendingOrder = {

                customer:
                    customer,

                items:
                    cart,

                subtotal:
                    subtotal,

                delivery:
                    0,

                total:
                    subtotal,

                paymentStatus:
                    "Payment Pending",

                paymentMethod:
                    "UPI",

                createdAt:
                    new Date().toISOString()

            };


            localStorage.setItem(
                PENDING_ORDER_KEY,
                JSON.stringify(
                    pendingOrder
                )
            );


            /* =============================
               GO TO PAYMENT
            ============================= */

            window.location.assign(
                "payment.html"
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

        displayCheckoutOrder();

        updateCheckoutCartCount();

        setupCheckoutForm();

    }
);