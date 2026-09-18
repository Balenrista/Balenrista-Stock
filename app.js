const SUPABASE_URL =
  "https://wkovagycpdrozqojhxby.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_qn4s361UDciFJN_w-nFdbg_8nJLV3Eq";

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );


// ========================================
// STATE
// ========================================

let allProducts = [];
let stockMap = {};
let currentCategory = "all";
let searchKeyword = "";


// ========================================
// ELEMENTS
// ========================================

const productGrid =
  document.getElementById("productGrid");

const productCount =
  document.getElementById("productCount");

const searchInput =
  document.getElementById("searchInput");

const categoryRow =
  document.getElementById("categoryRow");


// ========================================
// MODAL STYLE
// ========================================

const modalStyle =
  document.createElement("style");

modalStyle.textContent = `

  .stock-modal-overlay {

    position: fixed;

    inset: 0;

    z-index: 999;

    display: none;

    align-items: flex-end;

    justify-content: center;

    padding: 14px;

    background:
      rgba(0, 0, 0, 0.62);

    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);

  }


  .stock-modal-overlay.show {

    display: flex;

  }


  .stock-modal {

    width: min(100%, 560px);

    max-height: 92vh;

    overflow-y: auto;

    padding: 22px;

    color: var(--soft-dove);

    background:

      linear-gradient(
        145deg,
        rgba(82, 66, 61, 0.92),
        rgba(22, 15, 12, 0.96)
      );

    border:
      1px solid
      rgba(192, 186, 179, 0.18);

    border-radius: 30px;

    box-shadow:
      0 30px 90px rgba(0,0,0,.55),
      inset 0 1px 0
      rgba(255,255,255,.05);

    backdrop-filter: blur(25px);
    -webkit-backdrop-filter: blur(25px);

    animation:
      modalUp .25s ease;

  }


  @keyframes modalUp {

    from {
      transform: translateY(30px);
      opacity: 0;
    }

    to {
      transform: translateY(0);
      opacity: 1;
    }

  }


  .modal-top {

    display: flex;

    align-items: center;

    justify-content: space-between;

    gap: 15px;

    margin-bottom: 18px;

  }


  .modal-close {

    width: 40px;
    height: 40px;

    flex-shrink: 0;

    display: flex;

    align-items: center;
    justify-content: center;

    color: var(--soft-dove);

    background:
      rgba(192,186,179,.07);

    border:
      1px solid
      rgba(192,186,179,.14);

    border-radius: 50%;

  }


  .modal-close svg {

    width: 18px;
    height: 18px;

    stroke: currentColor;

  }


  .detail-image {

    width: 100%;

    aspect-ratio: 4 / 5;

    max-height: 420px;

    overflow: hidden;

    margin-bottom: 18px;

    background:
      rgba(22,15,12,.5);

    border-radius: 22px;

    border:
      1px solid
      rgba(192,186,179,.12);

  }


  .detail-image img {

    width: 100%;
    height: 100%;

    display: block;

    object-fit: cover;

  }


  .detail-number {

    color: var(--moon-rock);

    font-size: 10px;

    letter-spacing: .16em;

    margin-bottom: 6px;

  }


  .detail-name-en {

    color: var(--soft-dove);

    font-size: 21px;

    line-height: 1.35;

    margin-bottom: 5px;

  }


  .detail-name-th {

    color: var(--moon-rock);

    font-family:
      "Noto Sans Thai",
      sans-serif;

    font-size: 13px;

    margin-bottom: 22px;

  }


  .stock-panel {

    padding: 18px;

    margin-bottom: 16px;

    background:
      rgba(22,15,12,.38);

    border:
      1px solid
      rgba(192,186,179,.12);

    border-radius: 20px;

  }


  .stock-panel-head {

    display: flex;

    justify-content: space-between;

    align-items: center;

    margin-bottom: 12px;

  }


  .stock-label {

    color: var(--moon-rock);

    font-size: 9px;

    letter-spacing: .16em;

    text-transform: uppercase;

  }


  .stock-value {

    color: var(--soft-dove);

    font-size: 32px;

    font-weight: 700;

    line-height: 1;

    margin-bottom: 8px;

  }


  .stock-min {

    color: var(--moon-rock);

    font-size: 10px;

  }


  .stock-badge {

    display: inline-flex;

    align-items: center;

    gap: 7px;

    padding: 7px 11px;

    color: var(--soft-dove);

    background:
      rgba(192,186,179,.07);

    border:
      1px solid
      rgba(192,186,179,.12);

    border-radius: 999px;

    font-size: 9px;

  }


  .stock-badge.low {

    background:
      rgba(57,18,20,.7);

  }


  .stock-badge-dot {

    width: 6px;
    height: 6px;

    border-radius: 50%;

    background: var(--moon-rock);

  }


  .stock-actions {

    display: grid;

    grid-template-columns: 1fr 1fr;

    gap: 10px;

  }


  .stock-action {

    min-height: 58px;

    display: flex;

    align-items: center;

    justify-content: center;

    gap: 9px;

    color: var(--soft-dove);

    border-radius: 18px;

    border:
      1px solid
      rgba(192,186,179,.14);

    font-size: 11px;

    transition:
      transform .2s ease,
      background .2s ease;

  }


  .stock-action:hover {

    transform: translateY(-2px);

  }


  .stock-action.in {

    background:
      rgba(82,66,61,.6);

  }


  .stock-action.out {

    background:
      rgba(57,18,20,.65);

  }


  .stock-action svg {

    width: 18px;
    height: 18px;

    stroke: currentColor;

  }


  .movement-form {

    display: none;

    margin-top: 16px;

    padding-top: 16px;

    border-top:
      1px solid
      rgba(192,186,179,.1);

  }


  .movement-form.show {

    display: block;

  }


  .movement-title {

    color: var(--soft-dove);

    font-size: 15px;

    margin-bottom: 14px;

  }


  .form-label {

    display: block;

    color: var(--moon-rock);

    font-size: 9px;

    letter-spacing: .1em;

    margin-bottom: 7px;

  }


  .form-input {

    width: 100%;

    height: 50px;

    padding: 0 14px;

    margin-bottom: 14px;

    color: var(--soft-dove);

    background:
      rgba(22,15,12,.55);

    border:
      1px solid
      rgba(192,186,179,.14);

    border-radius: 15px;

    outline: none;

  }


  .form-input:focus {

    border-color:
      rgba(192,186,179,.35);

  }


  .form-submit {

    width: 100%;

    height: 52px;

    color: var(--soft-dove);

    background:
      rgba(57,18,20,.9);

    border:
      1px solid
      rgba(192,186,179,.18);

    border-radius: 16px;

    font-size: 11px;

  }


  .form-message {

    min-height: 18px;

    margin-top: 10px;

    text-align: center;

    color: var(--moon-rock);

    font-size: 10px;

  }


  @media (min-width: 700px) {

    .stock-modal-overlay {

      align-items: center;

    }

  }

`;

