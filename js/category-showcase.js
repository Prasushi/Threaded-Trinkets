document.addEventListener("DOMContentLoaded", function () {
    const descriptions = {
        bangles: ["✦ FESTIVE ✦", "Traditional • Festive • Elegant"],
        bracelets: ["♥ HANDMADE ♥", "Handmade • Chic • Colorful"],
        daisy: ["✿ FLOWER EDIT ✿", "Floral • Fresh • Feminine"],
        "kundan rubberbands": ["✦ KUNDAN ✦", "Premium • Traditional • Glamorous"]
    };

    function decorateCards() {
        document.querySelectorAll("#categoryCarousel .category-card").forEach(function (card) {
            const nameEl = card.querySelector(".category-name");
            const imageEl = card.querySelector(".category-image");
            if (!nameEl || !imageEl || card.dataset.styled === "true") return;

            const key = nameEl.textContent.trim().toLowerCase();
            const info = descriptions[key] || ["✦ HANDCRAFTED ✦", "Beautiful • Unique • Made With Love"];

            const badge = document.createElement("span");
            badge.className = "category-badge";
            badge.textContent = info[0];
            imageEl.appendChild(badge);

            const description = document.createElement("span");
            description.className = "category-description";
            description.textContent = info[1];

            const button = document.createElement("span");
            button.className = "category-shop";
            button.textContent = "Shop Collection →";

            nameEl.appendChild(description);
            nameEl.appendChild(button);
            card.dataset.styled = "true";
        });
    }

    decorateCards();
    const carousel = document.getElementById("categoryCarousel");
    if (carousel) {
        const observer = new MutationObserver(decorateCards);
        observer.observe(carousel, { childList: true });
    }
});
