/* =========================================
   THREADED TRINKETS
   HOMEPAGE CATEGORY DISPLAY
   DO NOT CHANGE EXISTING DESIGN
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    const categoryCarousel =
        document.getElementById("categoryCarousel");

    const categoryEmpty =
        document.getElementById("categoryEmpty");


    if (!categoryCarousel) {
        return;
    }


    let categories = [];


    /* =========================================
       LOAD ADMIN CATEGORIES
    ========================================= */

    try {

        const saved =
            localStorage.getItem(
                "threadedTrinketsCategories"
            );


        if (saved) {

            const data =
                JSON.parse(saved);


            if (Array.isArray(data)) {

                categories = data;

            }

        }

    } catch (error) {

        console.error(
            "Unable to load categories:",
            error
        );

    }


    /* =========================================
       NO CATEGORIES
    ========================================= */

    if (categories.length === 0) {

        categoryCarousel.innerHTML = "";

        if (categoryEmpty) {

            categoryEmpty.style.display =
                "none";

        }

        return;
    }


    if (categoryEmpty) {

        categoryEmpty.style.display =
            "none";

    }


    /* =========================================
       DISPLAY CATEGORIES
       KEEP EXISTING CARD DESIGN
    ========================================= */

    categoryCarousel.innerHTML = "";


    categories.forEach(function (category) {

        if (!category.name) {
            return;
        }


        const categoryCard =
            document.createElement("a");


        categoryCard.href =
            "products.html?category=" +
            encodeURIComponent(
                category.name
            );


        /*
           IMPORTANT:
           Keep the original category-card
           class so your existing home.css
           controls the size and design.
        */

        categoryCard.className =
            "category-card";


        /* =========================================
           IMAGE / ICON
        ========================================= */

        let visual = "";


        if (
            category.image &&
            category.image.trim() !== ""
        ) {

            visual = `

                <img
                    src="${category.image}"
                    alt="${category.name}"
                >

            `;

        } else {

            visual = `

                <span>
                    ${category.icon || "📂"}
                </span>

            `;

        }


        /* =========================================
           CATEGORY CONTENT
        ========================================= */

        categoryCard.innerHTML = `

            <div class="category-image">

                ${visual}

            </div>


            <h3>
                ${category.name}
            </h3>

        `;


        categoryCarousel.appendChild(
            categoryCard
        );

    });


    /* =========================================
       FOOTER CATEGORIES
       ADDED ONLY FOR FOOTER
       DOES NOT CHANGE HOME CATEGORIES
    ========================================= */

    const footerCategories =
        document.getElementById(
            "footerCategories"
        );


    if (footerCategories) {

        footerCategories.innerHTML = "";


        categories.forEach(function (category) {

            if (!category.name) {
                return;
            }


            const footerLink =
                document.createElement("a");


            footerLink.href =
                "products.html?category=" +
                encodeURIComponent(
                    category.name
                );


            footerLink.textContent =
                category.icon
                    ? category.icon + " " + category.name
                    : category.name;


            footerCategories.appendChild(
                footerLink
            );

        });

    }

});