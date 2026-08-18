document.addEventListener("DOMContentLoaded", function () {

    const CART_KEY = "threadedTrinketsCart";

    const cartContainer =
        document.getElementById("cartItems");

    const emptyCart =
        document.getElementById("emptyCart");

    const subtotalElement =
        document.getElementById("cartSubtotal");

    const totalElement =
        document.getElementById("cartTotal");

    const cartCount =
        document.getElementById("cartCount");

    let cart = [];


    function loadCart() {

        try {

            cart =
                JSON.parse(
                    localStorage.getItem(CART_KEY)
                ) || [];

            if (!Array.isArray(cart)) {
                cart = [];
            }

        } catch (error) {

            console.error(
                "Unable to load cart:",
                error
            );

            cart = [];
        }
    }


    function saveCart() {

        localStorage.setItem(
            CART_KEY,
            JSON.stringify(cart)
        );
    }


    function escapeHTML(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    function updateCartCount() {

        if (!cartCount) {
            return;
        }

        let count = 0;

        cart.forEach(function (item) {

            count +=
                Number(item.quantity) || 1;

        });

        cartCount.textContent = count;
    }


    function renderCart() {

        if (!cartContainer) {
            return;
        }

        cartContainer.innerHTML = "";


        if (cart.length === 0) {

            if (emptyCart) {
                emptyCart.style.display = "block";
            }

            updateTotals();

            return;
        }


        if (emptyCart) {
            emptyCart.style.display = "none";
        }


        cart.forEach(function (item, index) {

            const quantity =
                Number(item.quantity) || 1;

            const price =
                Number(item.price) || 0;

            const itemTotal =
                price * quantity;

            const image =
                item.image ||
                "images/threaded-trinkets-logo.png.webp";


            const cartItem =
                document.createElement("div");

            cartItem.className =
                "cart-item";


            cartItem.innerHTML = `

                <div class="cart-item-image">

                    <img
                        src="${escapeHTML(image)}"
                        alt="${escapeHTML(
                            item.name || "Product"
                        )}"
                        onerror="
                            this.src='images/threaded-trinkets-logo.png.webp'
                        "
                    >

                </div>


                <div class="cart-item-details">

                    <h3>
                        ${escapeHTML(
                            item.name || "Product"
                        )}
                    </h3>

                    ${
                        item.category
                            ? `
                                <p>
                                    ${escapeHTML(
                                        item.category
                                    )}
                                </p>
                              `
                            : ""
                    }

                    <strong>
                        ₹${price.toFixed(2)}
                    </strong>

                </div>


                <div class="cart-quantity">

                    <button
                        type="button"
                        class="quantity-minus"
                        data-index="${index}"
                    >
                        −
                    </button>

                    <span>
                        ${quantity}
                    </span>

                    <button
                        type="button"
                        class="quantity-plus"
                        data-index="${index}"
                    >
                        +
                    </button>

                </div>


                <div class="cart-item-total">

                    ₹${itemTotal.toFixed(2)}

                </div>


                <button
                    type="button"
                    class="remove-cart-item"
                    data-index="${index}"
                >
                    Remove
                </button>

            `;


            cartContainer.appendChild(
                cartItem
            );

        });


        attachCartEvents();

        updateTotals();
    }


    function attachCartEvents() {

        document
            .querySelectorAll(".quantity-minus")
            .forEach(function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const index =
                            Number(
                                this.dataset.index
                            );

                        decreaseQuantity(index);

                    }
                );

            });


        document
            .querySelectorAll(".quantity-plus")
            .forEach(function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const index =
                            Number(
                                this.dataset.index
                            );

                        increaseQuantity(index);

                    }
                );

            });


        document
            .querySelectorAll(".remove-cart-item")
            .forEach(function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const index =
                            Number(
                                this.dataset.index
                            );

                        removeItem(index);

                    }
                );

            });
    }


    function increaseQuantity(index) {

        if (!cart[index]) {
            return;
        }

        cart[index].quantity =
            (Number(cart[index].quantity) || 1) + 1;

        saveCart();

        renderCart();

        updateCartCount();
    }


    function decreaseQuantity(index) {

        if (!cart[index]) {
            return;
        }

        const quantity =
            Number(cart[index].quantity) || 1;


        if (quantity <= 1) {

            removeItem(index);

            return;
        }


        cart[index].quantity =
            quantity - 1;

        saveCart();

        renderCart();

        updateCartCount();
    }


    function removeItem(index) {

        if (!cart[index]) {
            return;
        }


        const name =
            cart[index].name ||
            "this item";


        const confirmed =
            confirm(
                `Remove "${name}" from your cart?`
            );


        if (!confirmed) {
            return;
        }


        cart.splice(index, 1);

        saveCart();

        renderCart();

        updateCartCount();
    }


    function updateTotals() {

        let subtotal = 0;

        let itemCount = 0;


        cart.forEach(function (item) {

            const price =
                Number(item.price) || 0;

            const quantity =
                Number(item.quantity) || 1;

            subtotal +=
                price * quantity;

            itemCount +=
                quantity;

        });


        /* =========================================
           UPDATE ORDER SUMMARY ITEM COUNT
        ========================================= */

        const summaryItemCount =
            document.getElementById(
                "summaryItemCount"
            );


        if (summaryItemCount) {

            summaryItemCount.textContent =
                itemCount;

        }


        if (subtotalElement) {

            subtotalElement.textContent =
                `₹${subtotal.toFixed(2)}`;

        }


        if (totalElement) {

            totalElement.textContent =
                `₹${subtotal.toFixed(2)}`;

        }


        const checkoutButton =
            document.getElementById(
                "checkoutBtn"
            );


        if (checkoutButton) {

            checkoutButton.disabled =
                cart.length === 0;

        }
    }


    const clearCartButton =
        document.getElementById(
            "clearCartBtn"
        );


    if (clearCartButton) {

        clearCartButton.addEventListener(
            "click",
            function () {

                if (cart.length === 0) {
                    return;
                }


                const confirmed =
                    confirm(
                        "Are you sure you want to clear your cart?"
                    );


                if (!confirmed) {
                    return;
                }


                cart = [];

                saveCart();

                renderCart();

                updateCartCount();

            }
        );
    }


    const checkoutButton =
        document.getElementById(
            "checkoutBtn"
        );


    if (checkoutButton) {

        checkoutButton.addEventListener(
            "click",
            function () {

                if (cart.length === 0) {

                    alert(
                        "Your cart is empty."
                    );

                    return;
                }


                window.location.href =
                    "checkout.html";

            }
        );
    }


    loadCart();

    renderCart();

    updateCartCount();

});
