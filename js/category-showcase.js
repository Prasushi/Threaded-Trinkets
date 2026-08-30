/* Threaded Trinkets category styling helper
   No extra Shop Collection buttons or descriptions. */

document.addEventListener("DOMContentLoaded", function () {
    function cleanCategoryCards() {
        document.querySelectorAll("#categoryCarousel .category-card").forEach(function (card) {
            card.querySelectorAll(".category-shop, .category-description").forEach(function (element) {
                element.remove();
            });
        });
    }

    cleanCategoryCards();

    const carousel = document.getElementById("categoryCarousel");
    if (carousel) {
        const observer = new MutationObserver(cleanCategoryCards);
        observer.observe(carousel, { childList: true, subtree: true });
    }
});
