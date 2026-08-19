/* =========================================================
   THREADED TRINKETS
   ADMIN PANEL
   PRODUCTS + CATEGORIES + ORDERS
========================================================= */


/* =========================================================
   STORAGE KEYS
========================================================= */

const PRODUCTS_KEY =
    "threadedTrinketsProducts";

const CATEGORIES_KEY =
    "threadedTrinketsCategories";

const ORDERS_KEY =
    "threadedTrinketsOrders";


/* =========================================================
   DATA
========================================================= */

let products = [];
let categories = [];
let orders = [];

let editingProductId = null;
let editingCategoryId = null;


/* =========================================================
   FORMS
========================================================= */

const productForm =
    document.getElementById(
        "productForm"
    );

const categoryForm =
    document.getElementById(
        "categoryForm"
    );


/* =========================================================
   IMAGE STORAGE
========================================================= */

window.threadedTrinketsProductImage = "";
window.threadedTrinketsCategoryImage = "";


/* =========================================================
   LOAD DATA
========================================================= */

function loadData() {

    try {

        products =
            JSON.parse(
                localStorage.getItem(
                    PRODUCTS_KEY
                )
            ) || [];


        categories =
            JSON.parse(
                localStorage.getItem(
                    CATEGORIES_KEY
                )
            ) || [];


        orders =
            JSON.parse(
                localStorage.getItem(
                    ORDERS_KEY
                )
            ) || [];


        if (!Array.isArray(products)) {
            products = [];
        }


        if (!Array.isArray(categories)) {
            categories = [];
        }


        if (!Array.isArray(orders)) {
            orders = [];
        }

    } catch (error) {

        console.error(
            "Error loading data:",
            error
        );

        products = [];
        categories = [];
        orders = [];

    }

}


/* =========================================================
   SAVE PRODUCTS
========================================================= */

function saveProducts() {

    localStorage.setItem(
        PRODUCTS_KEY,
        JSON.stringify(products)
    );

}


/* =========================================================
   SAVE CATEGORIES
========================================================= */

function saveCategories() {

    localStorage.setItem(
        CATEGORIES_KEY,
        JSON.stringify(categories)
    );

}


/* =========================================================
   SAVE ORDERS
========================================================= */

function saveOrders() {

    localStorage.setItem(
        ORDERS_KEY,
        JSON.stringify(orders)
    );

}


/* =========================================================
   CREATE ID
========================================================= */

