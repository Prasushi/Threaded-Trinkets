/* =========================================================
   THREADED TRINKETS - ADMIN ORDERS FIX
   Only fixes the existing Orders tab and order actions.
   Products and Categories remain controlled by admin.js.
========================================================= */

(function () {
    "use strict";

    const ORDERS_KEY = "threadedTrinketsOrders";
    const PRODUCTS_KEY = "threadedTrinketsProducts";

    function readArray(key) {
        try {
            const value = JSON.parse(localStorage.getItem(key) || "[]");
            return Array.isArray(value) ? value : [];
        } catch (error) {
            console.error("Unable to read " + key, error);
            return [];
        }
    }

    function saveArray(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
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
        return "₹" + Number(value || 0).toLocaleString("en-IN");
    }

    function firstValue(source, keys) {
        if (!source || typeof source !== "object") return "";

        for (const key of keys) {
            const value = source[key];

            if (
                value !== undefined &&
                value !== null &&
                String(value).trim() !== ""
            ) {
                return value;
            }
        }

        return "";
    }

    function getCustomer(order) {
        const customer =
            order.customer ||
            order.customerDetails ||
            order.customerInfo ||
            {};

        return {
            name: firstValue(customer, ["name", "fullName", "customerName"]),
            phone: firstValue(customer, ["phone", "customerPhone"]),
            email: firstValue(customer, ["email", "customerEmail"]),
            address: firstValue(customer, ["address", "customerAddress"]),
            city: firstValue(customer, ["city", "customerCity"]),
            state: firstValue(customer, ["state", "customerState"]),
            pincode: firstValue(customer, ["pincode", "customerPincode", "pinCode"]),
            landmark: firstValue(customer, ["landmark", "customerLandmark"])
        };
    }

    function getOrderId(order) {
        return String(order.orderId || order.id || "");
    }

    function getStatus(order) {
        return String(order.orderStatus || order.status || "Pending");
    }

    function isPending(status) {
        const value = String(status).toLowerCase();

        return (
            value === "pending" ||
            value === "new" ||
            value === "payment pending"
        );
    }

    function setSection(section, display) {
        if (section) section.style.display = display;
    }

    function showOrdersTab() {
        const productsTab = document.getElementById("productsTab");
        const categoriesTab = document.getElementById("categoriesTab");
        const ordersTab = document.getElementById("ordersTab");

        const productsSection = document.getElementById("productsSection");
        const categoriesSection = document.getElementById("categoriesSection");
        const ordersSection = document.getElementById("ordersSection");

        [productsTab, categoriesTab, ordersTab].forEach(function (tab) {
            if (tab) tab.classList.remove("active");
        });

        if (ordersTab) ordersTab.classList.add("active");

        setSection(productsSection, "none");
        setSection(categoriesSection, "none");
        setSection(ordersSection, "block");

        renderOrders();
    }

    function showProductsTab() {
        const productsTab = document.getElementById("productsTab");
        const categoriesTab = document.getElementById("categoriesTab");
        const ordersTab = document.getElementById("ordersTab");

        const productsSection = document.getElementById("productsSection");
        const categoriesSection = document.getElementById("categoriesSection");
        const ordersSection = document.getElementById("ordersSection");

        [productsTab, categoriesTab, ordersTab].forEach(function (tab) {
            if (tab) tab.classList.remove("active");
        });

        if (productsTab) productsTab.classList.add("active");

        setSection(productsSection, "grid");
        setSection(categoriesSection, "none");
        setSection(ordersSection, "none");
    }

    function showCategoriesTab() {
        const productsTab = document.getElementById("productsTab");
        const categoriesTab = document.getElementById("categoriesTab");
        const ordersTab = document.getElementById("ordersTab");

        const productsSection = document.getElementById("productsSection");
        const categoriesSection = document.getElementById("categoriesSection");
        const ordersSection = document.getElementById("ordersSection");

        [productsTab, categoriesTab, ordersTab].forEach(function (tab) {
            if (tab) tab.classList.remove("active");
        });

        if (categoriesTab) categoriesTab.classList.add("active");

        setSection(productsSection, "none");
        setSection(categoriesSection, "block");
        setSection(ordersSection, "none");
    }

    function renderOrders() {
        const container = document.getElementById("adminOrders");
        const count = document.getElementById("orderCount");
        const empty = document.getElementById("noOrders");

        if (!container) return;

        const orders = readArray(ORDERS_KEY);

        if (count) count.textContent = String(orders.length);

        if (orders.length === 0) {
            container.innerHTML = "";

            if (empty) empty.style.display = "block";

            return;
        }

        if (empty) empty.style.display = "none";

        container.innerHTML = orders.map(function (order) {
            const customer = getCustomer(order);
            const items = Array.isArray(order.items) ? order.items : [];
            const status = getStatus(order);
            const orderId = getOrderId(order);

            const date = order.createdAt
                ? new Date(order.createdAt).toLocaleString("en-IN")
                : "Not available";

            const itemsHTML = items.length
                ? items.map(function (item) {
                    const quantity = Math.max(1, Number(item.quantity) || 1);
                    const price = Number(item.price) || 0;

                    return `
                        <div class="admin-order-item" style="display:flex;justify-content:space-between;gap:20px;padding:10px 0;border-bottom:1px solid #eee;">
                            <span>${escapeHTML(item.name || "Product")} × ${quantity}</span>
                            <strong>${money(price * quantity)}</strong>
                        </div>
                    `;
                }).join("")
                : "<p>No product information available.</p>";

            return `
                <article class="admin-form-card admin-order-card" style="margin-bottom:20px;">

                    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:20px;flex-wrap:wrap;margin-bottom:20px;">
                        <div>
                            <p><strong>Order ID:</strong> ${escapeHTML(orderId || "Not available")}</p>
                            <p><strong>Order Date:</strong> ${escapeHTML(date)}</p>
                        </div>

                        <div style="padding:8px 14px;border-radius:20px;background:#f8e8ef;font-weight:700;">
                            ${escapeHTML(status)}
                        </div>
                    </div>

                    <div style="margin-bottom:20px;">
                        <h3>👤 Customer Details</h3>
                        <p><strong>Name:</strong> ${escapeHTML(customer.name || "Not provided")}</p>
                        <p><strong>Phone:</strong> ${escapeHTML(customer.phone || "Not provided")}</p>
                        <p><strong>Email:</strong> ${escapeHTML(customer.email || "Not provided")}</p>
                        <p><strong>Address:</strong> ${escapeHTML(customer.address || "Not provided")}</p>
                        <p><strong>City:</strong> ${escapeHTML(customer.city || "Not provided")}</p>
                        <p><strong>State:</strong> ${escapeHTML(customer.state || "Not provided")}</p>
                        <p><strong>Pincode:</strong> ${escapeHTML(customer.pincode || "Not provided")}</p>
                        <p><strong>Landmark:</strong> ${escapeHTML(customer.landmark || "Not provided")}</p>
                    </div>

                    <div style="margin-bottom:20px;">
                        <h3>🛍️ Ordered Products</h3>
                        ${itemsHTML}
                    </div>

                    <div style="margin-bottom:20px;">
                        <h3>💳 Payment Information</h3>
                        <p><strong>Method:</strong> ${escapeHTML(order.paymentMethod || "UPI")}</p>
                        <p><strong>UPI ID:</strong> ${escapeHTML(order.upiId || "7842391877@ibl")}</p>
                        <p><strong>Payment Status:</strong> ${escapeHTML(order.paymentStatus || "Payment Pending")}</p>
                        <p><strong>Verification:</strong> ${escapeHTML(order.paymentVerification || "Verify the UPI payment manually before accepting the order.")}</p>
                    </div>

                    <div style="padding-top:15px;border-top:1px solid #ddd;">
                        <h3>Total: ${money(order.total)}</h3>
                    </div>

                    ${isPending(status) ? `
                        <div class="admin-order-actions" style="display:flex;gap:12px;flex-wrap:wrap;margin-top:20px;">
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
                                ✕ Reject / Decline
                            </button>
                        </div>

                        <p style="margin-top:12px;font-size:14px;opacity:.8;">
                            Verify the UPI payment and product stock manually before accepting.
                        </p>
                    ` : ""}

                    ${String(status).toLowerCase() === "rejected" && order.rejectionReason ? `
                        <p style="margin-top:12px;">
                            <strong>Rejection reason:</strong>
                            ${escapeHTML(order.rejectionReason)}
                        </p>
                    ` : ""}

                </article>
            `;
        }).join("");
    }

    function findOrder(orderId) {
        const orders = readArray(ORDERS_KEY);

        const index = orders.findIndex(function (order) {
            return getOrderId(order) === String(orderId);
        });

        return {
            orders: orders,
            index: index
        };
    }

    function acceptOrder(orderId) {
        const result = findOrder(orderId);

        if (result.index < 0) {
            alert("Order could not be found.");
            return;
        }

        const order = result.orders[result.index];

        if (!isPending(getStatus(order))) {
            alert("This order has already been processed.");
            renderOrders();
            return;
        }

        const verified = confirm(
            "Before accepting this order, confirm that you have manually verified the UPI payment and the required products are available.\n\nClick OK to accept the order."
        );

        if (!verified) return;

        const products = readArray(PRODUCTS_KEY);
        const items = Array.isArray(order.items) ? order.items : [];

        for (const item of items) {
            const product = products.find(function (productItem) {
                return String(productItem.id) === String(item.id);
            });

            if (!product) continue;

            const stock = Number(product.stock);
            const quantity = Math.max(1, Number(item.quantity) || 1);

            if (Number.isFinite(stock) && stock < quantity) {
                alert(
                    `Cannot accept the order. Only ${stock} ${product.name} available, but ${quantity} ordered.`
                );
                return;
            }
        }

        items.forEach(function (item) {
            const product = products.find(function (productItem) {
                return String(productItem.id) === String(item.id);
            });

            if (!product) return;

            const stock = Number(product.stock);
            const quantity = Math.max(1, Number(item.quantity) || 1);

            if (Number.isFinite(stock)) {
                product.stock = Math.max(0, stock - quantity);
            }
        });

        order.orderStatus = "Accepted";
        order.status = "Accepted";
        order.acceptedAt = new Date().toISOString();

        if (!order.paymentStatus) {
            order.paymentStatus = "Customer Confirmed Payment";
        }

        saveArray(ORDERS_KEY, result.orders);
        saveArray(PRODUCTS_KEY, products);

        renderOrders();

        if (typeof window.displayProducts === "function") {
            window.displayProducts();
        }

        alert("Order accepted successfully.");
    }

    function rejectOrder(orderId) {
        const result = findOrder(orderId);

        if (result.index < 0) {
            alert("Order could not be found.");
            return;
        }

        const order = result.orders[result.index];

        if (!isPending(getStatus(order))) {
            alert("This order has already been processed.");
            renderOrders();
            return;
        }

        const reason = prompt(
            "Reason for rejecting/declining this order (optional):",
            "Payment not verified / Product unavailable"
        );

        if (reason === null) return;

        order.orderStatus = "Rejected";
        order.status = "Rejected";
        order.rejectedAt = new Date().toISOString();
        order.rejectionReason = reason.trim();

        saveArray(ORDERS_KEY, result.orders);
        renderOrders();

        alert("Order rejected/declined.");
    }

    function setupTabs() {
        const productsTab = document.getElementById("productsTab");
        const categoriesTab = document.getElementById("categoriesTab");
        const ordersTab = document.getElementById("ordersTab");

        if (ordersTab) {
            ordersTab.addEventListener("click", showOrdersTab);
        }

        if (productsTab) {
            productsTab.addEventListener("click", showProductsTab);
        }

        if (categoriesTab) {
            categoriesTab.addEventListener("click", showCategoriesTab);
        }
    }

    function setupOrderActions() {
        const container = document.getElementById("adminOrders");

        if (!container || container.dataset.ordersActionsReady === "true") {
            return;
        }

        container.dataset.ordersActionsReady = "true";

        container.addEventListener("click", function (event) {
            const button = event.target.closest("[data-order-action]");

            if (!button) return;

            const orderId = button.getAttribute("data-order-id") || "";
            const action = button.getAttribute("data-order-action");

            if (action === "accept") {
                acceptOrder(orderId);
            } else if (action === "reject") {
                rejectOrder(orderId);
            }
        });
    }

    function refreshOrders() {
        const ordersSection = document.getElementById("ordersSection");

        if (ordersSection && ordersSection.style.display !== "none") {
            renderOrders();
        }
    }

    function start() {
        setupTabs();
        setupOrderActions();
        renderOrders();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start);
    } else {
        start();
    }

    window.addEventListener("storage", function (event) {
        if (event.key === ORDERS_KEY || event.key === PRODUCTS_KEY) {
            refreshOrders();
        }
    });

    window.threadedTrinketsRefreshOrders = renderOrders;
})();
