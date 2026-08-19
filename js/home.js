/* =========================================================
   THREADED TRINKETS
   HOMEPAGE JAVASCRIPT
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       MOBILE MENU
    ===================================================== */

    const menuBtn = document.getElementById("menuBtn");
    const navigation = document.querySelector(".navigation");

    if (menuBtn && navigation) {

        menuBtn.addEventListener("click", function () {

            navigation.classList.toggle("active");

            const isOpen =
                navigation.classList.contains("active");

            menuBtn.setAttribute(
                "aria-expanded",
                isOpen ? "true" : "false"
            );

        });


        navigation.querySelectorAll("a").forEach(function (link) {

            link.addEventListener("click", function () {

                navigation.classList.remove("active");

                menuBtn.setAttribute(
                    "aria-expanded",
                    "false"
                );

            });

        });

    }


    /* =====================================================
       CART COUNT
    ===================================================== */
/* =====================================================
   CART COUNT
===================================================== */

function updateCartCount() {

    const cartCount =
        document.getElementById("cartCount");

    if (!cartCount) {
        return;
    }

    let cart = [];

    try {

        const storedCart =
            localStorage.getItem("threadedTrinketsCart");

        if (storedCart) {

            const parsedCart =
                JSON.parse(storedCart);

            if (Array.isArray(parsedCart)) {
                cart = parsedCart;
            }

        }

    } catch (error) {

        console.warn(
            "Unable to read cart:",
            error
        );

    }

    let totalItems = 0;

    cart.forEach(function (item) {

        if (!item) {
            return;
        }

        const quantity =
            Number(item.quantity);

        if (
            Number.isFinite(quantity) &&
            quantity > 0
        ) {

            totalItems += quantity;

        } else {

            totalItems += 1;

        }

    });

    cartCount.textContent =
        totalItems;
}


updateCartCount();


