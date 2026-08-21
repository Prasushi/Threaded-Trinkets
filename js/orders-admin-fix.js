/* =========================================================
   THREADED TRINKETS - ADMIN ORDERS FIX
   Only fixes the existing Orders tab.
   Does not replace the existing Products/Categories logic.
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
            console.error("Unable to read", key, error);
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
            .replace(/\"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function money(value) {
        return `₹${Number(value || 0).toLocaleString("en-IN")}`;
    }

    function customerValue(customer, modernKey, oldKey) {
        if (!customer) return "";
        return customer[modernKey] ?? customer[oldKey] ?? "";
    }

    function normalizeStatus(order) {
        return order.orderStatus || order.status || "Pending";
    }

    function setSection(section, display) {
        if (section) section.style.display = display;
    }

    function activateTab(activeTab) {
        const productsTab = document.getElementById("productsTab");
        const categoriesTab = document.getElementById("categoriesTab");
        const ordersTab = document.getElementById("ordersTab");

        const productsSection = document.getElementById("productsSection");
        const categoriesSection = document.getElementById("categoriesSection");
        const ordersSection = document.getElementById("ordersSection");

        [productsTab, categoriesTab, ordersTab].forEach(function (tab) {
            if (tab) tab.classList.remove("active");
        });

        if (activeTab) activeTab.classList.add("active");

        setSection(productsSection, activeTab === productsTab ? "grid" : "none");
        setSection(categoriesSection, activeTab === categoriesTab ? "block" : "none");
        setSection(ordersSection, activeTab === ordersTab ? "block" : "none");
    }

    function renderOrders() {
        const container = document.getElementById("adminOrders");
        const count = document.getElementById("orderCount");
        const empty = document.getElementById("noOrders");

        if (!container) return;

        const orders = readArray(ORDERS_KEY);

        if (count) count.textContent = orders.length;

        if (orders.length === 0) {
            container.innerHTML = "";
            if (empty) empty.style.display = "block";
            return;
        }

        if (empty) empty.style.display = "none";

        container.innerHTML = orders.map(function (order) {
            const customer = order.customer || {};
            const items = Array.isArray(order.items) ? order.items : [];
            const status = normalizeStatus(order);
            const date = order.createdAt
                ? new Date(order.createdAt).toLocaleString("en-IN")
                : "Not available";

            const customerName = customerValue(customer, "name", "fullName");
            const phone = customerValue(customer, "phone", "customerPhone");
            const email = customerValue(customer, "email", "customerEmail");
            const address = customerValue(customer, "address", "customerAddress");
            const city = customerValue(customer, "city", "customerCity");
            const state = customerValue(customer, "state", "customerState");
            const pincode = customerValue(customer, "pincode", "customerPincode");
            const landmark = customerValue(customer, "landmark", "customerLandmark");

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

            const safeId = escapeHTML(order.orderId || order.id || "");
            const encodedId = encodeURIComponent(String(order.orderId || order.id || ""));
            const lowerStatus = String(status).toLowerCase();
            const isPending = lowerStatus === "pending" || lowerStatus === "new" || lowerStatus === "payment pending";

            return `
                <article class="admin-form-card admin-order-card" style="margin-bottom:20px;">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:20px;flex-wrap:wrap;margin-bottom:20px;">
                        <div>
                            <p><strong>Order ID:</strong> ${safeId || "Not available"}</p>
                            <p><strong>Order Date:</strong> ${escapeHTML(date)}</p>
                        </div>
                        <div style="padding:8px 14px;border-radius:20px;background:#f8e8ef;font-weight:700;">
                            ${escapeHTML(status)}
                        </div>
                    </div>

                    <div style="margin-bottom:20px;">
                        <h3>👤 Customer Details</h3>
                        <p><strong>Name:</strong> ${escapeHTML(customerName || "Not provided")}</p>
                        <p><strong>Phone:</strong> ${escapeHTML(phone || "Not provided")}</p>
                        <p><strong>Email:</strong> ${escapeHTML(email || "Not provided")}</p>
                        <p><strong>Address:</strong> ${escapeHTML(address || "Not provided")}</p>
                        <p><strong>City:</strong> ${escapeHTML(city || "Not provided")}</p>
                        <p><strong>State:</strong> ${escapeHTML(state || "Not provided")}</p>
                        <p><strong>Pincode:</strong> ${escapeHTML(pincode || "Not provided")}</p>
                        <p><strong>Landmark:</strong> ${escapeHTML(landmark || "Not provided")}</p>
                    </div>

                    <div style="margin-bottom:20px;">
                        <h3>🛍️ Ordered Products</h3>
                        ${itemsHTML}
                    </div>

                    <div style="margin-bottom:20px;">
                        <h3>💳 Payment Information</h3>
                        <p><strong>Method:</strong> ${escapeHTML(order.paymentMethod || "UPI")}</p>
                        <p><strong>UPI ID:</strong> ${escapeHTML(order.upiId || "Not available")}</p>
                        <p><strong>Payment Status:</strong> ${escapeHTML(order.paymentStatus || "Payment Pending")}</p>
                        <p><strong>Verification:</strong> ${escapeHTML(order.paymentVerification || "Verify payment manually before accepting the order.")}</p>
                    </div>

                    <div style="padding-top:15px;border-top:1px solid #ddd;">
                        <h3>Total: ${money(order.total)}</h3>
                    </div>

                    ${isPending ? `
                        <div class="admin-order-actions" style="display:flex;gap:12px;flex-wrap:wrap;margin-top:20px;">
                            <button type="button" class="admin-save-btn" data-order-action="accept" data-order-id="${encodedId}">
                                ✓ Accept Order
                            </button>
                            <button type="button" class="admin-cancel-btn" data-order-action="reject" data-order-id="${encodedId}">
                                ✕ Reject / Decline
                            </button>
                        </div>
                        <p style="margin-top:12px;font-size:14px;opacity:.8;">
                            Verify the UPI payment and product stock manually before accepting.
                        </p>
                    ` : ""}
                </article>
            `;
        }).join("");
    }

    function findOrder(orderId) {
        const orders = readArray(ORDERS_KEY);
        const index = orders.findIndex(function (order) {
            return String(order.orderId || order.id || "") === String(orderId);
        });
        return { orders, index };
    }

    function acceptOrder(orderId) {
        const result = findOrder(orderId);
        if (result.index < 0) return;

        const order = result.orders[result.index];
        const products = readArray(PRODUCTS_KEY);
        const items = Array.isArray(order.items) ? order.items : [];

        const verified = confirm(
            "Before accepting this order, confirm that you have manually verified the UPI payment and the required products are available.\n\nClick OK to accept the order."
        );

        if (!verified) return;

        /* Check current stock when the product exists in admin inventory. */
        for (const item of items) {
            const product = products.find(function (p) {
                return String(p.id) === String(item.id);
            });

            if (!product) continue;

            const stock = Number(product.stock);
            const quantity = Math.max(1, Number(item.quantity) || 1);

            if (Number.isFinite(stock) && stock < quantity) {
                alert(`Cannot accept the order. Only ${stock} ${product.name} available, but ${quantity} ordered.`);
                return;
            }
        }

        /* Reduce stock only after the order is accepted. */
        items.forEach(function (item) {
            const product = products.find(function (p) {
                return String(p.id) === String(item.id);
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
        order.paymentStatus = order.paymentStatus || "Customer Confirmed Payment";

        saveArray(ORDERS_KEY, result.orders);
        saveArray(PRODUCTS_KEY, products);

        renderOrders();
        if (typeof window.displayProducts === "function") window.displayProducts();

        alert("Order accepted successfully.");
    }

    function rejectOrder(orderId) {
        const result = findOrder(orderId);
        if (result.index < 0) return;

        const reason = prompt(
            "Reason for rejecting/declining this order (optional):",
            "Payment not verified / Product unavailable"
        );

        if (reason === null) return;

        const order = result.orders[result.index];
        order.orderStatus = "Rejected";
        order.status = "Rejected";
        order.rejectedAt = new Date().toISOString();
        order.rejectionReason = reason.trim();

        saveArray(ORDERS_KEY, result.orders);
        renderOrders();

        alert("Order rejected/declined.");
    }

    function setupOrderButtons() {
        const container = document.getElementById("adminOrders");
        if (!container || container.dataset.ordersFixReady === "true") return;

        container.dataset.ordersFixReady = "true";

        container.addEventListener("click", function (event) {
            const button = event.target.closest("[data-order-action]");
            if (!button) return;

            const orderId = decodeURIComponent(button.dataset.orderId || "");
            const action = button.dataset.orderAction;

            if (action === "accept") acceptOrder(orderId);
            if (action === "reject") rejectOrder(orderId);
        });
    }

    function setupOrdersTab() {
        const ordersTab = document.getElementById("ordersTab");
        const productsTab = document.getElementById("productsTab");
        const categoriesTab = document.getElementById("categoriesTab");

        if (!ordersTab) return;

        ordersTab.addEventListener("click", function () {
            activateTab(ordersTab);
            renderOrders();
        });

        if (productsTab) {
            productsTab.addEventListener("click", function () {
                activateTab(productsTab);
            });
        }

        if (categoriesTab) {
            categoriesTab.addEventListener("click", function () {
                activateTab(categoriesTab);
            });
        }
    }

    document.addEventListener("DOMContentLoaded", function () {
        setupOrdersTab();
        setupOrderButtons();
        renderOrders();
    });
})();
