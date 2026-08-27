import { getStore } from "@netlify/blobs";

const store = getStore({ name: "threaded-trinkets-orders", consistency: "strong" });

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}

export default async function handler(request) {
  try {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }

    if (request.method === "GET") {
      const { blobs } = await store.list();
      const orders = [];

      for (const blob of blobs) {
        const order = await store.get(blob.key, { type: "json" });
        if (order) orders.push(order);
      }

      orders.sort((a, b) =>
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );

      return json({ orders });
    }

    if (request.method === "POST") {
      const order = await request.json();

      if (!order || !order.orderId) {
        return json({ error: "Order ID is required." }, 400);
      }

      await store.setJSON(String(order.orderId), order);
      return json({ success: true, order });
    }

    return json({ error: "Method not allowed." }, 405);
  } catch (error) {
    console.error("Orders function error:", error);
    return json({ error: "Unable to process orders." }, 500);
  }
}