window.addEventListener(
    "storage",
    updateCartCount
);

    /* =====================================================
       CATEGORY DATA
    ===================================================== */

    const categoryCarousel =
        document.getElementById(
            "categoryCarousel"
        );

    const categoryEmpty =
        document.getElementById(
            "categoryEmpty"
        );

    const categoryPrev =
        document.getElementById(
            "categoryPrev"
        );

    const categoryNext =
        document.getElementById(
            "categoryNext"
        );

    const footerCategories =
        document.getElementById(
            "footerCategories"
        );


    if (
        !categoryCarousel ||
        !categoryEmpty
    ) {
        return;
    }


    /* =====================================================
       READ CATEGORIES FROM LOCAL STORAGE
    ===================================================== */

    function getCategories() {

        const possibleKeys = [

            "categories",

            "threadedTrinketsCategories",

            "tt_categories",

            "storeCategories"

        ];


        for (
            let i = 0;
            i < possibleKeys.length;
            i++
        ) {

            const key =
                possibleKeys[i];

            try {

                const value =
                    localStorage.getItem(key);

                if (!value) {
                    continue;
                }


                const parsed =
                    JSON.parse(value);


                if (
                    Array.isArray(parsed)
                ) {

                    return parsed;

                }

            } catch (error) {

                console.warn(
                    "Could not read category key:",
                    key
                );

            }

        }


        return [];

    }


    /* =====================================================
       CATEGORY NAME
    ===================================================== */

    function getCategoryName(category) {

        if (
            typeof category === "string"
        ) {

            return category;

        }


        if (!category) {
            return "Category";
        }


        return (
            category.name ||
            category.categoryName ||
            category.title ||
            category.category ||
            "Category"
        );

    }


    /* =====================================================
       CATEGORY IMAGE
    ===================================================== */

    function getCategoryImage(category) {

        if (
            typeof category === "string" ||
            !category
        ) {

            return "";

        }


        return (
            category.image ||
            category.imageUrl ||
            category.categoryImage ||
            category.photo ||
            category.photoUrl ||
            ""
        );

    }


    /* =====================================================
       CATEGORY ID
    ===================================================== */

    function getCategoryId(category, index) {

        if (
            category &&
            typeof category === "object"
        ) {

            return (
                category.id ||
                category.categoryId ||
                category.slug ||
                getCategoryName(category)
                    .toLowerCase()
                    .replace(
                        /[^a-z0-9]+/g,
                        "-"
                    )
            );

        }


        return String(index);

    }


    /* =====================================================
       CREATE CATEGORY CARD
    ===================================================== */

    function createCategoryCard(
        category,
        index
    ) {

        const name =
            getCategoryName(category);

        const image =
            getCategoryImage(category);

        const id =
            getCategoryId(
                category,
                index
            );


        const card =
            document.createElement("a");


        card.className =
            "category-card";


        card.href =
            "products.html?category=" +
            encodeURIComponent(id);


        card.setAttribute(
            "aria-label",
            "Shop " + name
        );


        const imageBox =
            document.createElement("div");


        imageBox.className =
            "category-image";


        if (image) {

            const img =
                document.createElement("img");


            img.src = image;

            img.alt = name;

            img.loading = "lazy";


            img.onerror =
                function () {

                    imageBox.innerHTML =
                        '<div class="category-image-placeholder">💎</div>';

                };


            imageBox.appendChild(img);

        } else {

            imageBox.innerHTML =
                '<div class="category-image-placeholder">💎</div>';

        }


        const nameBox =
            document.createElement("div");


        nameBox.className =
            "category-name";


        nameBox.textContent =
            name;


        card.appendChild(imageBox);

        card.appendChild(nameBox);


        return card;

    }


    /* =====================================================
       RENDER FOOTER CATEGORIES
    ===================================================== */

    function renderFooterCategories(
        categories
    ) {

        if (!footerCategories) {
            return;
        }


        footerCategories.innerHTML =
            "";


        if (
            !Array.isArray(categories) ||
            categories.length === 0
        ) {

            return;

        }


        categories.forEach(
            function (category, index) {

                const name =
                    getCategoryName(category);

                const id =
                    getCategoryId(
                        category,
                        index
                    );


                const link =
                    document.createElement("a");


                link.href =
                    "products.html?category=" +
                    encodeURIComponent(id);


                link.textContent =
                    name;


                footerCategories.appendChild(
                    link
                );

            }
        );

    }


    /* =====================================================
       CATEGORY CAROUSEL STATE
    ===================================================== */

    let categories = [];

    let currentPage = 0;


    function getItemsPerPage() {

        const width =
            window.innerWidth;


        if (width <= 600) {
            return 1;
        }


        if (width <= 800) {
            return 2;
        }


        if (width <= 1000) {
            return 3;
        }


        return 4;

    }


    function getPageCount() {

        const itemsPerPage =
            getItemsPerPage();


        if (
            categories.length === 0
        ) {
            return 0;
        }


        return Math.ceil(
            categories.length /
            itemsPerPage
        );

    }


    /* =====================================================
       RENDER CATEGORIES
    ===================================================== */

    function renderCategories() {

        categoryCarousel.innerHTML =
            "";


        if (
            !Array.isArray(categories) ||
            categories.length === 0
        ) {

            categoryCarousel.style.display =
                "none";


            categoryEmpty.style.display =
                "block";


            if (categoryPrev) {
                categoryPrev.style.display =
                    "none";
            }


            if (categoryNext) {
                categoryNext.style.display =
                    "none";
            }


            return;

        }


        categoryEmpty.style.display =
            "none";


        categoryCarousel.style.display =
            "grid";


        const itemsPerPage =
            getItemsPerPage();


        const pageCount =
            getPageCount();


        if (
            currentPage >= pageCount
        ) {

            currentPage =
                Math.max(
                    0,
                    pageCount - 1
                );

        }


        const start =
            currentPage *
            itemsPerPage;


        const end =
            Math.min(
                start + itemsPerPage,
                categories.length
            );


        for (
            let i = start;
            i < end;
            i++
        ) {

            categoryCarousel.appendChild(
                createCategoryCard(
                    categories[i],
                    i
                )
            );

        }


        if (categoryPrev) {

            categoryPrev.style.display =
                pageCount > 1
                    ? "flex"
                    : "none";


            categoryPrev.disabled =
                currentPage <= 0;

        }


        if (categoryNext) {

            categoryNext.style.display =
                pageCount > 1
                    ? "flex"
                    : "none";


            categoryNext.disabled =
                currentPage >=
                pageCount - 1;

        }

    }


    /* =====================================================
       PREVIOUS CATEGORY PAGE
    ===================================================== */

    if (categoryPrev) {

        categoryPrev.addEventListener(
            "click",
            function () {

                if (currentPage > 0) {

                    currentPage--;

                    renderCategories();

                }

            }
        );

    }


    /* =====================================================
       NEXT CATEGORY PAGE
    ===================================================== */

    if (categoryNext) {

        categoryNext.addEventListener(
            "click",
            function () {

                const pageCount =
                    getPageCount();


                if (
                    currentPage <
                    pageCount - 1
                ) {

                    currentPage++;

                    renderCategories();

                }

            }
        );

    }


    /* =====================================================
       INITIAL CATEGORY LOAD
    ===================================================== */

    function loadCategories() {

        categories =
            getCategories();


        currentPage = 0;


        renderCategories();


        renderFooterCategories(
            categories
        );

    }


    loadCategories();


    /* =====================================================
       UPDATE IF ADMIN CHANGES
    ===================================================== */

    window.addEventListener(
        "storage",
        function (event) {

            if (
                event.key === "categories" ||
                event.key === "threadedTrinketsCategories" ||
                event.key === "tt_categories" ||
                event.key === "storeCategories"
            ) {

                loadCategories();

            }


            if (
                event.key === "cart"
            ) {

                updateCartCount();

            }

        }
    );


    /* =====================================================
       RESIZE
    ===================================================== */

    let resizeTimer;


    window.addEventListener(
        "resize",
        function () {

            clearTimeout(
                resizeTimer
            );


            resizeTimer =
                setTimeout(
                    function () {

                        currentPage = 0;

                        renderCategories();

                    },
                    150
                );

        }
    );

});