function createId() {

    return (
        Date.now().toString() +
        Math.random()
            .toString(36)
            .substring(2, 8)
    );

}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHTML(value) {

    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   ATTRIBUTE ESCAPE
========================================================= */

function escapeAttribute(value) {

    return String(value || "")
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'");

}


/* =========================================================
   CATEGORY DROPDOWN
========================================================= */

function updateCategoryDropdown() {

    const dropdown =
        document.getElementById(
            "productCategory"
        );

    if (!dropdown) {
        return;
    }


    const currentValue =
        dropdown.value;


    dropdown.innerHTML =
        `<option value="">Select Category</option>`;


    categories.forEach(
        function(category) {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                category.name;

            option.textContent =
                category.name;

            dropdown.appendChild(
                option
            );

        }
    );


    const other =
        document.createElement(
            "option"
        );

    other.value =
        "Other";

    other.textContent =
        "Other";


    dropdown.appendChild(
        other
    );


    dropdown.value =
        currentValue;

}


/* =========================================================
   DISPLAY PRODUCTS
========================================================= */

function displayProducts() {

    const container =
        document.getElementById(
            "adminProducts"
        );

    const count =
        document.getElementById(
            "productCount"
        );

    const empty =
        document.getElementById(
            "noProducts"
        );


    if (!container) {
        return;
    }


    if (count) {

        count.textContent =
            products.length;

    }


    if (products.length === 0) {

        container.innerHTML = "";

        if (empty) {
            empty.style.display =
                "block";
        }

        return;

    }


    if (empty) {

        empty.style.display =
            "none";

    }


    container.innerHTML = "";


    products.forEach(
        function(product) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "admin-product-card";


            const image =
                product.image &&
                String(product.image).trim()
                    ? product.image
                    : "https://placehold.co/300x300?text=Product";


            card.innerHTML = `

                <img
                    src="${escapeHTML(image)}"
                    alt="${escapeHTML(
                        product.name
                    )}"
                >


                <div class="admin-product-info">

                    <h3>
                        ${escapeHTML(
                            product.name
                        )}
                    </h3>


                    <p>
                        ${escapeHTML(
                            product.category ||
                            "Other"
                        )}
                    </p>


                    <strong>
                        ₹${Number(
                            product.price || 0
                        )}
                    </strong>


                    <span>
                        Stock:
                        ${Number(
                            product.stock || 0
                        )}
                    </span>


                    ${
                        product.description
                            ? `
                                <p>
                                    ${escapeHTML(
                                        product.description
                                    )}
                                </p>
                              `
                            : ""
                    }


                    <div class="admin-actions">

                        <button
                            type="button"
                            onclick="editProduct('${escapeAttribute(
                                product.id
                            )}')"
                        >
                            Edit
                        </button>


                        <button
                            type="button"
                            onclick="deleteProduct('${escapeAttribute(
                                product.id
                            )}')"
                        >
                            Delete
                        </button>

                    </div>

                </div>

            `;


            container.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   RESET PRODUCT FORM
========================================================= */

function resetProductForm() {

    if (!productForm) {
        return;
    }


    productForm.reset();

    editingProductId = null;

    window.threadedTrinketsProductImage =
        "";


    const title =
        document.getElementById(
            "formTitle"
        );

    const button =
        document.getElementById(
            "saveButton"
        );

    const cancel =
        document.getElementById(
            "cancelEditBtn"
        );

    const preview =
        document.getElementById(
            "productImagePreview"
        );


    if (title) {

        title.textContent =
            "Add New Product";

    }


    if (button) {

        button.textContent =
            "Add Product";

    }


    if (cancel) {

        cancel.style.display =
            "none";

    }


    if (preview) {

        preview.style.display =
            "none";

    }


    updateCategoryDropdown();

}


/* =========================================================
   EDIT PRODUCT
========================================================= */

function editProduct(id) {

    const product =
        products.find(
            function(item) {

                return String(item.id) ===
                    String(id);

            }
        );


    if (!product) {
        return;
    }


    editingProductId =
        product.id;


    const name =
        document.getElementById(
            "productName"
        );

    const category =
        document.getElementById(
            "productCategory"
        );

    const price =
        document.getElementById(
            "productPrice"
        );

    const stock =
        document.getElementById(
            "productStock"
        );

    const description =
        document.getElementById(
            "productDescription"
        );


    if (name) {
        name.value =
            product.name || "";
    }


    if (category) {
        category.value =
            product.category || "";
    }


    if (price) {
        price.value =
            product.price || "";
    }


    if (stock) {
        stock.value =
            product.stock || "";
    }


    if (description) {
        description.value =
            product.description || "";
    }


    const title =
        document.getElementById(
            "formTitle"
        );

    const button =
        document.getElementById(
            "saveButton"
        );

    const cancel =
        document.getElementById(
            "cancelEditBtn"
        );


    if (title) {
        title.textContent =
            "Edit Product";
    }


    if (button) {
        button.textContent =
            "Update Product";
    }


    if (cancel) {
        cancel.style.display =
            "inline-block";
    }


    window.threadedTrinketsProductImage =
        product.image || "";


    const preview =
        document.getElementById(
            "productPreviewImg"
        );

    const previewBox =
        document.getElementById(
            "productImagePreview"
        );


    if (
        product.image &&
        preview &&
        previewBox
    ) {

        preview.src =
            product.image;

        previewBox.style.display =
            "block";

    } else if (previewBox) {

        previewBox.style.display =
            "none";

    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================================
   DELETE PRODUCT
========================================================= */

function deleteProduct(id) {

    const product =
        products.find(
            function(item) {

                return String(item.id) ===
                    String(id);

            }
        );


    if (!product) {
        return;
    }


    const confirmed =
        confirm(
            `Delete "${product.name}"?`
        );


    if (!confirmed) {
        return;
    }


    products =
        products.filter(
            function(item) {

                return String(item.id) !==
                    String(id);

            }
        );


    saveProducts();

    displayProducts();

}


/* =========================================================
   PRODUCT FORM
========================================================= */

if (productForm) {

    productForm.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const name =
                document
                    .getElementById(
                        "productName"
                    )
                    ?.value
                    .trim() || "";


            const category =
                document
                    .getElementById(
                        "productCategory"
                    )
                    ?.value
                    .trim() || "";


            const price =
                Number(
                    document
                        .getElementById(
                            "productPrice"
                        )
                        ?.value || 0
                );


            const stock =
                Number(
                    document
                        .getElementById(
                            "productStock"
                        )
                        ?.value || 0
                );


            const description =
                document
                    .getElementById(
                        "productDescription"
                    )
                    ?.value
                    .trim() || "";


            if (!name) {

                alert(
                    "Please enter product name."
                );

                return;
            }


            if (!category) {

                alert(
                    "Please select a category."
                );

                return;
            }


            if (price < 0) {

                alert(
                    "Price cannot be negative."
                );

                return;
            }


            if (stock < 0) {

                alert(
                    "Stock cannot be negative."
                );

                return;
            }


            const image =
                window
                    .threadedTrinketsProductImage ||
                "";


            const wasEditing =
                Boolean(editingProductId);


            if (wasEditing) {

                const product =
                    products.find(
                        function(item) {

                            return String(
                                item.id
                            ) === String(
                                editingProductId
                            );

                        }
                    );


                if (product) {

                    product.name =
                        name;

                    product.category =
                        category;

                    product.price =
                        price;

                    product.stock =
                        stock;

                    product.description =
                        description;


                    if (image) {

                        product.image =
                            image;

                    }

                }

            } else {

                products.push({

                    id:
                        createId(),

                    name:
                        name,

                    category:
                        category,

                    price:
                        price,

                    stock:
                        stock,

                    image:
                        image,

                    description:
                        description

                });

            }


            saveProducts();

            displayProducts();

            resetProductForm();


            alert(
                wasEditing
                    ? "Product updated successfully."
                    : "Product added successfully."
            );

        }
    );

}


/* =========================================================
   CANCEL PRODUCT EDIT
========================================================= */

const cancelEditBtn =
    document.getElementById(
        "cancelEditBtn"
    );


if (cancelEditBtn) {

    cancelEditBtn.addEventListener(
        "click",
        function() {

            resetProductForm();

        }
    );

}


/* =========================================================
   PRODUCT IMAGE UPLOAD
========================================================= */

const productImage =
    document.getElementById(
        "productImage"
    );

const productPreview =
    document.getElementById(
        "productPreviewImg"
    );

const productPreviewBox =
    document.getElementById(
        "productImagePreview"
    );


if (productImage) {

    productImage.addEventListener(
        "change",
        function() {

            const file =
                this.files &&
                this.files[0];


            if (!file) {

                window.threadedTrinketsProductImage =
                    "";

                if (productPreviewBox) {

                    productPreviewBox.style.display =
                        "none";

                }

                return;

            }


            if (
                !file.type ||
                !file.type.startsWith("image/")
            ) {

                alert(
                    "Please select a valid image file."
                );

                this.value = "";

                return;

            }


            const reader =
                new FileReader();


            reader.onload =
                function(event) {

                    const imageData =
                        event.target.result;


                    window.threadedTrinketsProductImage =
                        imageData;


                    if (productPreview) {

                        productPreview.src =
                            imageData;

                    }


                    if (productPreviewBox) {

                        productPreviewBox.style.display =
                            "block";

                    }

                };


            reader.onerror =
                function() {

                    alert(
                        "Unable to read the selected image."
                    );

                };


            reader.readAsDataURL(file);

        }
    );

}


/* =========================================================
   DISPLAY CATEGORIES
========================================================= */

function displayCategories() {

    const container =
        document.getElementById(
            "adminCategories"
        );

    const count =
        document.getElementById(
            "categoryCount"
        );

    const empty =
        document.getElementById(
            "noCategories"
        );


    if (!container) {
        return;
    }


    if (count) {

        count.textContent =
            categories.length;

    }


    if (categories.length === 0) {

        container.innerHTML = "";

        if (empty) {
            empty.style.display =
                "block";
        }

        return;

    }


    if (empty) {

        empty.style.display =
            "none";

    }


    container.innerHTML = "";


    categories.forEach(
        function(category) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "admin-category-card";


            const image =
                category.image &&
                String(category.image).trim()
                    ? category.image
                    : "";


            card.innerHTML = `

                <div class="admin-category-image">

                    ${
                        image

                            ? `

                                <img
                                    src="${escapeHTML(
                                        image
                                    )}"
                                    alt="${escapeHTML(
                                        category.name
                                    )}"
                                >

                              `

                            : `

                                <div class="category-icon">
                                    ${escapeHTML(
                                        category.icon ||
                                        "✨"
                                    )}
                                </div>

                              `
                    }

                </div>


                <div class="admin-category-info">

                    <h3>
                        ${escapeHTML(
                            category.name
                        )}
                    </h3>


                    <div class="admin-actions">

                        <button
                            type="button"
                            onclick="editCategory('${escapeAttribute(
                                category.id
                            )}')"
                        >
                            Edit
                        </button>


                        <button
                            type="button"
                            onclick="deleteCategory('${escapeAttribute(
                                category.id
                            )}')"
                        >
                            Delete
                        </button>

                    </div>

                </div>

            `;


            container.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   RESET CATEGORY FORM
========================================================= */

function resetCategoryForm() {

    if (!categoryForm) {
        return;
    }


    categoryForm.reset();

    editingCategoryId = null;


    window.threadedTrinketsCategoryImage =
        "";


    const title =
        document.getElementById(
            "categoryFormTitle"
        );

    const button =
        document.getElementById(
            "categorySaveBtn"
        );

    const cancel =
        document.getElementById(
            "cancelCategoryBtn"
        );

    const preview =
        document.getElementById(
            "categoryImagePreview"
        );


    if (title) {
        title.textContent =
            "Add New Category";
    }


    if (button) {
        button.textContent =
            "Add Category";
    }


    if (cancel) {
        cancel.style.display =
            "none";
    }


    if (preview) {
        preview.style.display =
            "none";
    }

}


/* =========================================================
   EDIT CATEGORY
========================================================= */

function editCategory(id) {

    const category =
        categories.find(
            function(item) {

                return String(item.id) ===
                    String(id);

            }
        );


    if (!category) {
        return;
    }


    editingCategoryId =
        category.id;


    const name =
        document.getElementById(
            "categoryName"
        );

    const icon =
        document.getElementById(
            "categoryIcon"
        );


    if (name) {
        name.value =
            category.name || "";
    }


    if (icon) {
        icon.value =
            category.icon || "";
    }


    const title =
        document.getElementById(
            "categoryFormTitle"
        );

    const button =
        document.getElementById(
            "categorySaveBtn"
        );

    const cancel =
        document.getElementById(
            "cancelCategoryBtn"
        );


    if (title) {
        title.textContent =
            "Edit Category";
    }


    if (button) {
        button.textContent =
            "Update Category";
    }


    if (cancel) {
        cancel.style.display =
            "inline-block";
    }


    window.threadedTrinketsCategoryImage =
        category.image || "";


    const preview =
        document.getElementById(
            "categoryPreviewImg"
        );

    const previewBox =
        document.getElementById(
            "categoryImagePreview"
        );


    if (
        category.image &&
        preview &&
        previewBox
    ) {

        preview.src =
            category.image;

        previewBox.style.display =
            "block";

    } else if (previewBox) {

        previewBox.style.display =
            "none";

    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================================
   DELETE CATEGORY
========================================================= */

function deleteCategory(id) {

    const category =
        categories.find(
            function(item) {

                return String(item.id) ===
                    String(id);

            }
        );


    if (!category) {
        return;
    }


    const usedByProducts =
        products.some(
            function(product) {

                return product.category ===
                    category.name;

            }
        );


    let message =
        `Delete "${category.name}"?`;


    if (usedByProducts) {

        message +=
            "\n\nProducts using this category will be moved to Other.";

    }


    const confirmed =
        confirm(message);


    if (!confirmed) {
        return;
    }


    products =
        products.map(
            function(product) {

                if (
                    product.category ===
                    category.name
                ) {

                    return {
                        ...product,
                        category: "Other"
                    };

                }


                return product;

            }
        );


    categories =
        categories.filter(
            function(item) {

                return String(item.id) !==
                    String(id);

            }
        );


    saveProducts();

    saveCategories();

    displayProducts();

    displayCategories();

    updateCategoryDropdown();

}


/* =========================================================
   CATEGORY FORM
========================================================= */

if (categoryForm) {

    categoryForm.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const name =
                document
                    .getElementById(
                        "categoryName"
                    )
                    ?.value
                    .trim() || "";


            const icon =
                document
                    .getElementById(
                        "categoryIcon"
                    )
                    ?.value
                    .trim() || "";


            if (!name) {

                alert(
                    "Please enter category name."
                );

                return;
            }


            const duplicate =
                categories.some(
                    function(category) {

                        return (
                            category.name
                                .toLowerCase() ===
                            name.toLowerCase()
                        ) &&
                        String(category.id) !==
                            String(
                                editingCategoryId
                            );

                    }
                );


            if (duplicate) {

                alert(
                    "This category already exists."
                );

                return;
            }


            const image =
                window
                    .threadedTrinketsCategoryImage ||
                "";


            const wasEditing =
                Boolean(editingCategoryId);


            if (wasEditing) {

                const category =
                    categories.find(
                        function(item) {

                            return String(
                                item.id
                            ) === String(
                                editingCategoryId
                            );

                        }
                    );


                if (category) {

                    const oldName =
                        category.name;


                    category.name =
                        name;

                    category.icon =
                        icon || "✨";


                    if (image) {

                        category.image =
                            image;

                    }


                    products =
                        products.map(
                            function(product) {

                                if (
                                    product.category ===
                                    oldName
                                ) {

                                    return {
                                        ...product,
                                        category: name
                                    };

                                }


                                return product;

                            }
                        );


                    saveProducts();

                }

            } else {

                categories.push({

                    id:
                        createId(),

                    name:
                        name,

                    icon:
                        icon || "✨",

                    image:
                        image

                });

            }


            saveCategories();

            displayCategories();

            displayProducts();

            updateCategoryDropdown();

            resetCategoryForm();


            alert(
                wasEditing
                    ? "Category updated successfully."
                    : "Category added successfully."
            );

        }
    );

}


/* =========================================================
   CATEGORY IMAGE UPLOAD
========================================================= */

const categoryImage =
    document.getElementById(
        "categoryImage"
    );

const categoryPreview =
    document.getElementById(
        "categoryPreviewImg"
    );

const categoryPreviewBox =
    document.getElementById(
        "categoryImagePreview"
    );


if (categoryImage) {

    categoryImage.addEventListener(
        "change",
        function() {

            const file =
                this.files &&
                this.files[0];


            if (!file) {

                window.threadedTrinketsCategoryImage =
                    "";

                if (categoryPreviewBox) {

                    categoryPreviewBox.style.display =
                        "none";

                }

                return;

            }


            if (
                !file.type ||
                !file.type.startsWith("image/")
            ) {

                alert(
                    "Please select a valid image file."
                );

                this.value = "";

                return;

            }


            const reader =
                new FileReader();


            reader.onload =
                function(event) {

                    const imageData =
                        event.target.result;


                    window.threadedTrinketsCategoryImage =
                        imageData;


                    if (categoryPreview) {

                        categoryPreview.src =
                            imageData;

                    }


                    if (categoryPreviewBox) {

                        categoryPreviewBox.style.display =
                            "block";

                    }

                };


            reader.onerror =
                function() {

                    alert(
                        "Unable to read the selected image."
                    );

                };


            reader.readAsDataURL(file);

        }
    );

}


/* =========================================================
   CANCEL CATEGORY EDIT
========================================================= */

const cancelCategoryBtn =
    document.getElementById(
        "cancelCategoryBtn"
    );


if (cancelCategoryBtn) {

    cancelCategoryBtn.addEventListener(
        "click",
        function() {

            resetCategoryForm();

        }
    );

}


/* =========================================================
   ORDERS
========================================================= */

function getCustomerValue(
    customer,
    possibleNames
) {

    if (
        !customer ||
        typeof customer !== "object"
    ) {
        return "";
    }


    for (
        let i = 0;
        i < possibleNames.length;
        i++
    ) {

        const value =
            customer[
                possibleNames[i]
            ];


        if (
            value !== undefined &&
            value !== null &&
            String(value).trim() !== ""
        ) {

            return String(value);

        }

    }


    return "";

}


/* =========================================================
   DISPLAY ORDERS
========================================================= */

function displayOrders() {

    const container =
        document.getElementById(
            "adminOrders"
        );

    const count =
        document.getElementById(
            "orderCount"
        );

    const empty =
        document.getElementById(
            "noOrders"
        );


    if (!container) {
        return;
    }


    if (count) {

        count.textContent =
            orders.length;

    }


    if (orders.length === 0) {

        container.innerHTML = "";

        if (empty) {
            empty.style.display =
                "block";
        }

        return;

    }


    if (empty) {

        empty.style.display =
            "none";

    }


    container.innerHTML = "";


    orders.forEach(
        function(order) {

            const customer =
                order.customer || {};


            const name =
                getCustomerValue(
                    customer,
                    [
                        "name",
                        "fullName",
                        "customerName"
                    ]
                ) ||
                "Customer";


            const phone =
                getCustomerValue(
                    customer,
                    [
                        "phone",
                        "mobile",
                        "phoneNumber",
                        "contact"
                    ]
                ) ||
                "Not provided";


            const email =
                getCustomerValue(
                    customer,
                    [
                        "email",
                        "emailAddress"
                    ]
                ) ||
                "Not provided";


            const address =
                getCustomerValue(
                    customer,
                    [
                        "address",
                        "fullAddress",
                        "deliveryAddress"
                    ]
                ) ||
                "Not provided";


            const city =
                getCustomerValue(
                    customer,
                    [
                        "city"
                    ]
                );


            const state =
                getCustomerValue(
                    customer,
                    [
                        "state"
                    ]
                );


            const pincode =
                getCustomerValue(
                    customer,
                    [
                        "pincode",
                        "pinCode",
                        "postalCode",
                        "zip"
                    ]
                );


            const completeAddress =
                [
                    address,
                    city,
                    state,
                    pincode
                ]
                .filter(function(value) {
                    return value;
                })
                .join(", ");


            const date =
                order.createdAt
                    ? new Date(
                        order.createdAt
                    ).toLocaleString(
                        "en-IN"
                    )
                    : "Not available";


            let itemsHTML = "";


            if (
                Array.isArray(
                    order.items
                ) &&
                order.items.length > 0
            ) {

                itemsHTML =
                    order.items.map(
                        function(item) {

                            const quantity =
                                Number(
                                    item.quantity
                                ) || 1;


                            const price =
                                Number(
                                    item.price
                                ) || 0;


                            const itemTotal =
                                price *
                                quantity;


                            return `

                                <div
                                    style="
                                        display:flex;
                                        justify-content:space-between;
                                        gap:15px;
                                        padding:8px 0;
                                        border-bottom:1px solid #eee;
                                    "
                                >

                                    <span>
                                        ${escapeHTML(
                                            item.name ||
                                            "Product"
                                        )}
                                        ×
                                        ${quantity}
                                    </span>

                                    <strong>
                                        ₹${itemTotal.toLocaleString(
                                            "en-IN"
                                        )}
                                    </strong>

                                </div>

                            `;

                        }
                    )
                    .join("");

            } else {

                itemsHTML =
                    "<p>No product details available.</p>";

            }


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "admin-order-card";


            card.style.cssText = `
                background:#fff;
                border:1px solid #e5e5e5;
                border-radius:14px;
                padding:22px;
                margin-bottom:20px;
                box-shadow:0 5px 18px rgba(0,0,0,0.05);
            `;


            card.innerHTML = `

                <div
                    style="
                        display:flex;
                        justify-content:space-between;
                        align-items:flex-start;
                        gap:20px;
                        flex-wrap:wrap;
                        margin-bottom:20px;
                    "
                >

                    <div>

                        <p
                            style="
                                margin:0 0 5px;
                                font-size:12px;
                                letter-spacing:1px;
                                opacity:.65;
                            "
                        >
                            ORDER
                        </p>

                        <h3
                            style="
                                margin:0;
                            "
                        >
                            ${escapeHTML(
                                order.orderId ||
                                "Order"
                            )}
                        </h3>

                        <small>
                            ${escapeHTML(date)}
                        </small>

                    </div>


                    <div
                        style="
                            text-align:right;
                        "
                    >

                        <strong
                            style="
                                font-size:20px;
                            "
                        >
                            ₹${Number(
                                order.total || 0
                            ).toLocaleString(
                                "en-IN"
                            )}
                        </strong>

                        <br>

                        <span>
                            ${escapeHTML(
                                order.paymentMethod ||
                                "UPI"
                            )}
                        </span>

                    </div>

                </div>


                <div
                    style="
                        display:grid;
                        grid-template-columns:repeat(auto-fit,minmax(230px,1fr));
                        gap:18px;
                        margin-bottom:20px;
                    "
                >

                    <div>

                        <h4>
                            Customer Details
                        </h4>

                        <p>
                            <strong>Name:</strong>
                            ${escapeHTML(name)}
                        </p>

                        <p>
                            <strong>Phone:</strong>
                            ${escapeHTML(phone)}
                        </p>

                        <p>
                            <strong>Email:</strong>
                            ${escapeHTML(email)}
                        </p>

                    </div>


                    <div>

                        <h4>
                            Delivery Address
                        </h4>

                        <p>
                            ${escapeHTML(
                                completeAddress ||
                                "Not provided"
                            )}
                        </p>

                    </div>


                    <div>

                        <h4>
                            Payment
                        </h4>

                        <p>
                            <strong>Method:</strong>
                            ${escapeHTML(
                                order.paymentMethod ||
                                "UPI"
                            )}
                        </p>

                        <p>
                            <strong>Status:</strong>
                            ${escapeHTML(
                                order.paymentStatus ||
                                "Unknown"
                            )}
                        </p>

                        <p>
                            <strong>UPI ID:</strong>
                            ${escapeHTML(
                                order.upiId ||
                                "Not available"
                            )}
                        </p>

                    </div>

                </div>


                <div>

                    <h4>
                        Products Ordered
                    </h4>

                    ${itemsHTML}

                </div>


                <div
                    style="
                        display:flex;
                        justify-content:space-between;
                        align-items:center;
                        gap:15px;
                        flex-wrap:wrap;
                        margin-top:20px;
                        padding-top:15px;
                        border-top:1px solid #eee;
                    "
                >

                    <strong>
                        Total:
                        ₹${Number(
                            order.total || 0
                        ).toLocaleString(
                            "en-IN"
                        )}
                    </strong>


                    <button
                        type="button"
                        class="admin-cancel-btn"
                        onclick="deleteOrder('${escapeAttribute(
                            order.orderId
                        )}')"
                    >
                        Delete Order
                    </button>

                </div>

            `;


            container.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   DELETE ORDER
========================================================= */

function deleteOrder(orderId) {

    const order =
        orders.find(
            function(item) {

                return String(
                    item.orderId
                ) === String(orderId);

            }
        );


    if (!order) {
        return;
    }


    const confirmed =
        confirm(
            `Delete order "${order.orderId}"?`
        );


    if (!confirmed) {
        return;
    }


    orders =
        orders.filter(
            function(item) {

                return String(
                    item.orderId
                ) !== String(orderId);

            }
        );


    saveOrders();

    displayOrders();

}


/* =========================================================
   TABS
========================================================= */

const productsTab =
    document.getElementById(
        "productsTab"
    );

const categoriesTab =
    document.getElementById(
        "categoriesTab"
    );

const ordersTab =
    document.getElementById(
        "ordersTab"
    );


const productsSection =
    document.getElementById(
        "productsSection"
    );

const categoriesSection =
    document.getElementById(
        "categoriesSection"
    );

const ordersSection =
    document.getElementById(
        "ordersSection"
    );


/* =========================================================
   SHOW PRODUCTS
========================================================= */

function showProducts() {

    if (productsTab) {
        productsTab.classList.add(
            "active"
        );
    }


    if (categoriesTab) {
        categoriesTab.classList.remove(
            "active"
        );
    }


    if (ordersTab) {
        ordersTab.classList.remove(
            "active"
        );
    }


    if (productsSection) {

        productsSection.style.display =
            "grid";

    }


    if (categoriesSection) {

        categoriesSection.style.display =
            "none";

    }


    if (ordersSection) {

        ordersSection.style.display =
            "none";

    }

}


/* =========================================================
   PRODUCTS TAB
========================================================= */

if (productsTab) {

    productsTab.addEventListener(
        "click",
        showProducts
    );

}


/* =========================================================
   CATEGORIES TAB
========================================================= */

if (categoriesTab) {

    categoriesTab.addEventListener(
        "click",
        function() {

            if (productsTab) {
                productsTab.classList.remove(
                    "active"
                );
            }


            categoriesTab.classList.add(
                "active"
            );


            if (ordersTab) {
                ordersTab.classList.remove(
                    "active"
                );
            }


            if (productsSection) {
                productsSection.style.display =
                    "none";
            }


            if (categoriesSection) {
                categoriesSection.style.display =
                    "block";
            }


            if (ordersSection) {
                ordersSection.style.display =
                    "none";
            }

        }
    );

}


/* =========================================================
   ORDERS TAB
========================================================= */

if (ordersTab) {

    ordersTab.addEventListener(
        "click",
        function() {

            if (productsTab) {
                productsTab.classList.remove(
                    "active"
                );
            }


            if (categoriesTab) {
                categoriesTab.classList.remove(
                    "active"
                );
            }


            ordersTab.classList.add(
                "active"
            );


            if (productsSection) {
                productsSection.style.display =
                    "none";
            }


            if (categoriesSection) {
                categoriesSection.style.display =
                    "none";
            }


            if (ordersSection) {
                ordersSection.style.display =
                    "block";
            }


            displayOrders();

        }
    );

}


/* =========================================================
   GLOBAL FUNCTIONS
========================================================= */

window.displayProducts =
    displayProducts;

window.displayCategories =
    displayCategories;

window.displayOrders =
    displayOrders;

window.editProduct =
    editProduct;

window.deleteProduct =
    deleteProduct;

window.editCategory =
    editCategory;

window.deleteCategory =
    deleteCategory;

window.deleteOrder =
    deleteOrder;


/* =========================================================
   START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        loadData();

        updateCategoryDropdown();

        displayProducts();

        displayCategories();

        displayOrders();

    }
);
