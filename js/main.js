// =========================================
// THREADED TRINKETS
// MAIN JAVASCRIPT
// =========================================


// =========================================
// MOBILE MENU
// =========================================

const menuBtn = document.getElementById("menuBtn");
const navigation = document.querySelector(".navigation");

if (menuBtn && navigation) {

    menuBtn.addEventListener("click", () => {

        navigation.classList.toggle("active");

    });

}


// =========================================
// UPDATE CART COUNT
// =========================================

function updateMainCartCount() {

    const cartCount =
        document.getElementById("cartCount");

    if (!cartCount) {
        return;
    }


    const savedCart =
        localStorage.getItem(
            "threadedTrinketsCart"
        );


    let cart = [];

    try {

        cart =
            savedCart
                ? JSON.parse(savedCart)
                : [];

    } catch (error) {

        cart = [];

    }


    const totalQuantity =
        cart.reduce(
            (total, item) =>
                total +
                Number(item.quantity || 0),
            0
        );


    cartCount.textContent =
        totalQuantity;

}


// =========================================
// PAGE LOAD
// =========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        updateMainCartCount();

    }
);