document.head.appendChild(modalStyle);


// ========================================
// MODAL HTML
// ========================================

const modal =
  document.createElement("div");

modal.className =
  "stock-modal-overlay";

modal.innerHTML = `

  <div
    class="stock-modal"
    id="stockModal"
  >

    <div class="modal-top">

      <div class="detail-number"
        id="detailNumber">
        ITEM 00
      </div>

      <button
        class="modal-close"
        id="modalClose"
        aria-label="Close"
      >

        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.7"
          stroke-linecap="round"
        >
          <path d="M6 6l12 12"></path>
          <path d="M18 6L6 18"></path>
        </svg>

      </button>

    </div>


    <div class="detail-image">

      <img
        id="detailImage"
        src=""
        alt=""
      />

    </div>


    <div
      class="detail-name-en"
      id="detailNameEn"
    ></div>


    <div
      class="detail-name-th"
      id="detailNameTh"
    ></div>


    <div class="stock-panel">

      <div class="stock-panel-head">

        <div class="stock-label">
          Current Stock
        </div>

        <div
          class="stock-badge"
          id="stockBadge"
        >

          <span
            class="stock-badge-dot"
          ></span>

          <span id="stockBadgeText">
            NORMAL
          </span>

        </div>

      </div>


      <div
        class="stock-value"
        id="detailStock"
      >
        0
      </div>


      <div
        class="stock-min"
        id="detailMin"
      >
        Minimum Stock: 5
      </div>

    </div>


    <div class="stock-actions">

      <button
        class="stock-action in"
        id="stockInButton"
      >

        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.7"
          stroke-linecap="round"
        >
          <path d="M12 5v14"></path>
          <path d="M5 12h14"></path>
        </svg>

        Stock In

      </button>


      <button
        class="stock-action out"
        id="stockOutButton"
      >

        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.7"
          stroke-linecap="round"
        >
          <path d="M5 12h14"></path>
        </svg>

        Stock Out

      </button>

    </div>


    <div
      class="movement-form"
      id="movementForm"
    >

      <div
        class="movement-title"
        id="movementTitle"
      >
        Stock In
      </div>


      <label class="form-label">
        Quantity
      </label>

      <input
        class="form-input"
        id="movementQuantity"
        type="number"
        min="0.01"
        step="any"
        placeholder="Enter quantity"
      />


      <label class="form-label">
        Note
      </label>

      <input
        class="form-input"
        id="movementNote"
        type="text"
        maxlength="200"
        placeholder="Optional note"
      />


      <button
        class="form-submit"
        id="movementSubmit"
      >
        Confirm
      </button>


      <div
        class="form-message"
        id="formMessage"
      ></div>

    </div>

  </div>

`;

