/* =========================================================
   THREADED TRINKETS - ORDERS ADMIN ONLY
   Fixes Orders tab + cloud orders + customer details +
   Accept / Decline. Does NOT modify Products or Categories.
========================================================= */
(function () {
    "use strict";
    const ORDERS_KEY = "threadedTrinketsOrders";
    const API_URL = "/.netlify/functions/orders";
    let loading = false;
    const $ = id => document.getElementById(id);
    const clean = value => String(value ?? "").trim();

    function escapeHTML(value) {
        return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }
    function money(value) { return "₹" + Number(value || 0).toLocaleString("en-IN"); }
    function localOrders() {
        try {
            const value = localStorage.getItem(ORDERS_KEY);
            const data = value ? JSON.parse(value) : [];
            return Array.isArray(data) ? data : [];
        } catch (error) { console.error("Orders: local read failed", error); return []; }
    }
    function saveLocal(orders) {
        try { localStorage.setItem(ORDERS_KEY, JSON.stringify(orders)); return true; }
        catch (error) { console.error("Orders: local save failed", error); return false; }
    }
    function idOf(order) { return clean(order && (order.orderId || order.id)); }
    function statusOf(order) { return clean(order && (order.orderStatus || order.status)) || "New"; }
    function isPending(order) { return ["new", "pending", "payment pending"].includes(statusOf(order).toLowerCase()); }

    function customerValue(order, keys) {
        const customer = order.customer || order.customerDetails || order.customerInfo || {};
        for (const key of keys) {
            if (clean(customer[key])) return customer[key];
            if (clean(order[key])) return order[key];
        }
        return "Not provided";
    }

    function show(id, display) {
        const element = $(id);
        if (!element) return;
        element.hidden = display === "none";
        element.style.setProperty("display", display, "important");
    }

    function tabs(active) {
        ["productsTab", "categoriesTab", "ordersTab"].forEach(id => {
            const tab = $(id);
            if (tab) tab.classList.toggle("active", id === active);
        });
    }

    function openProducts() {
        show("productsSection", "grid");
        show("categoriesSection", "none");
        show("ordersSection", "none");
        tabs("productsTab");
    }

    function openCategories() {
        show("productsSection", "none");
        show("categoriesSection", "block");
        show("ordersSection", "none");
        tabs("categoriesTab");
    }

    async function getCloudOrders() {
        const response = await fetch(API_URL + "?t=" + Date.now(), { method: "GET", cache: "no-store", headers: { Accept: "application/json" } });
        if (!response.ok) throw new Error("Orders API HTTP " + response.status);
        const data = await response.json();
        return Array.isArray(data.orders) ? data.orders : [];
    }

    async function saveCloudOrder(order) {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(order)
        });
        if (!response.ok) throw new Error("Orders API HTTP " + response.status);
    }

    async function syncCloudToLocal() {
        if (loading) return;
        loading = true;
        try {
            const cloud = await getCloudOrders();
            const local = localOrders();
            const map = new Map();
            local.forEach(order => { if (idOf(order)) map.set(idOf(order), order); });
            cloud.forEach(order => { if (idOf(order)) map.set(idOf(order), order); });
            const merged = Array.from(map.values()).sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
            saveLocal(merged);
            renderOrders();
        } catch (error) {
            console.error("Orders: cloud sync failed", error);
            renderOrders();
        } finally { loading = false; }
    }

    function renderOrders() {
        const container = $("adminOrders");
        const count = $("orderCount");
        const empty = $("noOrders");
        if (!container) return;
        const orders = localOrders();
        if (count) count.textContent = orders.length;
        if (!orders.length) {
            container.innerHTML = "";
            if (empty) empty.style.setProperty("display", "block", "important");
            return;
        }
        if (empty) empty.style.setProperty("display", "none", "important");

        container.innerHTML = orders.map(order => {
            const id = idOf(order) || "Not available";
            const currentStatus = statusOf(order);
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
            const itemsHTML = items.length ? items.map(item => {
                const qty = Math.max(1, Number(item.quantity) || 1);
                const price = Number(item.price) || 0;
                return `<div style="display:flex;justify-content:space-between;gap:20px;padding:10px 0;border-bottom:1px solid #eee"><span>${escapeHTML(item.name || "Product")} × ${qty}</span><strong>${money(price * qty)}</strong></div>`;
            }).join("") : "<p>No product information available.</p>";
            const actions = isPending(order) ? `<div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:20px"><button type="button" class="admin-save-btn" data-order-action="accept" data-order-id="${escapeHTML(id)}">✓ Accept Order</button><button type="button" class="admin-cancel-btn" data-order-action="decline" data-order-id="${escapeHTML(id)}">✕ Decline Order</button></div><p style="margin-top:10px;font-size:13px;opacity:.75">Verify the UPI payment manually before accepting.</p>` : "";
            const reason = currentStatus.toLowerCase() === "rejected" && order.rejectionReason ? `<p><strong>Decline Reason:</strong> ${escapeHTML(order.rejectionReason)}</p>` : "";
            return `<article class="admin-form-card admin-order-card" style="margin-bottom:20px"><div style="display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap;margin-bottom:20px"><div><p><strong>Order ID:</strong> ${escapeHTML(id)}</p><p><strong>Order Date:</strong> ${escapeHTML(order.createdAt ? new Date(order.createdAt).toLocaleString("en-IN") : "Not available")}</p></div><div style="padding:8px 14px;border-radius:20px;background:#f8e8ef;font-weight:700">${escapeHTML(currentStatus)}</div></div><div style="margin-bottom:25px"><h3>👤 Customer Details</h3><p><strong>Name:</strong> ${escapeHTML(customer.name)}</p><p><strong>Phone:</strong> ${escapeHTML(customer.phone)}</p><p><strong>Email:</strong> ${escapeHTML(customer.email)}</p><p><strong>Address:</strong> ${escapeHTML(customer.address)}</p><p><strong>City:</strong> ${escapeHTML(customer.city)}</p><p><strong>State:</strong> ${escapeHTML(customer.state)}</p><p><strong>Pincode:</strong> ${escapeHTML(customer.pincode)}</p><p><strong>Landmark:</strong> ${escapeHTML(customer.landmark)}</p></div><div style="margin-bottom:25px"><h3>🛍️ Ordered Products</h3>${itemsHTML}</div><div style="margin-bottom:25px"><h3>💳 Payment Information</h3><p><strong>Method:</strong> ${escapeHTML(order.paymentMethod || "UPI")}</p><p><strong>UPI ID:</strong> ${escapeHTML(order.upiId || "7842391877@ibl")}</p><p><strong>Payment Status:</strong> ${escapeHTML(order.paymentStatus || "Payment Pending")}</p><p><strong>Verification:</strong> ${escapeHTML(order.paymentVerification || "Manual verification required.")}</p></div><div style="padding-top:15px;border-top:1px solid #ddd"><h3>Total: ${money(order.total)}</h3></div>${actions}${reason}</article>`;
        }).join("");
    }

    async function processOrder(id, action) {
        const orders = localOrders();
        const index = orders.findIndex(order => idOf(order) === String(id));
        if (index < 0) { await syncCloudToLocal(); alert("Order could not be found. Please try again."); return; }
        const order = orders[index];
        if (!isPending(order)) { alert("This order has already been processed."); renderOrders(); return; }
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
        saveLocal(orders);
        renderOrders();
        try { await saveCloudOrder(order); }
        catch (error) {
            console.error("Orders: status cloud sync failed", error);
            alert("The order was changed on this admin device, but cloud synchronization failed. Please check Netlify deployment.");
            return;
        }
        alert(action === "accept" ? "Order accepted successfully." : "Order declined successfully.");
    }

    function openOrders() {
        show("productsSection", "none");
        show("categoriesSection", "none");
        show("ordersSection", "block");
        tabs("ordersTab");
        renderOrders();
        syncCloudToLocal();
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function bind() {
        const ordersTab = $("ordersTab");
        if (ordersTab && ordersTab.dataset.ordersOnlyBound !== "1") {
            ordersTab.dataset.ordersOnlyBound = "1";
            ordersTab.addEventListener("click", function (event) {
                event.preventDefault();
                event.stopImmediatePropagation();
                openOrders();
            }, true);
        }
        const productsTab = $("productsTab");
        if (productsTab && productsTab.dataset.ordersOnlyBound !== "1") {
            productsTab.dataset.ordersOnlyBound = "1";
            productsTab.addEventListener("click", function (event) { event.preventDefault(); openProducts(); }, true);
        }
        const categoriesTab = $("categoriesTab");
        if (categoriesTab && categoriesTab.dataset.ordersOnlyBound !== "1") {
            categoriesTab.dataset.ordersOnlyBound = "1";
            categoriesTab.addEventListener("click", function (event) { event.preventDefault(); openCategories(); }, true);
        }
        const container = $("adminOrders");
        if (container && container.dataset.ordersActionsBound !== "1") {
            container.dataset.ordersActionsBound = "1";
            container.addEventListener("click", function (event) {
                const button = event.target.closest("[data-order-action]");
                if (!button) return;
                processOrder(button.getAttribute("data-order-id"), button.getAttribute("data-order-action"));
            });
        }
    }

    function start() {
        bind();
        openProducts();
        syncCloudToLocal();
        setInterval(syncCloudToLocal, 5000);
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
    else start();

    window.threadedTrinketsOpenOrders = openOrders;
    window.threadedTrinketsRefreshOrders = renderOrders;
})();
