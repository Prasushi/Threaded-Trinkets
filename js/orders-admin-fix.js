/* =========================================================
   THREADED TRINKETS
   ADMIN ORDERS
   Orders tab + customer details + accept/decline
   Does NOT modify Products or Categories.
========================================================= */

(function () {

    "use strict";

    const ORDERS_KEY = "threadedTrinketsOrders";
    const PRODUCTS_KEY = "threadedTrinketsProducts";


    /* =====================================================
       HELPERS
    ===================================================== */

    function readArray(key) {

        try {

            const saved =
                localStorage.getItem(key);

            if (!saved) {
                return [];
            }

            const data =
                JSON.parse(saved);

            return Array.isArray(data)
                ? data
                : [];

        } catch (error) {

            console.error(
                "Unable to read " + key,
                error
            );

            return [];

        }

    }


    function saveArray(key, data) {

        localStorage.setItem(
            key,
            JSON.stringify(data)
        );

    }


    function escapeHTML(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    function money(value) {

        return "₹" +
            Number(value || 0)
                .toLocaleString("en-IN");

    }


    function getValue(object, keys) {

        if (
            !object ||
            typeof object !== "object"
        ) {
            return "";
        }

        for (const key of keys) {

            if (
                object[key] !== undefined &&
                object[key] !== null &&
                String(object[key]).trim() !== ""
            ) {

                return object[key];

            }

        }

        return "";

    }


    /* =====================================================
       CUSTOMER DETAILS
    ===================================================== */

    function getCustomer(order) {

        const customer =
            order.customer ||
            order.customerDetails ||
            order.customerInfo ||
            {};

        return {

            name:
                getValue(
                    customer,
                    [
                        "name",
                        "fullName",
                        "customerName"
                    ]
                ),

            phone:
                getValue(
                    customer,
                    [
                        "phone",
                        "customerPhone"
                    ]
                ),

            email:
                getValue(
                    customer,
                    [
                        "email",
                        "customerEmail"
                    ]
                ),

            address:
                getValue(
                    customer,
                    [
                        "address",
                        "customerAddress"
                    ]
                ),

            city:
                getValue(
                    customer,
                    [
                        "city",
                        "customerCity"
                    ]
                ),

            state:
                getValue(
                    customer,
                    [
                        "state",
                        "customerState"
                    ]
                ),

            pincode:
                getValue(
                    customer,
                    [
                        "pincode",
                        "customerPincode",
                        "pinCode"
                    ]
                ),

            landmark:
                getValue(
                    customer,
                    [
                        "landmark",
                        "customerLandmark"
                    ]
                )

        };

    }


    function getOrderId(order) {

        return String(
            order.orderId ||
            order.id ||
            ""
        );

    }


    function getStatus(order) {

        return String(
            order.orderStatus ||
            order.status ||
            "New"
        );

    }


    function isPending(status) {

        const value =
            String(status).toLowerCase();

        return (
            value === "new" ||
            value === "pending" ||
            value === "payment pending"
        );

    }


    /* =====================================================
       SHOW / HIDE SECTIONS
    ===================================================== */

    function showSection(element, display) {

        if (!element) {
            return;
        }

        element.style.setProperty(
            "display",
            display,
            "important"
        );

    }


    function setActiveTab(tab) {

        const tabs = [

            document.getElementById(
                "productsTab"
            ),

            document.getElementById(
                "categoriesTab"
            ),

            document.getElementById(
                "ordersTab"
            )

        ];


        tabs.forEach(function (item) {

            if (item) {

                item.classList.remove(
                    "active"
                );

            }

        });


        if (tab) {

            tab.classList.add(
                "active"
            );

        }

    }


    /* =====================================================
       PRODUCTS TAB
    ===================================================== */

    function openProducts() {

        showSection(
            document.getElementById(
                "productsSection"
            ),
            "grid"
        );


        showSection(
            document.getElementById(
                "categoriesSection"
            ),
            "none"
        );


        showSection(
            document.getElementById(
                "ordersSection"
            ),
            "none"
        );


        setActiveTab(
            document.getElementById(
                "productsTab"
            )
        );

    }


    /* =====================================================
       CATEGORIES TAB
    ===================================================== */

    function openCategories() {

        showSection(
            document.getElementById(
                "productsSection"
            ),
            "none"
        );


        showSection(
            document.getElementById(
                "categoriesSection"
            ),
            "block"
        );


        showSection(
            document.getElementById(
                "ordersSection"
            ),
            "none"
        );


        setActiveTab(
            document.getElementById(
                "categoriesTab"
            )
        );

    }


    /* =====================================================
       ORDERS TAB
    ===================================================== */

    function openOrders() {

        showSection(
            document.getElementById(
                "productsSection"
            ),
            "none"
        );


        showSection(
            document.getElementById(
                "categoriesSection"
            ),
            "none"
        );


        showSection(
            document.getElementById(
                "ordersSection"
            ),
            "block"
        );


        setActiveTab(
            document.getElementById(
                "ordersTab"
            )
        );


        renderOrders();

    }


    /* =====================================================
       DISPLAY ORDERS
    ===================================================== */

    function renderOrders() {

        const container =
            document.getElementById(
                "adminOrders"
            );

        const count =
            document.getElementById(
                "orderCount"
            );

        const empty =
            document.getElementById(
                "noOrders"
            );


        if (!container) {
            return;
        }


        const orders =
            readArray(
                ORDERS_KEY
            );


        if (count) {

            count.textContent =
                String(
                    orders.length
                );

        }


        if (orders.length === 0) {

            container.innerHTML = "";

            if (empty) {

                showSection(
                    empty,
                    "block"
                );

            }

            return;

        }


        if (empty) {

            showSection(
                empty,
                "none"
            );

        }


        container.innerHTML =
            orders.map(
                function (order) {

                    const customer =
                        getCustomer(order);

                    const items =
                        Array.isArray(
                            order.items
                        )
                            ? order.items
                            : [];

                    const status =
                        getStatus(order);

                    const orderId =
                        getOrderId(order);

                    const createdAt =
                        order.createdAt
                            ? new Date(
                                order.createdAt
                              ).toLocaleString(
                                "en-IN"
                              )
                            : "Not available";


                    let itemsHTML = "";


                    if (items.length === 0) {

                        itemsHTML =
                            "<p>No product information available.</p>";

                    } else {

                        itemsHTML =
                            items.map(
                                function (item) {

                                    const quantity =
                                        Math.max(
                                            1,
                                            Number(
                                                item.quantity
                                            ) || 1
                                        );

                                    const price =
                                        Number(
                                            item.price
                                        ) || 0;


                                    return `

                                        <div
                                            style="
                                                display:flex;
                                                justify-content:space-between;
                                                gap:20px;
                                                padding:12px 0;
                                                border-bottom:1px solid #eee;
                                            "
                                        >

                                            <span>
                                                ${escapeHTML(
                                                    item.name ||
                                                    "Product"
                                                )}

                                                × ${quantity}
                                            </span>

                                            <strong>
                                                ${money(
                                                    price *
                                                    quantity
                                                )}
                                            </strong>

                                        </div>

                                    `;

                                }
                            ).join("");

                    }


                    let actionHTML = "";


                    if (
                        isPending(status)
                    ) {

                        actionHTML = `

                            <div
                                style="
                                    display:flex;
                                    gap:12px;
                                    flex-wrap:wrap;
                                    margin-top:20px;
                                "
                            >

                                <button
                                    type="button"
                                    class="admin-save-btn"
                                    data-order-action="accept"
                                    data-order-id="${escapeHTML(orderId)}"
                                >
                                    ✓ Accept Order
                                </button>


                                <button
                                    type="button"
                                    class="admin-cancel-btn"
                                    data-order-action="reject"
                                    data-order-id="${escapeHTML(orderId)}"
                                >
                                    ✕ Decline Order
                                </button>

                            </div>

                            <p
                                style="
                                    margin-top:12px;
                                    font-size:13px;
                                    opacity:.75;
                                "
                            >
                                Verify the UPI payment manually before accepting.
                            </p>

                        `;

                    }


                    let rejectionHTML = "";


                    if (
                        String(status).toLowerCase() ===
                        "rejected" &&
                        order.rejectionReason
                    ) {

                        rejectionHTML = `

                            <p>

                                <strong>
                                    Rejection Reason:
                                </strong>

                                ${escapeHTML(
                                    order.rejectionReason
                                )}

                            </p>

                        `;

                    }


                    return `

                        <article
                            class="admin-form-card admin-order-card"
                            style="margin-bottom:20px;"
                        >


                            <div
                                style="
                                    display:flex;
                                    justify-content:space-between;
                                    align-items:flex-start;
                                    gap:20px;
                                    flex-wrap:wrap;
                                    margin-bottom:20px;
                                "
                            >

                                <div>

                                    <p>
                                        <strong>
                                            Order ID:
                                        </strong>

                                        ${escapeHTML(
                                            orderId ||
                                            "Not available"
                                        )}

                                    </p>


                                    <p>

                                        <strong>
                                            Order Date:
                                        </strong>

                                        ${escapeHTML(
                                            createdAt
                                        )}

                                    </p>

                                </div>


                                <div
                                    style="
                                        padding:8px 14px;
                                        border-radius:20px;
                                        background:#f8e8ef;
                                        font-weight:700;
                                    "
                                >

                                    ${escapeHTML(
                                        status
                                    )}

                                </div>

                            </div>


                            <!-- CUSTOMER -->

                            <div
                                style="margin-bottom:25px;"
                            >

                                <h3>
                                    👤 Customer Details
                                </h3>


                                <p>
                                    <strong>Name:</strong>
                                    ${escapeHTML(
                                        customer.name ||
                                        "Not provided"
                                    )}
                                </p>


                                <p>
                                    <strong>Phone:</strong>
                                    ${escapeHTML(
                                        customer.phone ||
                                        "Not provided"
                                    )}
                                </p>


                                <p>
                                    <strong>Email:</strong>
                                    ${escapeHTML(
                                        customer.email ||
                                        "Not provided"
                                    )}
                                </p>


                                <p>
                                    <strong>Address:</strong>
                                    ${escapeHTML(
                                        customer.address ||
                                        "Not provided"
                                    )}
                                </p>


                                <p>
                                    <strong>City:</strong>
                                    ${escapeHTML(
                                        customer.city ||
                                        "Not provided"
                                    )}
                                </p>


                                <p>
                                    <strong>State:</strong>
                                    ${escapeHTML(
                                        customer.state ||
                                        "Not provided"
                                    )}
                                </p>


                                <p>
                                    <strong>Pincode:</strong>
                                    ${escapeHTML(
                                        customer.pincode ||
                                        "Not provided"
                                    )}
                                </p>


                                <p>
                                    <strong>Landmark:</strong>
                                    ${escapeHTML(
                                        customer.landmark ||
                                        "Not provided"
                                    )}
                                </p>

                            </div>


                            <!-- PRODUCTS -->

                            <div
                                style="margin-bottom:25px;"
                            >

                                <h3>
                                    🛍️ Ordered Products
                                </h3>

                                ${itemsHTML}

                            </div>


                            <!-- PAYMENT -->

                            <div
                                style="margin-bottom:25px;"
                            >

                                <h3>
                                    💳 Payment Information
                                </h3>


                                <p>

                                    <strong>
                                        Method:
                                    </strong>

                                    ${escapeHTML(
                                        order.paymentMethod ||
                                        "UPI"
                                    )}

                                </p>


                                <p>

                                    <strong>
                                        UPI ID:
                                    </strong>

                                    ${escapeHTML(
                                        order.upiId ||
                                        "7842391877@ibl"
                                    )}

                                </p>


                                <p>

                                    <strong>
                                        Payment Status:
                                    </strong>

                                    ${escapeHTML(
                                        order.paymentStatus ||
                                        "Payment Pending"
                                    )}

                                </p>


                                <p>

                                    <strong>
                                        Verification:
                                    </strong>

                                    ${escapeHTML(
                                        order.paymentVerification ||
                                        "Manual verification required."
                                    )}

                                </p>

                            </div>


                            <!-- TOTAL -->

                            <div
                                style="
                                    padding-top:15px;
                                    border-top:1px solid #ddd;
                                "
                            >

                                <h3>

                                    Total:
                                    ${money(
                                        order.total
                                    )}

                                </h3>

                            </div>


                            ${actionHTML}

                            ${rejectionHTML}


                        </article>

                    `;

                }
            ).join("");

    }


    /* =====================================================
       FIND ORDER
    ===================================================== */

    function findOrder(id) {

        const orders =
            readArray(
                ORDERS_KEY
            );


        const index =
            orders.findIndex(
                function (order) {

                    return (
                        getOrderId(order) ===
                        String(id)
                    );

                }
            );


        return {
            orders: orders,
            index: index
        };

    }


    /* =====================================================
       ACCEPT
    ===================================================== */

    function acceptOrder(id) {

        const result =
            findOrder(id);


        if (result.index < 0) {

            alert(
                "Order could not be found."
            );

            return;

        }


        const order =
            result.orders[
                result.index
            ];


        if (
            !isPending(
                getStatus(order)
            )
        ) {

            alert(
                "This order has already been processed."
            );

            renderOrders();

            return;

        }


        const confirmed =
            confirm(
                "Please verify the UPI payment manually.\n\nClick OK to accept this order."
            );


        if (!confirmed) {
            return;
        }


        const products =
            readArray(
                PRODUCTS_KEY
            );


        const items =
            Array.isArray(
                order.items
            )
                ? order.items
                : [];


        /* Check stock first */

        for (
            const item of items
        ) {

            const product =
                products.find(
                    function (productItem) {

                        return (
                            String(
                                productItem.id
                            ) ===
                            String(
                                item.id
                            )
                        );

                    }
                );


            if (!product) {
                continue;
            }


            const stock =
                Number(
                    product.stock
                );


            const quantity =
                Math.max(
                    1,
                    Number(
                        item.quantity
                    ) || 1
                );


            if (
                Number.isFinite(stock) &&
                stock < quantity
            ) {

                alert(
                    `Cannot accept the order. Only ${stock} ${product.name} available, but ${quantity} ordered.`
                );

                return;

            }

        }


        /* Reduce stock */

        items.forEach(
            function (item) {

                const product =
                    products.find(
                        function (productItem) {

                            return (
                                String(
                                    productItem.id
                                ) ===
                                String(
                                    item.id
                                )
                            );

                        }
                    );


                if (!product) {
                    return;
                }


                const stock =
                    Number(
                        product.stock
                    );


                const quantity =
                    Math.max(
                        1,
                        Number(
                            item.quantity
                        ) || 1
                    );


                if (
                    Number.isFinite(stock)
                ) {

                    product.stock =
                        Math.max(
                            0,
                            stock - quantity
                        );

                }

            }
        );


        order.orderStatus =
            "Accepted";

        order.status =
            "Accepted";

        order.acceptedAt =
            new Date().toISOString();


        saveArray(
            ORDERS_KEY,
            result.orders
        );


        saveArray(
            PRODUCTS_KEY,
            products
        );


        renderOrders();


        alert(
            "Order accepted successfully."
        );

    }


    /* =====================================================
       DECLINE
    ===================================================== */

    function rejectOrder(id) {

        const result =
            findOrder(id);


        if (
            result.index < 0
        ) {

            alert(
                "Order could not be found."
            );

            return;

        }


        const order =
            result.orders[
                result.index
            ];


        if (
            !isPending(
                getStatus(order)
            )
        ) {

            alert(
                "This order has already been processed."
            );

            renderOrders();

            return;

        }


        const reason =
            prompt(
                "Reason for declining the order:",
                "Payment not verified / Product unavailable"
            );


        if (
            reason === null
        ) {

            return;

        }


        order.orderStatus =
            "Rejected";

        order.status =
            "Rejected";

        order.rejectedAt =
            new Date().toISOString();

        order.rejectionReason =
            reason.trim();


        saveArray(
            ORDERS_KEY,
            result.orders
        );


        renderOrders();


        alert(
            "Order declined successfully."
        );

    }


    /* =====================================================
       START
    ===================================================== */

    function start() {

        const productsTab =
            document.getElementById(
                "productsTab"
            );

        const categoriesTab =
            document.getElementById(
                "categoriesTab"
            );

        const ordersTab =
            document.getElementById(
                "ordersTab"
            );


        /*
           IMPORTANT:
           Use addEventListener instead of replacing
           existing admin.js handlers.
        */

        if (productsTab) {

            productsTab.addEventListener(
                "click",
                function () {

                    openProducts();

                }
            );

        }


        if (categoriesTab) {

            categoriesTab.addEventListener(
                "click",
                function () {

                    openCategories();

                }
            );

        }


        if (ordersTab) {

            ordersTab.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();
                    event.stopPropagation();

                    openOrders();

                }
            );

        }


        /*
           Make Orders available even if another
           script tries to control the tabs.
        */

        if (ordersTab) {

            ordersTab.onclick =
                function (event) {

                    if (event) {

                        event.preventDefault();

                    }

                    openOrders();

                };

        }


        /*
           Click actions inside orders
        */

        const ordersContainer =
            document.getElementById(
                "adminOrders"
            );


        if (ordersContainer) {

            ordersContainer.addEventListener(
                "click",
                function (event) {

                    const button =
                        event.target.closest(
                            "[data-order-action]"
                        );


                    if (!button) {
                        return;
                    }


                    const id =
                        button.getAttribute(
                            "data-order-id"
                        );


                    const action =
                        button.getAttribute(
                            "data-order-action"
                        );


                    if (
                        action ===
                        "accept"
                    ) {

                        acceptOrder(id);

                    }


                    if (
                        action ===
                        "reject"
                    ) {

                        rejectOrder(id);

                    }

                }
            );

        }


        /*
           Initially keep Products open.
        */

        openProducts();

    }


    /* =====================================================
       START AFTER PAGE LOAD
    ===================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            start
        );

    } else {

        start();

    }


    /* =====================================================
       REFRESH WHEN STORAGE CHANGES
    ===================================================== */

    window.addEventListener(
        "storage",
        function (event) {

            if (
                event.key ===
                ORDERS_KEY
            ) {

                renderOrders();

            }

        }
    );


    window.threadedTrinketsRefreshOrders =
        renderOrders;


})();
