/* =========================================================
   THREADED TRINKETS - SHARED CLOUD ORDERS
   Google Apps Script backend for GitHub Pages.
   Products and Categories are not touched.
========================================================= */

(function () {
    "use strict";

    const ORDERS_KEY = "threadedTrinketsOrders";
    const ORDERS_API_URL = "https://script.google.com/macros/s/AKfycbxWnapTLFStJ7VYJd4XqWPi-QArun6dSP_ws7WiN0_-FgcAqmN-g2v_fbW6Q2_fYbfE0A/exec";
    const isAdmin = /(^|\/)admin(?:\.html)?\/?$/i.test(window.location.pathname);
    let syncing = false;

    function readLocalOrders() {
        try {
            const raw = localStorage.getItem(ORDERS_KEY);
            const data = raw ? JSON.parse(raw) : [];
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error("Cloud orders: local read failed", error);
            return [];
        }
    }

    function saveLocalOrders(orders) {
        try {
            localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
        } catch (error) {
            console.error("Cloud orders: local save failed", error);
        }
    }

    function orderId(order) {
        return String(order && (order.orderId || order.id) || "").trim();
    }

    async function getCloudOrders() {
        const response = await fetch(ORDERS_API_URL + "?t=" + Date.now(), {
            method: "GET",
            cache: "no-store"
        });
        if (!response.ok) throw new Error("Orders API HTTP " + response.status);
        const data = await response.json();
        return Array.isArray(data) ? data : [];
    }

    async function sendOrder(order) {
        if (!orderId(order)) return false;

        const response = await fetch(ORDERS_API_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify(order)
        });

        if (!response.ok) throw new Error("Orders API HTTP " + response.status);
        return true;
    }

    async function syncOrders() {
        if (syncing) return;
        syncing = true;

        try {
            const localOrders = readLocalOrders();
            let cloudOrders = await getCloudOrders();

            const cloudIds = new Set(cloudOrders.map(orderId));

            for (const order of localOrders) {
                if (orderId(order) && !cloudIds.has(orderId(order))) {
                    await sendOrder(order);
                }
            }

            cloudOrders = await getCloudOrders();

            const merged = new Map();

            cloudOrders.forEach(function (order) {
                const id = orderId(order);
                if (id) merged.set(id, order);
            });

            localOrders.forEach(function (order) {
                const id = orderId(order);
                if (id && !merged.has(id)) merged.set(id, order);
            });

            const finalOrders = Array.from(merged.values()).sort(function (a, b) {
                return new Date(b.createdAt || 0).getTime() -
                       new Date(a.createdAt || 0).getTime();
            });

            saveLocalOrders(finalOrders);

            if (typeof window.threadedTrinketsRefreshOrders === "function") {
                window.threadedTrinketsRefreshOrders();
            }

            if (isAdmin) {
                console.log("Cloud orders: sync successful (" + finalOrders.length + " orders)");
            }
        } catch (error) {
            console.error("Cloud orders: sync failed", error);
        } finally {
            syncing = false;
        }
    }

    function start() {
        syncOrders();
        setInterval(syncOrders, 5000);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start, { once: true });
    } else {
        start();
    }
})();