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

    function readArray(key) {
        try {
            const data = JSON.parse(localStorage.getItem(key) || "[]");
            return Array.isArray(data) ? data : [];
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

    function valueFrom(object, keys) {
        if (!object || typeof object !== "object") return "";

        for (const key of keys) {
            const value = object[key];
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

    function customerDetails(order) {
        const customer =
            order.customer ||
            order.customerDetails ||
            order.customerInfo ||
            {};

        return {
            name: valueFrom(customer, ["name", "fullName", "customerName"]),
            phone: valueFrom(customer, ["phone", "customerPhone"]),
            email: valueFrom(customer, ["email", "customerEmail"]),
            address: valueFrom(customer, ["address", "customerAddress"]),
            city: valueFrom(customer, ["city", "customerCity"]),
            state: valueFrom(customer, ["state", "customerState"]),
            pincode: valueFrom(customer, ["pincode", "customerPincode", "pinCode"]),
            landmark: valueFrom(customer, ["landmark", "customerLandmark"])
        };
    }

    function orderId(order) {
        return String(order.orderId || order.id || "");
    }

    function statusOf(order) {
        return String(order.orderStatus || order.status || "Pending");
    }

    function isPending(status) {
        const value = String(status).toLowerCase();
        return value === "new" || value === "pending" || value === "payment pending";
    }

    function setDisplay(element, value) {
        if (element) {
            element.style.setProperty("display", value, "important");
        }
    }

    function setActiveTab(activeTab) {
        [
            document.getElementById("productsTab"),
            document.getElementById("categoriesTab"),
            document.getElementById("ordersTab")
        ].forEach(function (tab) {
            if (tab) tab.classList.remove("active");
        });

        if (activeTab) activeTab.classList.add("active");
    }

    function showOrders() {
        setDisplay(document.getElementById("productsSection"), "none");
        setDisplay(document.getElementById("categoriesSection"), "none");
        setDisplay(document.getElementById("ordersSection"), "block");
        setActiveTab(document.getElementById("ordersTab"));
        renderOrders();
    }

    function showProducts() {
        setDisplay(document.getElementById("productsSection"), "grid");
        setDisplay(document.getElementById("categoriesSection"), "none");
        setDisplay(document.getElementById("ordersSection"), "none");
        setActiveTab(document.getElementById("productsTab"));
    }

    function showCategories() {
        setDisplay(document.getElementById("productsSection"), "none");
        setDisplay(document.getElementById("categoriesSection"), "block");
        setDisplay(document.getElementById("ordersSection"), "none");
        setActiveTab(document.getElementById("categoriesTab"));
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
            const customer = customerDetails(order);
            const items = Array.isArray(order.items) ? order.items : [];
            const status = statusOf(order);
            const id = orderId(order);
            const date = order.createdAt
                ? new Date(order.createdAt).toLocaleString("en-IN")
                : "Not available";

            const itemsHTML = items.length
                ? items.map(function (item) {
                    const quantity = Math.max(1, Number(item.quantity) || 1);
                    const price = Number(item.price) || 0;

                    return `
                        <div style="display:flex;justify-content:space-between;gap:20px;padding:10px 0;border-bottom:1px solid #eee;">
                            <span>${escapeHTML(item.name || "Product")} × ${quantity}</span>
                            <strong>${money(price * quantity)}</strong>
                        </div>
                    `;
                }).join("")
                : "<p>No product information available.</p>";

            const actions = isPending(status)
                ? `
                    <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:20px;">
                        <button type="button" class="admin-save-btn" data-order-action="accept" data-order-id="${escapeHTML(id)}">
                            ✓ Accept Order
                        </button>
                        <button type="button" class="admin-cancel-btn" data-order-action="reject" data-order-id="${escapeHTML(id)}">
                            ✕ Decline Order
                        </button>
                    </div>
                    <p style="margin-top:12px;font-size:13px;opacity:.75;">
                        Verify the UPI payment manually before accepting.
                    </p>
                `
                : "";

            const rejection =
                String(status).toLowerCase() === "rejected" && order.rejectionReason
                    ? `<p style="margin-top:12px;"><strong>Rejection reason:</strong> ${escapeHTML(order.rejectionReason)}</p>`
                    : "";

            return `
                <article class="admin-form-card admin-order-card" style="margin-bottom:20px;">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:20px;flex-wrap:wrap;margin-bottom:20px;">
                        <div>
                            <p><strong>Order ID:</strong> ${escapeHTML(id || "Not available")}</p>
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

                    ${actions}
                    ${rejection}
                </article>
            `;
        }).join("");
    }

    function findOrder(id) {
        const orders = readArray(ORDERS_KEY);
        const index = orders.findIndex(function (order) {
            return orderId(order) === String(id);
        });
        return { orders: orders, index: index };
    }

    function acceptOrder(id) {
        const result = findOrder(id);

        if (result.index < 0) {
            alert("Order could not be found.");
            return;
        }

        const order = result.orders[result.index];

        if (!isPending(statusOf(order))) {
            alert("This order has already been processed.");
            renderOrders();
            return;
        }

        if (!confirm(
            "Please verify the UPI payment manually.\n\nClick OK to accept this order."
        )) return;

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
                alert(`Cannot accept the order. Only ${stock} ${product.name} available, but ${quantity} ordered.`);
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

        saveArray(ORDERS_KEY, result.orders);
        saveArray(PRODUCTS_KEY, products);

        renderOrders();

        if (typeof window.displayProducts === "function") {
            window.displayProducts();
        }

        alert("Order accepted successfully.");
    }

    function rejectOrder(id) {
        const result = findOrder(id);

        if (result.index < 0) {
            alert("Order could not be found.");
            return;
        }

        const order = result.orders[result.index];

        if (!isPending(statusOf(order))) {
            alert("This order has already been processed.");
            renderOrders();
            return;
        }

        const reason = prompt(
            "Reason for declining the order (optional):",
            "Payment not verified / Product unavailable"
        );

        if (reason === null) return;

        order.orderStatus = "Rejected";
        order.status = "Rejected";
        order.rejectedAt = new Date().toISOString();
        order.rejectionReason = reason.trim();

        saveArray(ORDERS_KEY, result.orders);
        renderOrders();

        alert("Order declined successfully.");
    }

    function start() {
        const productsTab = document.getElementById("productsTab");
        const categoriesTab = document.getElementById("categoriesTab");
        const ordersTab = document.getElementById("ordersTab");

        if (productsTab) productsTab.onclick = showProducts;
        if (categoriesTab) categoriesTab.onclick = showCategories;
        if (ordersTab) ordersTab.onclick = showOrders;

        const container = document.getElementById("adminOrders");

        if (container && container.dataset.ordersReady !== "true") {
            container.dataset.ordersReady = "true";

            container.addEventListener("click", function (event) {
                const button = event.target.closest("[data-order-action]");
                if (!button) return;

                const id = button.getAttribute("data-order-id") || "";
                const action = button.getAttribute("data-order-action");

                if (action === "accept") acceptOrder(id);
                if (action === "reject") rejectOrder(id);
            });
        }

        renderOrders();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start);
    } else {
        start();
    }

    window.addEventListener("storage", function (event) {
        if (event.key === ORDERS_KEY || event.key === PRODUCTS_KEY) {
            renderOrders();
        }
    });

    window.threadedTrinketsRefreshOrders = renderOrders;
})();
