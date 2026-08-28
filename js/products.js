document.addEventListener("DOMContentLoaded", async function () {\n\n    if (window.threadedTrinketsCatalogReady) {\n        await window.threadedTrinketsCatalogReady;\n    }

    const productsGrid =
        document.getElementById("productsGrid");

    const productCount =
        document.getElementById("productCount");

    const sortProducts =
        document.getElementById("sortProducts");

    const categoriesFilter =
        document.getElementById("categoriesFilter");

    const footerCategories =
        document.getElementById("footerCategories");

    const cartCount =
        document.getElementById("cartCount");

    const PRODUCTS_KEY =
        "threadedTrinketsProducts";

    const CATEGORIES_KEY =
        "threadedTrinketsCategories";

    const CART_KEY =
        "threadedTrinketsCart";

    let products = [];
    let categories = [];
    let selectedCategory = "";


    /* =========================================
       LOAD PRODUCTS
    ========================================= */

    function loadProducts() {

        try {

            products =
                JSON.parse(
                    localStorage.getItem(PRODUCTS_KEY)
                ) || [];

            if (!Array.isArray(products)) {
                products = [];
            }

        } catch (error) {

            console.error(
                "Error loading products:",
                error
            );

            products = [];
        }
    }


    /* =========================================
       LOAD CATEGORIES
    ========================================= */

    function loadCategories() {

        try {

            categories =
                JSON.parse(
                    localStorage.getItem(CATEGORIES_KEY)
                ) || [];

            if (!Array.isArray(categories)) {
                categories = [];
            }

        } catch (error) {

            console.error(
                "Error loading categories:",
                error
            );

            categories = [];
        }
    }


    /* =========================================
       ESCAPE HTML
    ========================================= */

    function escapeHTML(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    /* =========================================
       DISPLAY CATEGORY FILTER
    ========================================= */

    function displayCategories() {

        if (!categoriesFilter) {
            return;
        }

        categoriesFilter.innerHTML = "";


        const allButton =
            document.createElement("button");

        allButton.type = "button";

        allButton.className =
            "filter-btn active";

        allButton.textContent = "All";


        allButton.addEventListener(
            "click",
            function () {

                selectedCategory = "";

                setActiveFilter(this);

                renderProducts();

            }
        );


        categoriesFilter.appendChild(
            allButton
        );


        categories.forEach(
            function (category) {

                if (!category || !category.name) {
                    return;
                }


                const button =
                    document.createElement("button");

                button.type = "button";

                button.className =
                    "filter-btn";

                button.textContent =
                    category.name;


                button.addEventListener(
                    "click",
                    function () {

                        selectedCategory =
                            category.name;

                        setActiveFilter(this);

                        renderProducts();

                    }
                );


                categoriesFilter.appendChild(
                    button
                );

            }
        );
    }


    /* =========================================
       ACTIVE FILTER
    ========================================= */

    function setActiveFilter(activeButton) {

        if (!categoriesFilter) {
            return;
        }

        categoriesFilter
            .querySelectorAll(".filter-btn")
            .forEach(
                function (button) {

                    button.classList.remove(
                        "active"
                    );

                }
            );


        activeButton.classList.add(
            "active"
        );
    }


    /* =========================================
       FOOTER CATEGORIES
       ONLY UPDATES CATEGORY LINKS
       INSIDE THE EXISTING FOOTER
    ========================================= */

    function displayFooterCategories() {

        if (!footerCategories) {
            return;
        }

        footerCategories.innerHTML = "";


        categories.forEach(
            function (category) {

                if (!category || !category.name) {
                    return;
                }


                const link =
                    document.createElement("a");

                link.href =
                    "products.html";


                link.textContent =
                    category.name;


                link.addEventListener(
                    "click",
                    function () {

                        sessionStorage.setItem(
                            "threadedTrinketsSelectedCategory",
                            category.name
                        );

                    }
                );


                footerCategories.appendChild(
                    link
                );

            }
        );
    }


    /* =========================================
       GET PRODUCTS
    ========================================= */

    function getProducts() {

        let list = [...products];


        if (selectedCategory) {

            list =
                list.filter(
                    function (product) {

                        return String(
                            product.category || ""
                        ).toLowerCase() ===
                        String(
                            selectedCategory
                        ).toLowerCase();

                    }
                );
        }


        return list;
    }


    /* =========================================
       SORT PRODUCTS
    ========================================= */

    function sortProductsList(list) {

        const result = [...list];


        if (!sortProducts) {
            return result;
        }


        const value =
            sortProducts.value;


        if (value === "low-high") {

            result.sort(
                function (a, b) {

                    return (
                        Number(a.price || 0) -
                        Number(b.price || 0)
                    );

                }
            );
        }


        else if (value === "high-low") {

            result.sort(
                function (a, b) {

                    return (
                        Number(b.price || 0) -
                        Number(a.price || 0)
                    );

                }
            );
        }


        else if (value === "name") {

            result.sort(
                function (a, b) {

                    return String(
                        a.name || ""
                    ).localeCompare(
                        String(b.name || "")
                    );

                }
            );
        }


        return result;
    }


    /* =========================================
       DISPLAY PRODUCTS
    ========================================= */

    function displayProducts(list) {

        if (!productsGrid) {
            return;
        }


        productsGrid.innerHTML = "";


        if (productCount) {

            productCount.textContent =
                list.length;
        }


        if (!list.length) {

            productsGrid.innerHTML = `

                <div class="no-products">

                    <h3>
                        No Products Found
                    </h3>

                    <p>
                        There are no products
                        available in this category.
                    </p>

                </div>

            `;

            return;
        }


        list.forEach(
            function (product) {

                const card =
                    document.createElement("div");

                card.className =
                    "product-card";


                if (
                    Number(product.stock) <= 0 &&
                    product.stock !== undefined
                ) {

                    card.classList.add(
                        "out-of-stock"
                    );
                }


                const image =
                    product.image ||
                    "images/threaded-trinkets-logo.png.webp";


                const outOfStock =
                    product.stock !== undefined &&
                    Number(product.stock) <= 0;


                card.innerHTML = `

                    <div class="product-image">

                        <img
                            src="${escapeHTML(image)}"
                            alt="${escapeHTML(
                                product.name ||
                                "Product"
                            )}"
                            onerror="
                                this.src='images/threaded-trinkets-logo.png.webp'
                            "
                        >

                        ${
                            product.badge
                                ? `
                                    <span class="product-badge">
                                        ${escapeHTML(
                                            product.badge
                                        )}
                                    </span>
                                  `
                                : ""
                        }

                    </div>


                    <div class="product-info">

                        <p class="product-category">

                            ${escapeHTML(
                                product.category || ""
                            )}

                        </p>


                        <h3 class="product-name">

                            ${escapeHTML(
                                product.name ||
                                "Unnamed Product"
                            )}

                        </h3>


                        ${
                            product.description
                                ? `
                                    <p class="product-description">

                                        ${escapeHTML(
                                            product.description
                                        )}

                                    </p>
                                  `
                                : ""
                        }


                        <div class="product-bottom">

                            <strong class="product-price">

                                ₹${Number(
                                    product.price || 0
                                ).toFixed(2)}

                            </strong>


                            ${
                                outOfStock
                                    ? `
                                        <button
                                            type="button"
                                            class="add-cart-btn out-stock-btn"
                                            disabled
                                        >
                                            Out of Stock
                                        </button>
                                      `
                                    : `
                                        <button
                                            type="button"
                                            class="add-cart-btn"
                                            data-id="${escapeHTML(
                                                product.id
                                            )}"
                                        >
                                            Add to Cart
                                        </button>
                                      `
                            }

                        </div>

                    </div>

                `;


                productsGrid.appendChild(
                    card
                );

            }
        );


        productsGrid
            .querySelectorAll(".add-cart-btn")
            .forEach(
                function (button) {

                    button.addEventListener(
                        "click",
                        function () {

                            if (
                                this.disabled
                            ) {
                                return;
                            }


                            addToCart(
                                this.dataset.id
                            );

                        }
                    );

                }
            );
    }


    /* =========================================
       RENDER
    ========================================= */

    function renderProducts() {

        let list =
            getProducts();


        list =
            sortProductsList(list);


        displayProducts(list);
    }


    /* =========================================
       ADD TO CART
    ========================================= */

    function addToCart(id) {

        const product =
            products.find(
                function (item) {

                    return String(item.id) ===
                        String(id);

                }
            );


        if (!product) {
            return;
        }


        let cart = [];


        try {

            cart =
                JSON.parse(
                    localStorage.getItem(
                        CART_KEY
                    )
                ) || [];


            if (!Array.isArray(cart)) {
                cart = [];
            }

        } catch (error) {

            cart = [];
        }


        const existing =
            cart.find(
                function (item) {

                    return String(item.id) ===
                        String(id);

                }
            );


        if (existing) {

            existing.quantity =
                (Number(existing.quantity) || 1) + 1;

        } else {

            cart.push({

                id: product.id,

                name: product.name,

                price:
                    Number(product.price) || 0,

                image:
                    product.image || "",

                quantity: 1

            });
        }


        localStorage.setItem(
            CART_KEY,
            JSON.stringify(cart)
        );


        updateCartCount();


        alert(
            product.name +
            " added to cart!"
        );
    }


    /* =========================================
       CART COUNT
    ========================================= */

    function updateCartCount() {

        if (!cartCount) {
            return;
        }


        let cart = [];


        try {

            cart =
                JSON.parse(
                    localStorage.getItem(
                        CART_KEY
                    )
                ) || [];


            if (!Array.isArray(cart)) {
                cart = [];
            }

        } catch (error) {

            cart = [];
        }


        let total = 0;


        cart.forEach(
            function (item) {

                total +=
                    Number(item.quantity) || 1;

            }
        );


        cartCount.textContent =
            total;
    }


    /* =========================================
       SORT
    ========================================= */

    if (sortProducts) {

        sortProducts.addEventListener(
            "change",
            function () {

                renderProducts();

            }
        );
    }


    /* =========================================
       MOBILE MENU
    ========================================= */

    const menuBtn =
        document.getElementById("menuBtn");

    const navigation =
        document.querySelector(".navigation");


    if (menuBtn && navigation) {

        menuBtn.addEventListener(
            "click",
            function () {

                navigation.classList.toggle(
                    "active"
                );

            }
        );
    }


    /* =========================================
       RESTORE CATEGORY
    ========================================= */

    const savedCategory =
        sessionStorage.getItem(
            "threadedTrinketsSelectedCategory"
        );


    if (savedCategory) {

        selectedCategory =
            savedCategory;


        sessionStorage.removeItem(
            "threadedTrinketsSelectedCategory"
        );
    }


    /* =========================================
       START
    ========================================= */

    loadProducts();

    loadCategories();

    displayCategories();

    displayFooterCategories();

    renderProducts();

    updateCartCount();

});