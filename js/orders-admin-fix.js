/* =========================================================
   THREADED TRINKETS - ADMIN ORDERS FIX
   Orders tab + customer details + accept / decline.
   Does NOT clear or modify Products / Categories.
   Also reads the shared Netlify cloud orders store so orders
   created on another device can appear in Admin.
========================================================= */

(function () {
    "use strict";

    const ORDERS_KEY = "threadedTrinketsOrders";
    const CLOUD_ORDERS_URL = "/.netlify/functions/orders";
    let initialized = false;
    let cloudLoading = false;

    function text(value) {
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

    function readOrders() {
        try {
            const raw = localStorage.getItem(ORDERS_KEY);
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            console.error("Unable to read orders:", error);
            return [];
        }
    }

    function saveOrders(orders) {
        try {
            localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
            return true;
        } catch (error) {
            console.error("Unable to save orders:", error);
            return false;
        }
    }

    function orderId(order) {
        return text(order.orderId || order.id) || "Not available";
    }

    function orderStatus(order) {
        return text(order.orderStatus || order.status) || "New";
    }

    function isPending(order) {
        const value = orderStatus(order).toLowerCase();
        return value === "new" || value === "pending" || value === "payment pending";
    }

    function customerValue(order, keys) {
        const customer = order.customer || order.customerDetails || order.customerInfo || {};
        for (const key of keys) {
            if (text(customer[key])) return customer[key];
            if (text(order[key])) return order[key];
        }
        return "Not provided";
    }

    function showSection(id, display) {
        const element = document.getElementById(id);
        if (element) {
            element.hidden = display === "none";
            element.style.setProperty("display", display, "important");
        }
    }

    function activateTab(tabId) {
        ["productsTab", "categoriesTab", "ordersTab"].forEach(function (id) {
            const tab = document.getElementById(id);
            if (tab) tab.classList.toggle("active", id === tabId);
        });
    }

    function openProducts() {
        showSection("productsSection", "grid");
        showSection("categoriesSection", "none");
        showSection("ordersSection", "none");
        activateTab("productsTab");
    }

    function openCategories() {
        showSection("productsSection", "none");
        showSection("categoriesSection", "block");
        showSection("ordersSection", "none");
        activateTab("categoriesTab");
    }

    async function loadCloudOrders() {
        if (cloudLoading) return;
        cloudLoading = true;

        try {
            const response = await fetch(CLOUD_ORDERS_URL + "?t=" + Date.now(), {
                method: "GET",
                cache: "no-store",
                headers: { "Accept": "application/json" }
            });

            if (!response.ok) {
                throw new Error("Orders service returned HTTP " + response.status);
            }

            const data = await response.json();
            const cloudOrders = Array.isArray(data.orders) ? data.orders : [];
            const localOrders = readOrders();
            const merged = new Map();

            localOrders.forEach(function (order) {
                const id = orderId(order);
                if (id && id !== "Not available") merged.set(id, order);
            });

            cloudOrders.forEach(function (order) {
                const id = orderId(order);
                if (id && id !== "Not available") merged.set(id, order);
            });

            const finalOrders = Array.from(merged.values()).sort(function (a, b) {
                return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
            });

            if (JSON.stringify(finalOrders) !== JSON.stringify(localOrders)) {
                saveOrders(finalOrders);
            }

            renderOrders();
        } catch (error) {
            console.error("Unable to load cloud orders:", error);
            // Keep the existing local orders working if the cloud service is unavailable.
            renderOrders();
        } finally {
            cloudLoading = false;
        }
    }

    function openOrders() {
        showSection("productsSection", "none");
        showSection("categoriesSection", "none");
        showSection("ordersSection", "block");
        activateTab("ordersTab");
        renderOrders();
        loadCloudOrders();
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function renderOrders() {
        const container = document.getElementById("adminOrders");
        const count = document.getElementById("orderCount");
        const empty = document.getElementById("noOrders");
        if (!container) return;

        const orders = readOrders();
        if (count) count.textContent = orders.length;

        if (!orders.length) {
            container.innerHTML = "";
            if (empty) empty.style.setProperty("display", "block", "important");
            return;
        }

        if (empty) empty.style.setProperty("display", "none", "important");

        container.innerHTML = orders.map(function (order) {
            const id = orderId(order);
            const currentStatus = orderStatus(order);
            const created = order.createdAt ? new Date(order.createdAt).toLocaleString("en-IN") : "Not available";
            const name = customerValue(order, ["name", "fullName", "customerName"]);
            const phone = customerValue(order, ["phone", "customerPhone"]);
            const email = customerValue(order, ["email", "customerEmail"]);
            const address = customerValue(order, ["address", "customerAddress"]);
            const city = customerValue(order, ["city", "customerCity"]);
            const state = customerValue(order, ["state", "customerState"]);
            const pincode = customerValue(order, ["pincode", "customerPincode", "pinCode"]);
            const landmark = customerValue(order, ["landmark", "customerLandmark"]);
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

            const rejection = currentStatus.toLowerCase() === "rejected" && order.rejectionReason
                ? `<p><strong>Decline Reason:</strong> ${escapeHTML(order.rejectionReason)}</p>` : "";

            return `<article class="admin-form-card admin-order-card" style="margin-bottom:20px;">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:20px;flex-wrap:wrap;margin-bottom:20px;">
                    <div><p><strong>Order ID:</strong> ${escapeHTML(id)}</p><p><strong>Order Date:</strong> ${escapeHTML(created)}</p></div>
                    <div style="padding:8px 14px;border-radius:20px;background:#f8e8ef;font-weight:700;">${escapeHTML(currentStatus)}</div>
                </div>
                <div style="margin-bottom:25px;"><h3>👤 Customer Details</h3>
                    <p><strong>Name:</strong> ${escapeHTML(name)}</p>
                    <p><strong>Phone:</strong> ${escapeHTML(phone)}</p>
                    <p><strong>Email:</strong> ${escapeHTML(email)}</p>
                    <p><strong>Address:</strong> ${escapeHTML(address)}</p>
                    <p><strong>City:</strong> ${escapeHTML(city)}</p>
                    <p><strong>State:</strong> ${escapeHTML(state)}</p>
                    <p><strong>Pincode:</strong> ${escapeHTML(pincode)}</p>
                    <p><strong>Landmark:</strong> ${escapeHTML(landmark)}</p>
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

    async function updateOrderStatus(id, newStatus) {
        const orders = readOrders();
        const index = orders.findIndex(function (order) { return orderId(order) === String(id); });
        if (index < 0) { alert("Order could not be found."); return; }
        if (!isPending(orders[index])) { alert("This order has already been processed."); renderOrders(); return; }

        const order = orders[index];
        if (newStatus === "Accepted") {
            if (!confirm("Verify the UPI payment manually.\n\nClick OK to accept this order.")) return;
            order.orderStatus = "Accepted";
            order.status = "Accepted";
            order.acceptedAt = new Date().toISOString();
        } else {
            const reason = prompt("Reason for declining the order:", "Payment not verified / Product unavailable");
            if (reason === null) return;
            order.orderStatus = "Rejected";
            order.status = "Rejected";
            order.rejectedAt = new Date().toISOString();
            order.rejectionReason = text(reason) || "No reason provided";
        }

        if (!saveOrders(orders)) return;
        renderOrders();

        // Keep the admin decision synchronized across devices.
        try {
            await fetch(CLOUD_ORDERS_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(order)
            });
        } catch (error) {
            console.error("Unable to sync order status to cloud:", error);
        }

        alert(newStatus === "Accepted" ? "Order accepted successfully." : "Order declined successfully.");
    }

    function bindTabs() {
        const productsTab = document.getElementById("productsTab");
        const categoriesTab = document.getElementById("categoriesTab");
        const ordersTab = document.getElementById("ordersTab");

        if (productsTab && productsTab.dataset.ordersFixBound !== "1") {
            productsTab.dataset.ordersFixBound = "1";
            productsTab.addEventListener("click", function (event) {
                event.preventDefault();
                openProducts();
            }, true);
        }

        if (categoriesTab && categoriesTab.dataset.ordersFixBound !== "1") {
            categoriesTab.dataset.ordersFixBound = "1";
            categoriesTab.addEventListener("click", function (event) {
                event.preventDefault();
                openCategories();
            }, true);
        }

        if (ordersTab && ordersTab.dataset.ordersFixBound !== "1") {
            ordersTab.dataset.ordersFixBound = "1";
            ordersTab.addEventListener("click", function (event) {
                event.preventDefault();
                event.stopImmediatePropagation();
                openOrders();
            }, true);
            ordersTab.onclick = function (event) {
                event.preventDefault();
                event.stopPropagation();
                openOrders();
                return false;
            };
        }
    }

    function bindOrderButtons() {
        const container = document.getElementById("adminOrders");
        if (!container || container.dataset.ordersBound === "1") return;
        container.dataset.ordersBound = "1";
        container.addEventListener("click", function (event) {
            const button = event.target.closest("[data-order-action]");
            if (!button) return;
            const id = button.getAttribute("data-order-id");
            const action = button.getAttribute("data-order-action");
            if (action === "accept") updateOrderStatus(id, "Accepted");
            if (action === "decline") updateOrderStatus(id, "Rejected");
        });
    }

    function start() {
        if (initialized) return;
        initialized = true;
        bindTabs();
        bindOrderButtons();
        openProducts();
        loadCloudOrders();
        setInterval(loadCloudOrders, 5000);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start, { once: true });
    } else {
        start();
    }

    window.addEventListener("storage", function (event) {
        if (event.key === ORDERS_KEY) renderOrders();
    });

    window.threadedTrinketsOpenOrders = openOrders;
    window.threadedTrinketsRefreshOrders = renderOrders;
})();
