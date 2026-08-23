/* =========================================================
   THREADED TRINKETS - ORDERS ADMIN FIX
   ONLY controls the Orders tab and Orders section.
   Products and Categories are NOT modified.
========================================================= */
(function () {
    "use strict";

    const ORDERS_KEY = "threadedTrinketsOrders";
    const API_URL = "/.netlify/functions/orders";
    const byId = id => document.getElementById(id);
    const clean = value => String(value ?? "").trim();

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
            const data = raw ? JSON.parse(raw) : [];
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error("Orders localStorage error:", error);
            return [];
        }
    }

    function saveLocalOrders(orders) {
        try {
            localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
        } catch (error) {
            console.error("Orders localStorage save error:", error);
        }
    }

    function orderId(order) {
        return clean(order && (order.orderId || order.id));
    }

    function orderStatus(order) {
        return clean(order && (order.orderStatus || order.status)) || "New";
    }

    function isPending(order) {
        return ["new", "pending", "payment pending"].includes(orderStatus(order).toLowerCase());
    }

    function customerValue(order, keys) {
        const customer = order.customer || order.customerDetails || order.customerInfo || {};
        for (const key of keys) {
            if (clean(customer[key])) return customer[key];
            if (clean(order[key])) return order[key];
        }
        return "Not provided";
    }

    function showSection(id, display) {
        const element = byId(id);
        if (!element) return;
        element.hidden = display === "none";
        element.style.setProperty("display", display, "important");
    }

    function setActive(tabId) {
        document.querySelectorAll(".admin-tab").forEach(function (tab) {
            tab.classList.toggle("active", tab.id === tabId);
        });
    }

    function openProducts() {
        showSection("productsSection", "grid");
        showSection("categoriesSection", "none");
        showSection("ordersSection", "none");
        setActive("productsTab");
    }

    function openCategories() {
        showSection("productsSection", "none");
        showSection("categoriesSection", "block");
        showSection("ordersSection", "none");
        setActive("categoriesTab");
    }

    function renderOrders() {
        const container = byId("adminOrders");
        const count = byId("orderCount");
        const empty = byId("noOrders");
        if (!container) return;

        const orders = readLocalOrders();
        if (count) count.textContent = String(orders.length);

        if (!orders.length) {
            container.innerHTML = "";
            if (empty) empty.style.setProperty("display", "block", "important");
            return;
        }

        if (empty) empty.style.setProperty("display", "none", "important");

        container.innerHTML = orders.map(function (order) {
            const id = orderId(order) || "Not available";
            const status = orderStatus(order);
            const customer = {
                name: customerValue(order, ["name", "fullName", "customerName"]),
                phone: customerValue(order, ["phone", "customerPhone"]),
                email: customerValue(order, ["email", "customerEmail"]),
                address: customerValue(order, ["address", "customerAddress"]),
                city: customerValue(order, ["city", "customerCity"]),
                state: customerValue(order, ["state", "customerState"]),
                pincode: customerValue(order, ["pincode", "customerPincode", "pinCode"]),
                landmark: customerValue(order, ["landmark", "customerLandmark"])
            };
            const items = Array.isArray(order.items) ? order.items : [];
            const itemsHTML = items.length ? items.map(function (item) {
                const quantity = Math.max(1, Number(item.quantity) || 1);
                const price = Number(item.price) || 0;
                return `<div style="display:flex;justify-content:space-between;gap:20px;padding:10px 0;border-bottom:1px solid #eee;"><span>${escapeHTML(item.name || "Product")} × ${quantity}</span><strong>${money(price * quantity)}</strong></div>`;
            }).join("") : "<p>No product information available.</p>";

            const actions = isPending(order) ? `
                <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:20px;">
                    <button type="button" class="admin-save-btn" data-order-action="accept" data-order-id="${escapeHTML(id)}">✓ Accept Order</button>
                    <button type="button" class="admin-cancel-btn" data-order-action="decline" data-order-id="${escapeHTML(id)}">✕ Decline Order</button>
                </div>
                <p style="margin-top:10px;font-size:13px;opacity:.75;">Verify the UPI payment manually before accepting.</p>` : "";

            const rejection = status.toLowerCase() === "rejected" && order.rejectionReason
                ? `<p><strong>Decline Reason:</strong> ${escapeHTML(order.rejectionReason)}</p>` : "";

            return `<article class="admin-form-card admin-order-card" style="margin-bottom:20px;">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:20px;flex-wrap:wrap;margin-bottom:20px;">
                    <div><p><strong>Order ID:</strong> ${escapeHTML(id)}</p><p><strong>Order Date:</strong> ${escapeHTML(order.createdAt ? new Date(order.createdAt).toLocaleString("en-IN") : "Not available")}</p></div>
                    <div style="padding:8px 14px;border-radius:20px;background:#f8e8ef;font-weight:700;">${escapeHTML(status)}</div>
                </div>
                <div style="margin-bottom:25px;"><h3>👤 Customer Details</h3>
                    <p><strong>Name:</strong> ${escapeHTML(customer.name)}</p>
                    <p><strong>Phone:</strong> ${escapeHTML(customer.phone)}</p>
                    <p><strong>Email:</strong> ${escapeHTML(customer.email)}</p>
                    <p><strong>Address:</strong> ${escapeHTML(customer.address)}</p>
                    <p><strong>City:</strong> ${escapeHTML(customer.city)}</p>
                    <p><strong>State:</strong> ${escapeHTML(customer.state)}</p>
                    <p><strong>Pincode:</strong> ${escapeHTML(customer.pincode)}</p>
                    <p><strong>Landmark:</strong> ${escapeHTML(customer.landmark)}</p>
                </div>
                <div style="margin-bottom:25px;"><h3>🛍️ Ordered Products</h3>${itemsHTML}</div>
                <div style="margin-bottom:25px;"><h3>💳 Payment Information</h3>
                    <p><strong>Method:</strong> ${escapeHTML(order.paymentMethod || "UPI")}</p>
                    <p><strong>UPI ID:</strong> ${escapeHTML(order.upiId || "7842391877@ibl")}</p>
                    <p><strong>Payment Status:</strong> ${escapeHTML(order.paymentStatus || "Payment Pending")}</p>
                    <p><strong>Verification:</strong> ${escapeHTML(order.paymentVerification || "Manual verification required.")}</p>
                </div>
                <div style="padding-top:15px;border-top:1px solid #ddd;"><h3>Total: ${money(order.total)}</h3></div>
                ${actions}${rejection}
            </article>`;
        }).join("");
    }

    async function getCloudOrders() {
        const response = await fetch(API_URL + "?t=" + Date.now(), {
            method: "GET",
            cache: "no-store",
            headers: { Accept: "application/json" }
        });
        if (!response.ok) throw new Error("Orders API HTTP " + response.status);
        const data = await response.json();
        return Array.isArray(data.orders) ? data.orders : [];
    }

    async function syncCloudOrders() {
        try {
            const cloudOrders = await getCloudOrders();
            const localOrders = readLocalOrders();
            const map = new Map();
            localOrders.forEach(function (order) { if (orderId(order)) map.set(orderId(order), order); });
            cloudOrders.forEach(function (order) { if (orderId(order)) map.set(orderId(order), order); });
            const merged = Array.from(map.values()).sort(function (a, b) {
                return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
            });
            saveLocalOrders(merged);
            renderOrders();
        } catch (error) {
            console.error("Orders cloud sync failed:", error);
            renderOrders();
        }
    }

    async function saveCloudOrder(order) {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(order)
        });
        if (!response.ok) throw new Error("Orders API HTTP " + response.status);
    }

    async function processOrder(id, action) {
        const orders = readLocalOrders();
        const index = orders.findIndex(function (order) { return orderId(order) === String(id); });
        if (index < 0) {
            await syncCloudOrders();
            alert("Order could not be found. Please try again.");
            return;
        }

        const order = orders[index];
        if (!isPending(order)) {
            alert("This order has already been processed.");
            renderOrders();
            return;
        }

        if (action === "accept") {
            if (!confirm("Verify the UPI payment manually.\n\nClick OK to accept this order.")) return;
            order.orderStatus = "Accepted";
            order.status = "Accepted";
            order.paymentVerification = "Manually verified by admin";
            order.acceptedAt = new Date().toISOString();
        } else {
            const reason = prompt("Reason for declining the order:", "Payment not verified / Product unavailable");
            if (reason === null) return;
            order.orderStatus = "Rejected";
            order.status = "Rejected";
            order.rejectionReason = clean(reason) || "No reason provided";
            order.rejectedAt = new Date().toISOString();
        }

        saveLocalOrders(orders);
        renderOrders();
        try {
            await saveCloudOrder(order);
            alert(action === "accept" ? "Order accepted successfully." : "Order declined successfully.");
        } catch (error) {
            console.error("Orders status cloud sync failed:", error);
            alert("Order changed on this admin device, but cloud synchronization failed.");
        }
    }

    function openOrders() {
        showSection("productsSection", "none");
        showSection("categoriesSection", "none");
        showSection("ordersSection", "block");
        setActive("ordersTab");
        renderOrders();
        syncCloudOrders();
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function bind() {
        const ordersTab = byId("ordersTab");
        const productsTab = byId("productsTab");
        const categoriesTab = byId("categoriesTab");
        const ordersContainer = byId("adminOrders");

        if (!ordersTab) {
            console.error("Orders fix: #ordersTab was not found.");
            return;
        }

        /* Replace only the tab's click property. No capture listener. */
        ordersTab.onclick = function (event) {
            if (event) event.preventDefault();
            openOrders();
            return false;
        };

        if (productsTab) {
            productsTab.onclick = function (event) {
                if (event) event.preventDefault();
                openProducts();
                return false;
            };
        }

        if (categoriesTab) {
            categoriesTab.onclick = function (event) {
                if (event) event.preventDefault();
                openCategories();
                return false;
            };
        }

        if (ordersContainer && ordersContainer.dataset.ordersActionsBound !== "1") {
            ordersContainer.dataset.ordersActionsBound = "1";
            ordersContainer.addEventListener("click", function (event) {
                const button = event.target.closest("[data-order-action]");
                if (!button) return;
                processOrder(button.getAttribute("data-order-id"), button.getAttribute("data-order-action"));
            });
        }
    }

    function start() {
        bind();
        openProducts();
        syncCloudOrders();
        setInterval(syncCloudOrders, 5000);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start, { once: true });
    } else {
        start();
    }

    window.threadedTrinketsOpenOrders = openOrders;
    window.threadedTrinketsRefreshOrders = renderOrders;
})();
