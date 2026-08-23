/* =========================================================
   THREADED TRINKETS - SHARED CLOUD ORDERS
   Uses the Netlify Function + Netlify Blobs so orders are
   available across customer and admin devices.
   Does not touch Products or Categories storage.
========================================================= */

(function () {
    "use strict";

    const ORDERS_KEY = "threadedTrinketsOrders";
    const API_URL = "/.netlify/functions/orders";
    const isAdmin = /(^|\/)admin(?:\.html)?\/?$/i.test(window.location.pathname);
    let lastAdminSnapshot = "";
    let syncingAdmin = false;
    let syncingCustomer = false;

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
        return String(order?.orderId || order?.id || "").trim();
    }

    function signature(orders) {
        return JSON.stringify((orders || []).map(function (order) {
            return {
                id: orderId(order),
                status: order.orderStatus || order.status || "New",
                rejectionReason: order.rejectionReason || "",
                acceptedAt: order.acceptedAt || "",
                rejectedAt: order.rejectedAt || ""
            };
        }).sort(function (a, b) {
            return a.id.localeCompare(b.id);
        }));
    }

    async function sendOrder(order) {
        if (!orderId(order)) return false;

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(order)
            });

            if (!response.ok) {
                throw new Error("HTTP " + response.status);
            }

            return true;
        } catch (error) {
            console.error("Cloud orders: upload failed", error);
            return false;
        }
    }

    async function getCloudOrders() {
        const response = await fetch(API_URL + "?t=" + Date.now(), {
            method: "GET",
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error("HTTP " + response.status);
        }

        const data = await response.json();
        return Array.isArray(data.orders) ? data.orders : [];
    }

    async function syncCustomerOrders() {
        if (syncingCustomer) return;
        syncingCustomer = true;

        try {
            const orders = readLocalOrders();
            if (!orders.length) return;

            for (const order of orders) {
                await sendOrder(order);
            }
        } catch (error) {
            console.error("Cloud orders: customer sync failed", error);
        } finally {
            syncingCustomer = false;
        }
    }

    async function syncAdminOrders() {
        if (syncingAdmin) return;
        syncingAdmin = true;

        try {
            const localOrdersBeforeFetch = readLocalOrders();
            const cloudOrders = await getCloudOrders();

            const cloudMap = new Map();
            cloudOrders.forEach(function (order) {
                cloudMap.set(orderId(order), order);
            });

            /*
               First visit: migrate old local-only orders that exist
               on the admin browser but not in the cloud store.
            */
            if (!lastAdminSnapshot && localOrdersBeforeFetch.length) {
                for (const localOrder of localOrdersBeforeFetch) {
                    if (orderId(localOrder) && !cloudMap.has(orderId(localOrder))) {
                        await sendOrder(localOrder);
                    }
                }
            }

            const refreshedCloudOrders = await getCloudOrders();
            const mergedMap = new Map();

            refreshedCloudOrders.forEach(function (order) {
                mergedMap.set(orderId(order), order);
            });

            /*
               If the admin changed an order since the previous sync,
               upload that changed version before refreshing the screen.
            */
            if (lastAdminSnapshot) {
                const currentLocalSignature = signature(localOrdersBeforeFetch);
                if (currentLocalSignature !== lastAdminSnapshot) {
                    for (const localOrder of localOrdersBeforeFetch) {
                        const id = orderId(localOrder);
                        if (!id) continue;
                        const cloudOrder = mergedMap.get(id);
                        if (!cloudOrder || signature([localOrder]) !== signature([cloudOrder])) {
                            await sendOrder(localOrder);
                        }
                    }

                    const finalCloudOrders = await getCloudOrders();
                    finalCloudOrders.forEach(function (order) {
                        mergedMap.set(orderId(order), order);
                    });
                }
            }

            const finalOrders = Array.from(mergedMap.values()).sort(function (a, b) {
                return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
            });

            const before = signature(readLocalOrders());
            const after = signature(finalOrders);

            if (before !== after) {
                saveLocalOrders(finalOrders);
                if (typeof window.threadedTrinketsRefreshOrders === "function") {
                    window.threadedTrinketsRefreshOrders();
                }
            }

            lastAdminSnapshot = signature(finalOrders);
        } catch (error) {
            console.error("Cloud orders: admin sync failed", error);
        } finally {
            syncingAdmin = false;
        }
    }

    function start() {
        if (isAdmin) {
            syncAdminOrders();
            setInterval(syncAdminOrders, 3000);
        } else {
            /* Give payment.js time to create the order, then keep syncing. */
            setTimeout(syncCustomerOrders, 1000);
            setInterval(syncCustomerOrders, 3000);
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start, { once: true });
    } else {
        start();
    }
})();