document.body.appendChild(modal);


// ========================================
// MODAL ELEMENTS
// ========================================

const modalOverlay =
  document.getElementById(
    "stockModal"
  );

const modalClose =
  document.getElementById(
    "modalClose"
  );

const detailImage =
  document.getElementById(
    "detailImage"
  );

const detailNumber =
  document.getElementById(
    "detailNumber"
  );

const detailNameEn =
  document.getElementById(
    "detailNameEn"
  );

const detailNameTh =
  document.getElementById(
    "detailNameTh"
  );

const detailStock =
  document.getElementById(
    "detailStock"
  );

const detailMin =
  document.getElementById(
    "detailMin"
  );

const stockBadge =
  document.getElementById(
    "stockBadge"
  );

const stockBadgeText =
  document.getElementById(
    "stockBadgeText"
  );

const stockInButton =
  document.getElementById(
    "stockInButton"
  );

const stockOutButton =
  document.getElementById(
    "stockOutButton"
  );

const movementForm =
  document.getElementById(
    "movementForm"
  );

const movementTitle =
  document.getElementById(
    "movementTitle"
  );

const movementQuantity =
  document.getElementById(
    "movementQuantity"
  );

const movementNote =
  document.getElementById(
    "movementNote"
  );

const movementSubmit =
  document.getElementById(
    "movementSubmit"
  );

const formMessage =
  document.getElementById(
    "formMessage"
  );


// ========================================
// CURRENT PRODUCT
// ========================================

let selectedProduct = null;
let selectedMovementType = null;


// ========================================
// LOAD PRODUCTS
// ========================================

async function loadProducts() {

  productGrid.innerHTML = `
    <div class="status">
      กำลังโหลดสินค้า...
    </div>
  `;


  const productsResult =
    await supabaseClient
      .from("products")
      .select("*")
      .eq("active", true)
      .order("item_no", {
        ascending: true
      });


  if (productsResult.error) {

    console.error(
      productsResult.error
    );

    productGrid.innerHTML = `
      <div class="status">
        โหลดข้อมูลไม่สำเร็จ
      </div>
    `;

    return;
  }


  allProducts =
    productsResult.data || [];


  // Load current stock

  const stockResult =
    await supabaseClient
      .from("current_stock")
      .select("*");


  if (stockResult.error) {

    console.error(
      "Current stock error:",
      stockResult.error
    );

    stockMap = {};

  } else {

    stockMap = {};

    (stockResult.data || [])
      .forEach(stock => {

        stockMap[stock.id] =
          stock;

      });

  }


  buildCategories();

  renderProducts(
    allProducts
  );
}


// ========================================
// CATEGORY
// ========================================

function buildCategories() {

  const categories = [
    ...new Set(
      allProducts
        .map(product => product.category)
        .filter(Boolean)
        .map(category =>
          category.trim()
        )
    )
  ];


  categoryRow.innerHTML = `

    <button
      class="category-chip active"
      data-category="all"
    >
      All Products
    </button>

  `;


  categories.forEach(
    category => {

      const button =
        document.createElement(
          "button"
        );

      button.className =
        "category-chip";

      button.dataset.category =
        category;

      button.textContent =
        category;

      categoryRow.appendChild(
        button
      );

    }
  );


  categoryRow
    .querySelectorAll(
      ".category-chip"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          categoryRow
            .querySelectorAll(
              ".category-chip"
            )
            .forEach(item => {

              item.classList
                .remove("active");

            });


          button.classList
            .add("active");


          currentCategory =
            button.dataset.category;


          applyFilters();

        }
      );

    });

}


