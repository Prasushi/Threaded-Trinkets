/* =========================================================
   THREADED TRINKETS - ADMIN ORDERS
   FIXED / ISOLATED ORDERS TAB

   IMPORTANT:
   - Does NOT touch Products storage.
   - Does NOT touch Categories storage.
   - Does NOT replace admin.js.
   - Works on /admin and /admin.html.
   - Loads local orders and cloud orders.
   - Customer details + products + payment + Accept/Decline.
========================================================= */

(function () {
    "use strict";

    const ORDERS_KEY = "threadedTrinketsOrders";
    const API_URL = "https://script.google.com/macros/s/AKfycbxWnapTLFStJ7VYJd4XqWPi-QArun6dSP_ws7WiN0_-FgcAqmN-g2v_fbW6Q2_fYbfE0A/exec";

    function byId(id) {
        return document.getElementById(id);
    }

    function clean(value) {
        return String(value ?? "").trim();
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

    function readLocalOrders() {
        try {
            const raw = localStorage.getItem(ORDERS_KEY);
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            console.error("Orders: localStorage read failed", error);
            return [];
        }
    }

    function saveLocalOrders(orders) {
        try {
            localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
        } catch (error) {
            console.error("Orders: localStorage save failed", error);
        }
    }

    function getOrderId(order) {
        return clean(order && (order.orderId || order.id));
    }

    function getStatus(order) {
        return clean(order && (order.orderStatus || order.status)) || "New";
    }

    function isPending(order) {
        return ["new", "pending", "payment pending"].includes(
            getStatus(order).toLowerCase()
        );
    }

    function getCustomerValue(order, keys) {
        const customer =
            (order && (order.customer || order.customerDetails || order.customerInfo)) || {};

        for (const key of keys) {
            if (clean(customer[key])) return customer[key];
            if (clean(order && order[key])) return order[key];
        }

        return "Not provided";
    }

    function setSection(id, visible, display) {
        const element = byId(id);
        if (!element) return;

        element.hidden = !visible;
        element.style.setProperty("display", visible ? display : "none", "important");
    }

    function setActiveTab(tabId) {
        document.querySelectorAll(".admin-tab").forEach(function (tab) {
            tab.classList.toggle("active", tab.id === tabId);
        });
    }

    function openProducts() {
        setSection("productsSection", true, "grid");
        setSection("categoriesSection", false, "block");
        setSection("ordersSection", false, "block");
        setActiveTab("productsTab");
    }

    function openCategories() {
        setSection("productsSection", false, "grid");
        setSection("categoriesSection", true, "block");
        setSection("ordersSection", false, "block");
        setActiveTab("categoriesTab");
    }

    function openOrders() {
        setSection("productsSection", false, "grid");
        setSection("categoriesSection", false, "block");
        setSection("ordersSection", true, "block");
        setActiveTab("ordersTab");
        renderOrders();
        syncCloudOrders();
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function renderOrders() {
        const container = byId("adminOrders");
        const count = byId("orderCount");
        const empty = byId("noOrders");

        if (!container) {
            console.error("Orders: #adminOrders was not found.");
            return;
        }

        const orders = readLocalOrders();

        if (count) count.textContent = String(orders.length);

        if (!orders.length) {
            container.innerHTML = "";
            if (empty) empty.style.setProperty("display", "block", "important");
            return;
        }

        if (empty) empty.style.setProperty("display", "none", "important");

        container.innerHTML = orders.map(function (order) {
            const id = getOrderId(order) || "Not available";
            const status = getStatus(order);
            const created = order && order.createdAt
                ? new Date(order.createdAt).toLocaleString("en-IN")
                : "Not available";

            const name = getCustomerValue(order, ["name", "fullName", "customerName"]);
            const phone = getCustomerValue(order, ["phone", "customerPhone"]);
            const email = getCustomerValue(order, ["email", "customerEmail"]);
            const address = getCustomerValue(order, ["address", "customerAddress"]);
            const city = getCustomerValue(order, ["city", "customerCity"]);
            const state = getCustomerValue(order, ["state", "customerState"]);
            const pincode = getCustomerValue(order, ["pincode", "customerPincode", "pinCode"]);
            const landmark = getCustomerValue(order, ["landmark", "customerLandmark"]);

            const items = Array.isArray(order && order.items) ? order.items : [];

            const itemsHTML = items.length
                ? items.map(function (item) {
                    const quantity = Math.max(1, Number(item.quantity) || 1);
                    const price = Number(item.price) || 0;
                    return `
                        <div style="display:flex;justify-content:space-between;gap:20px;padding:10px 0;border-bottom:1px solid #eee;">
                            <span>${escapeHTML(item.name || "Product")} × ${quantity}</span>
                            <strong>${money(price * quantity)}</strong>
                        </div>`;
                }).join("")
                : "<p>No product information available.</p>";

            const actions = isPending(order)
                ? `
                    <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:20px;">
                        <button type="button" class="admin-save-btn" data-order-action="accept" data-order-id="${escapeHTML(id)}">✓ Accept Order</button>
                        <button type="button" class="admin-cancel-btn" data-order-action="decline" data-order-id="${escapeHTML(id)}">✕ Decline Order</button>
                    </div>
                    <p style="margin-top:10px;font-size:13px;opacity:.75;">Verify the UPI payment manually before accepting.</p>`
                : "";

            const rejection =
                status.toLowerCase() === "rejected" && order.rejectionReason
                    ? `<p><strong>Decline Reason:</strong> ${escapeHTML(order.rejectionReason)}</p>`
                    : "";

            return `
                <article class="admin-form-card admin-order-card" style="margin-bottom:20px;">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:20px;flex-wrap:wrap;margin-bottom:20px;">
                        <div>
                            <p><strong>Order ID:</strong> ${escapeHTML(id)}</p>
                            <p><strong>Order Date:</strong> ${escapeHTML(created)}</p>
                        </div>
                        <div style="padding:8px 14px;border-radius:20px;background:#f8e8ef;font-weight:700;">
                            ${escapeHTML(status)}
                        </div>
                    </div>

                    <div style="margin-bottom:25px;">
                        <h3>👤 Customer Details</h3>
                        <p><strong>Name:</strong> ${escapeHTML(name)}</p>
                        <p><strong>Phone:</strong> ${escapeHTML(phone)}</p>
                        <p><strong>Email:</strong> ${escapeHTML(email)}</p>
                        <p><strong>Address:</strong> ${escapeHTML(address)}</p>
                        <p><strong>City:</strong> ${escapeHTML(city)}</p>
                        <p><strong>State:</strong> ${escapeHTML(state)}</p>
                        <p><strong>Pincode:</strong> ${escapeHTML(pincode)}</p>
                        <p><strong>Landmark:</strong> ${escapeHTML(landmark)}</p>
                    </div>

                    <div style="margin-bottom:25px;">
                        <h3>🛍️ Ordered Products</h3>
                        ${itemsHTML}
                    </div>

                    <div style="margin-bottom:25px;">
                        <h3>💳 Payment Information</h3>
                        <p><strong>Method:</strong> ${escapeHTML(order.paymentMethod || "UPI")}</p>
                        <p><strong>UPI ID:</strong> ${escapeHTML(order.upiId || "7842391877@ibl")}</p>
                        <p><strong>Payment Status:</strong> ${escapeHTML(order.paymentStatus || "Payment Pending")}</p>
                        <p><strong>Verification:</strong> ${escapeHTML(order.paymentVerification || "Manual verification required.")}</p>
                    </div>

                    <div style="padding-top:15px;border-top:1px solid #ddd;">
                        <h3>Total: ${money(order.total)}</h3>
                    </div>

                    ${actions}
                    ${rejection}
                </article>`;
        }).join("");
    }

    async function getCloudOrders() {
        const response = await fetch(API_URL + "?t=" + Date.now(), {
            method: "GET",
            cache: "no-store",
            headers: { Accept: "application/json" }
        });

        if (!response.ok) {
            throw new Error("Orders API HTTP " + response.status);
        }

        const data = await response.json();
        return Array.isArray(data) ? data : (Array.isArray(data.orders) ? data.orders : []);
    }

    async function postCloudOrder(order) {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify(order)
        });

        if (!response.ok) {
            throw new Error("Orders API HTTP " + response.status);
        }
    }

    async function syncCloudOrders() {
        try {
            const localOrders = readLocalOrders();
            const cloudOrders = await getCloudOrders();
            const map = new Map();

            localOrders.forEach(function (order) {
                const id = getOrderId(order);
                if (id) map.set(id, order);
            });

            cloudOrders.forEach(function (order) {
                const id = getOrderId(order);
                if (id) map.set(id, order);
            });

            const merged = Array.from(map.values()).sort(function (a, b) {
                return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
            });

            saveLocalOrders(merged);
            renderOrders();
        } catch (error) {
            console.warn("Orders cloud sync unavailable; showing local orders.", error);
            renderOrders();
        }
    }

    function findOrder(id) {
        const orders = readLocalOrders();
        const index = orders.findIndex(function (order) {
            return getOrderId(order) === String(id);
        });
        return { orders, index };
    }

    async function processOrder(id, action) {
        const result = findOrder(id);

        if (result.index < 0) {
            await syncCloudOrders();
            alert("Order could not be found. Please open Orders again.");
            return;
        }

        const order = result.orders[result.index];

        if (!isPending(order)) {
            alert("This order has already been processed.");
            renderOrders();
            return;
        }

        if (action === "accept") {
            if (!confirm("Verify the UPI payment manually.\n\nClick OK to accept this order.")) {
                return;
            }

            order.orderStatus = "Accepted";
            order.status = "Accepted";
            order.paymentVerification = "Manually verified by admin";
            order.acceptedAt = new Date().toISOString();
        } else {
            const reason = prompt(
                "Reason for declining the order:",
                "Payment not verified / Product unavailable"
            );

            if (reason === null) return;

            order.orderStatus = "Rejected";
            order.status = "Rejected";
            order.rejectionReason = clean(reason) || "No reason provided";
            order.rejectedAt = new Date().toISOString();
        }

        saveLocalOrders(result.orders);
        renderOrders();

        try {
            await postCloudOrder(order);
            alert(action === "accept" ? "Order accepted successfully." : "Order declined successfully.");
        } catch (error) {
            console.error("Order cloud update failed:", error);
            alert("The order was updated on this admin device, but the cloud update failed.");
        }
    }

    function bindOrdersTab() {
        /*
           Capture phase is intentional.
           This makes the Orders button work even if another old
           admin script has attached a click handler to the button.
        */
        if (document.documentElement.dataset.threadedOrdersTabBound === "1") return;
        document.documentElement.dataset.threadedOrdersTabBound = "1";

        document.addEventListener("click", function (event) {
            const target = event.target && event.target.closest
                ? event.target.closest("#ordersTab")
                : null;

            if (!target) return;

            event.preventDefault();
            event.stopPropagation();
            if (typeof event.stopImmediatePropagation === "function") {
                event.stopImmediatePropagation();
            }

            openOrders();
        }, true);

        const productsTab = byId("productsTab");
        const categoriesTab = byId("categoriesTab");

        if (productsTab) {
            productsTab.addEventListener("click", function (event) {
                event.preventDefault();
                openProducts();
            });
        }

        if (categoriesTab) {
            categoriesTab.addEventListener("click", function (event) {
                event.preventDefault();
                openCategories();
            });
        }
    }

    function bindOrderActions() {
        const container = byId("adminOrders");
        if (!container || container.dataset.orderActionsBound === "1") return;

        container.dataset.orderActionsBound = "1";
        container.addEventListener("click", function (event) {
            const button = event.target.closest("[data-order-action]");
            if (!button) return;

            processOrder(
                button.getAttribute("data-order-id"),
                button.getAttribute("data-order-action")
            );
        });
    }

    function start() {
        bindOrdersTab();
        bindOrderActions();

        /* Keep the existing Products tab as the initial view. */
        openProducts();

        /* Immediately try cloud orders without blocking the page. */
        syncCloudOrders();

        /* Refresh orders while the admin page is open. */
        setInterval(function () {
            const ordersSection = byId("ordersSection");
            if (ordersSection && !ordersSection.hidden && ordersSection.style.display !== "none") {
                syncCloudOrders();
            }
        }, 5000);
    }

    function ensureStarted() {
        if (!byId("ordersTab")) {
            setTimeout(ensureStarted, 100);
            return;
        }
        start();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", ensureStarted, { once: true });
    } else {
        ensureStarted();
    }

    window.threadedTrinketsOpenOrders = openOrders;
    window.threadedTrinketsRefreshOrders = renderOrders;
})();