// ========================================
// SEARCH
// ========================================

searchInput.addEventListener(
  "input",
  event => {

    searchKeyword =
      event.target.value
        .trim()
        .toLowerCase();

    applyFilters();

  }
);


// ========================================
// FILTER
// ========================================

function applyFilters() {

  let filtered =
    [...allProducts];


  if (
    currentCategory !==
    "all"
  ) {

    filtered =
      filtered.filter(
        product => {

          return (
            product.category &&
            product.category.trim() ===
            currentCategory
          );

        }
      );

  }


  if (searchKeyword) {

    filtered =
      filtered.filter(
        product => {

          const searchText = [

            product.item_no,
            product.sku,
            product.name_th,
            product.name_en,
            product.category,
            product.unit,
            product.size,
            product.pack_detail

          ]
            .filter(
              value =>
                value !== null &&
                value !== undefined
            )
            .join(" ")
            .toLowerCase();


          return searchText.includes(
            searchKeyword
          );

        }
      );

  }


  renderProducts(filtered);
}


// ========================================
// RENDER PRODUCTS
// ========================================

function renderProducts(products) {

  productCount.textContent =
    `${products.length} items`;


  if (!products.length) {

    productGrid.innerHTML = `
      <div class="status">
        ไม่พบสินค้าที่ค้นหา
      </div>
    `;

    return;
  }


  productGrid.innerHTML =
    products.map(product => {

      const itemNumber =
        String(product.item_no)
          .padStart(2, "0");


      const stock =
        stockMap[product.id];


      const currentStock =
        stock
          ? Number(stock.current_stock)
          : 0;


      const minStock =
        stock
          ? Number(stock.min_stock)
          : Number(product.min_stock || 5);


      const isLow =
        currentStock <= minStock;


      return `

        <article
          class="product-card"
          data-product-id="${product.id}"
        >

          <div class="product-image">

            <img
              src="${escapeHtml(
                product.image_url || ""
              )}"
              alt="${escapeHtml(
                product.name_en || ""
              )}"
              loading="lazy"
            />


            <div class="item-number">
              ${itemNumber}
            </div>

          </div>


          <div class="product-info">

            <div class="product-name-en">
              ${escapeHtml(
                product.name_en ||
                "Product"
              )}
            </div>


            <div class="product-name-th">
              ${escapeHtml(
                product.name_th || ""
              )}
            </div>


            <div class="product-meta">

              <div class="product-unit">
                ${escapeHtml(
                  product.unit || "—"
                )}
              </div>


              <div class="stock-status">

                <span class="stock-dot"></span>

                <span>
                  ${isLow
                    ? "Low Stock"
                    : `${formatNumber(currentStock)} Stock`
                  }
                </span>

              </div>

            </div>

          </div>

        </article>

      `;

    }).join("");


  // Card click

  productGrid
    .querySelectorAll(
      ".product-card"
    )
    .forEach(card => {

      card.addEventListener(
        "click",
        () => {

          const product =
            allProducts.find(
              item =>
                item.id ===
                card.dataset.productId
            );


          if (product) {

            openProductDetail(
              product
            );

          }

        }
      );

    });

}


// ========================================
// OPEN PRODUCT DETAIL
// ========================================

function openProductDetail(
  product
) {

  selectedProduct =
    product;


  const stock =
    stockMap[product.id];


  const currentStock =
    stock
      ? Number(stock.current_stock)
      : 0;


  const minStock =
    stock
      ? Number(stock.min_stock)
      : Number(product.min_stock || 5);


  const isLow =
    currentStock <= minStock;


  detailNumber.textContent =
    `ITEM ${String(product.item_no)
      .padStart(2, "0")}`;


  detailImage.src =
    product.image_url || "";


  detailImage.alt =
    product.name_en || "";


  detailNameEn.textContent =
    product.name_en || "";


  detailNameTh.textContent =
    product.name_th || "";


  detailStock.textContent =
    formatNumber(currentStock);


  detailMin.textContent =
    `Minimum Stock: ${formatNumber(minStock)} ${product.unit || ""}`;


  stockBadgeText.textContent =
    isLow
      ? "LOW STOCK"
      : "NORMAL";


  stockBadge.classList.toggle(
    "low",
    isLow
  );


  movementForm.classList
    .remove("show");


  movementQuantity.value = "";

  movementNote.value = "";

  formMessage.textContent = "";


  modalOverlay.classList
    .add("show");


  document.body.style.overflow =
    "hidden";

}


// ========================================
// CLOSE MODAL
// ========================================

function closeModal() {

  modalOverlay.classList
    .remove("show");

  document.body.style.overflow =
    "";

  selectedProduct = null;

  selectedMovementType = null;

}


modalClose.addEventListener(
  "click",
  closeModal
);


modalOverlay.addEventListener(
  "click",
  event => {

    if (
      event.target ===
      modalOverlay
    ) {

      closeModal();

    }

  }
);


document.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Escape" &&
      modalOverlay.classList
        .contains("show")
    ) {

      closeModal();

    }

  }
);


// ========================================
// STOCK IN
// ========================================

stockInButton.addEventListener(
  "click",
  () => {

    selectedMovementType =
      "IN";


    movementTitle.textContent =
      "Stock In";


    movementForm.classList
      .add("show");


    movementQuantity.focus();

    formMessage.textContent = "";

  }
);


// ========================================
// STOCK OUT
// ========================================

stockOutButton.addEventListener(
  "click",
  () => {

    selectedMovementType =
      "OUT";


    movementTitle.textContent =
      "Stock Out";


    movementForm.classList
      .add("show");


    movementQuantity.focus();

    formMessage.textContent = "";

  }
);


// ========================================
// SUBMIT STOCK MOVEMENT
// ========================================

movementSubmit.addEventListener(
  "click",
  async () => {

    if (
      !selectedProduct ||
      !selectedMovementType
    ) {

      return;

    }


    const quantity =
      Number(
        movementQuantity.value
      );


    const note =
      movementNote.value.trim();


    if (
      !quantity ||
      quantity <= 0
    ) {

      formMessage.textContent =
        "กรุณาระบุจำนวน";

      return;

    }


    // Check current stock

    const stock =
      stockMap[
        selectedProduct.id
      ];


    const currentStock =
      stock
        ? Number(stock.current_stock)
        : 0;


    if (
      selectedMovementType === "OUT" &&
      quantity > currentStock
    ) {

      formMessage.textContent =
        `สต็อกไม่พอ เหลือ ${formatNumber(currentStock)}`;

      return;

    }


    movementSubmit.disabled =
      true;


    movementSubmit.textContent =
      "Saving...";


    formMessage.textContent =
      "";


    const { error } =
      await supabaseClient
        .from("stock_movements")
        .insert({

          product_id:
            selectedProduct.id,

          movement_type:
            selectedMovementType,

          quantity:
            quantity,

          note:
            note || null

        });


    if (error) {

      console.error(
        "Stock movement error:",
        error
      );


      formMessage.textContent =
        "บันทึกไม่สำเร็จ";

      movementSubmit.disabled =
        false;

      movementSubmit.textContent =
        "Confirm";

      return;

    }


    formMessage.textContent =
      "บันทึกสำเร็จ";


    // Refresh stock

    await refreshStock();


    // Refresh detail

    openProductDetail(
      selectedProduct
    );


    movementSubmit.disabled =
      false;

    movementSubmit.textContent =
      "Confirm";

  }
);


// ========================================
// REFRESH STOCK
// ========================================

async function refreshStock() {

  const { data, error } =
    await supabaseClient
      .from("current_stock")
      .select("*");


  if (error) {

    console.error(
      "Stock refresh error:",
      error
    );

    return;

  }


  stockMap = {};


  (data || []).forEach(
    stock => {

      stockMap[stock.id] =
        stock;

    }
  );


  applyFilters();

}


// ========================================
// FORMAT NUMBER
// ========================================

function formatNumber(
  value
) {

  const number =
    Number(value);


  if (
    Number.isInteger(number)
  ) {

    return number.toLocaleString();

  }


  return number.toLocaleString(
    undefined,
    {
      maximumFractionDigits: 2
    }
  );

}


// ========================================
// ESCAPE HTML
// ========================================

function escapeHtml(
  value
) {

  return String(value)
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}


// ========================================
// START
// ========================================

loadProducts();
