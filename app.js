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

let selectedProduct = null;
let selectedMovementType = null;


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


const stockAlertSection =
  document.getElementById(
    "stockAlertSection"
  );

const stockAlertList =
  document.getElementById(
    "stockAlertList"
  );

const stockAlertCount =
  document.getElementById(
    "stockAlertCount"
  );


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
        rgba(82,66,61,.92),
        rgba(22,15,12,.96)
      );

    border:
      1px solid
      rgba(192,186,179,.18);

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

    background:
      var(--moon-rock);

  }


  .stock-actions {

    display: grid;

    grid-template-columns:
      1fr 1fr;

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

document.head.appendChild(
  modalStyle
);


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

      <div
        class="detail-number"
        id="detailNumber"
      >
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
  document.querySelector(
    ".stock-modal-overlay"
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
// FLOATING STOCK ALERT
// ========================================

const alertStyle =
  document.createElement("style");

alertStyle.textContent = `

  .floating-stock-alert {

    position: fixed;

    right: 18px;

    bottom: 92px;

    z-index: 900;

    display: none;

    align-items: center;

    gap: 8px;

    height: 42px;

    padding: 0 14px;

    color:
      var(--soft-dove);

    background:
      rgba(57,18,20,.94);

    border:
      1px solid
      rgba(192,186,179,.2);

    border-radius: 999px;

    box-shadow:
      0 12px 35px
      rgba(0,0,0,.35);

    backdrop-filter:
      blur(16px);

    -webkit-backdrop-filter:
      blur(16px);

    font-size: 9px;

    letter-spacing: .05em;

  }


  .floating-stock-alert.show {

    display: flex;

  }


  .floating-stock-alert svg {

    width: 17px;
    height: 17px;

    stroke:
      currentColor;

  }


  .floating-stock-alert-count {

    min-width: 19px;
    height: 19px;

    display: flex;

    align-items: center;
    justify-content: center;

    padding: 0 5px;

    color:
      var(--soft-dove);

    background:
      rgba(192,186,179,.16);

    border-radius: 999px;

    font-size: 8px;

  }


  .alert-panel-overlay {

    position: fixed;

    inset: 0;

    z-index: 998;

    display: none;

    align-items: flex-end;

    justify-content: center;

    padding: 14px;

    background:
      rgba(0,0,0,.62);

    backdrop-filter:
      blur(12px);

    -webkit-backdrop-filter:
      blur(12px);

  }


  .alert-panel-overlay.show {

    display: flex;

  }


  .alert-panel {

    width: min(100%, 560px);

    max-height: 78vh;

    overflow-y: auto;

    padding: 20px;

    background:
      linear-gradient(
        145deg,
        rgba(82,66,61,.96),
        rgba(22,15,12,.98)
      );

    border:
      1px solid
      rgba(192,186,179,.18);

    border-radius: 28px;

    box-shadow:
      0 30px 80px
      rgba(0,0,0,.55);

    animation:
      alertUp .22s ease;

  }


  @keyframes alertUp {

    from {

      transform:
        translateY(30px);

      opacity: 0;

    }

    to {

      transform:
        translateY(0);

      opacity: 1;

    }

  }


  .alert-panel-header {

    display: flex;

    align-items: center;

    justify-content: space-between;

    margin-bottom: 16px;

  }


  .alert-panel-title {

    color:
      var(--soft-dove);

    font-size: 16px;

    font-weight: 700;

  }


  .alert-panel-count {

    color:
      var(--moon-rock);

    font-size: 9px;

  }


  .alert-panel-list {

    display: flex;

    flex-direction: column;

    gap: 9px;

  }


  .alert-panel-item {

    width: 100%;

    display: flex;

    align-items: center;

    justify-content: space-between;

    gap: 12px;

    padding: 13px;

    color:
      var(--soft-dove);

    background:
      rgba(22,15,12,.38);

    border:
      1px solid
      rgba(192,186,179,.11);

    border-radius: 17px;

    text-align: left;

  }


  .alert-panel-item-main {

    min-width: 0;

    display: flex;

    align-items: center;

    gap: 10px;

  }


  .alert-panel-number {

    width: 34px;
    height: 34px;

    flex-shrink: 0;

    display: flex;

    align-items: center;
    justify-content: center;

    background:
      rgba(57,18,20,.65);

    border-radius: 10px;

    font-size: 9px;

  }


  .alert-panel-info {

    min-width: 0;

  }


  .alert-panel-name {

    overflow: hidden;

    color:
      var(--soft-dove);

    font-size: 10px;

    white-space: nowrap;

    text-overflow: ellipsis;

  }


  .alert-panel-th {

    margin-top: 3px;

    overflow: hidden;

    color:
      var(--moon-rock);

    font-family:
      "Noto Sans Thai",
      sans-serif;

    font-size: 8px;

    white-space: nowrap;

    text-overflow: ellipsis;

  }


  .alert-panel-stock {

    flex-shrink: 0;

    text-align: right;

  }


  .alert-panel-current {

    color:
      #C77A7A;

    font-size: 15px;

    font-weight: 700;

  }


  .alert-panel-min {

    margin-top: 2px;

    color:
      var(--moon-rock);

    font-size: 8px;

  }


  @media (min-width: 700px) {

    .alert-panel-overlay {

      align-items: center;

    }

  }

`;

document.head.appendChild(
  alertStyle
);


const floatingAlert =
  document.createElement("button");

floatingAlert.className =
  "floating-stock-alert";

floatingAlert.innerHTML = `

  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.7"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"></path>
    <path d="M10 21h4"></path>
  </svg>

  <span>
    Stock Alert
  </span>

  <span
    class="floating-stock-alert-count"
    id="floatingAlertCount"
  >
    0
  </span>

`;

document.body.appendChild(
  floatingAlert
);


const alertPanelOverlay =
  document.createElement("div");

alertPanelOverlay.className =
  "alert-panel-overlay";

alertPanelOverlay.innerHTML = `

  <div class="alert-panel">

    <div
      class="alert-panel-header"
    >

      <div
        class="alert-panel-title"
      >
        Stock Alert
      </div>

      <div
        class="alert-panel-count"
        id="alertPanelCount"
      >
        0 items
      </div>

    </div>


    <div
      class="alert-panel-list"
      id="alertPanelList"
    ></div>

  </div>

`;

document.body.appendChild(
  alertPanelOverlay
);


const floatingAlertCount =
  document.getElementById(
    "floatingAlertCount"
  );

const alertPanelCount =
  document.getElementById(
    "alertPanelCount"
  );

const alertPanelList =
  document.getElementById(
    "alertPanelList"
  );


// ========================================
// FLOATING ALERT EVENTS
// ========================================

floatingAlert.addEventListener(
  "click",
  () => {

    alertPanelOverlay.classList.add(
      "show"
    );

    document.body.style.overflow =
      "hidden";

  }
);


alertPanelOverlay.addEventListener(
  "click",
  event => {

    if (
      event.target ===
      alertPanelOverlay
    ) {

      alertPanelOverlay.classList.remove(
        "show"
      );

      document.body.style.overflow =
        "";

    }

  }
);


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
      "Products error:",
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

  renderStockAlerts();

  renderProducts(
    allProducts
  );

}


// ========================================
// STOCK ALERT
// ========================================

function renderStockAlerts() {

  if (
    !stockAlertSection ||
    !stockAlertList ||
    !stockAlertCount
  ) {

    console.warn(
      "Stock Alert elements not found."
    );

  }


  const alertItems =
    allProducts
      .map(product => {

        const stock =
          stockMap[product.id];


        const currentStock =
          stock
            ? Number(
                stock.current_stock
              )
            : 0;


        const minStock =
          stock
            ? Number(
                stock.min_stock
              )
            : Number(
                product.min_stock || 5
              );


        return {

          ...product,

          current_stock:
            currentStock,

          min_stock:
            minStock

        };

      })
      .filter(item => {

        return (
          item.current_stock <=
          item.min_stock
        );

      })
      .sort((a, b) => {

        if (
          a.current_stock !==
          b.current_stock
        ) {

          return (
            a.current_stock -
            b.current_stock
          );

        }

        return (
          a.item_no -
          b.item_no
        );

      });


  // ======================================
  // FLOATING BUTTON
  // ======================================

  if (
    alertItems.length
  ) {

    floatingAlert.classList.add(
      "show"
    );

    floatingAlertCount.textContent =
      alertItems.length;

  } else {

    floatingAlert.classList.remove(
      "show"
    );

  }


  // ======================================
  // ALERT PANEL
  // ======================================

  alertPanelCount.textContent =
    `${alertItems.length} items`;


  alertPanelList.innerHTML =
    alertItems
      .map(item => {

        const itemNumber =
          String(item.item_no)
            .padStart(2, "0");


        return `

          <button
            class="alert-panel-item"
            data-product-id="${escapeHtml(
              item.id
            )}"
          >

            <div
              class="alert-panel-item-main"
            >

              <div
                class="alert-panel-number"
              >
                ${itemNumber}
              </div>


              <div
                class="alert-panel-info"
              >

                <div
                  class="alert-panel-name"
                >
                  ${escapeHtml(
                    item.name_en || ""
                  )}
                </div>


                <div
                  class="alert-panel-th"
                >
                  ${escapeHtml(
                    item.name_th || ""
                  )}
                </div>

              </div>

            </div>


            <div
              class="alert-panel-stock"
            >

              <div
                class="alert-panel-current"
              >
                ${formatNumber(
                  item.current_stock
                )}
              </div>


              <div
                class="alert-panel-min"
              >
                MIN ${
                  formatNumber(
                    item.min_stock
                  )
                }
              </div>

            </div>

          </button>

        `;

      })
      .join("");


  alertPanelList
    .querySelectorAll(
      ".alert-panel-item"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const product =
            allProducts.find(
              item =>
                item.id ===
                button.dataset
                  .productId
            );


          if (product) {

            alertPanelOverlay.classList.remove(
              "show"
            );

            document.body.style.overflow =
              "";

            openProductDetail(
              product
            );

          }

        }
      );

    });

}


// ========================================
// CATEGORY
// ========================================

function buildCategories() {

  const categories = [
    ...new Set(
      allProducts
        .map(product =>
          product.category
        )
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


  renderProducts(
    filtered
  );

}


// ========================================
// RENDER PRODUCTS
// ========================================

function renderProducts(
  products
) {

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
    products
      .map(product => {

        const itemNumber =
          String(product.item_no)
            .padStart(2, "0");


        const stock =
          stockMap[product.id];


        const currentStock =
          stock
            ? Number(
                stock.current_stock
              )
            : 0;


        const minStock =
          stock
            ? Number(
                stock.min_stock
              )
            : Number(
                product.min_stock ||
                5
              );


        const isLow =
          currentStock <=
          minStock;


        return `

          <article
            class="product-card"
            data-product-id="${escapeHtml(
              product.id
            )}"
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
                    product.unit ||
                    "—"
                  )}
                </div>


                <div class="stock-status">

                  <span
                    class="stock-dot"
                  ></span>


                  <span>
                    ${
                      isLow
                        ? "Low Stock"
                        : `${formatNumber(
                            currentStock
                          )} Stock`
                    }
                  </span>

                </div>

              </div>

            </div>

          </article>

        `;

      })
      .join("");


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
                card.dataset
                  .productId
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
      ? Number(
          stock.current_stock
        )
      : 0;


  const minStock =
    stock
      ? Number(
          stock.min_stock
        )
      : Number(
          product.min_stock ||
          5
        );


  const isLow =
    currentStock <=
    minStock;


  detailNumber.textContent =
    `ITEM ${String(
      product.item_no
    ).padStart(2, "0")}`;


  detailImage.src =
    product.image_url || "";


  detailImage.alt =
    product.name_en || "";


  detailNameEn.textContent =
    product.name_en || "";


  detailNameTh.textContent =
    product.name_th || "";


  detailStock.textContent =
    formatNumber(
      currentStock
    );


  detailMin.textContent =
    `Minimum Stock: ${
      formatNumber(minStock)
    } ${
      product.unit || ""
    }`;


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


  movementQuantity.value =
    "";


  movementNote.value =
    "";


  formMessage.textContent =
    "";


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


  selectedProduct =
    null;


  selectedMovementType =
    null;

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


    formMessage.textContent =
      "";

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


    formMessage.textContent =
      "";

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


    const stock =
      stockMap[
        selectedProduct.id
      ];


    const currentStock =
      stock
        ? Number(
            stock.current_stock
          )
        : 0;


    if (
      selectedMovementType ===
        "OUT" &&
      quantity >
        currentStock
    ) {

      formMessage.textContent =
        `สต็อกไม่พอ เหลือ ${
          formatNumber(
            currentStock
          )
        }`;

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


    await refreshStock();


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


  (data || [])
    .forEach(stock => {

      stockMap[stock.id] =
        stock;

    });


  renderStockAlerts();

  applyFilters();


  if (
    typeof renderStockPage ===
    "function"
  ) {

    renderStockPage();

  }


  if (
    typeof loadDashboard ===
      "function" &&
    dashboardPage &&
    dashboardPage.style.display !==
      "none"
  ) {

    await loadDashboard();

  }

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

  return String(
    value ?? ""
  )
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
// STOCK PAGE
// ========================================

const stockPage =
  document.createElement("section");

stockPage.id =
  "stockPage";

stockPage.style.display =
  "none";

stockPage.innerHTML = `

  <div class="section-header">

    <div class="section-title">
      Stock
    </div>

    <div
      class="section-count"
      id="stockPageCount"
    >
      31 items
    </div>

  </div>


  <div class="stock-summary">

    <div class="stock-summary-card">

      <span>
        Total Items
      </span>

      <strong id="stockTotalItems">
        0
      </strong>

    </div>


    <div class="stock-summary-card low">

      <span>
        Low Stock
      </span>

      <strong id="stockLowItems">
        0
      </strong>

    </div>


    <div class="stock-summary-card normal">

      <span>
        Normal
      </span>

      <strong id="stockNormalItems">
        0
      </strong>

    </div>

  </div>


  <div class="stock-page-list">

    <div class="stock-page-list-header">

      <div class="section-title">
        Inventory
      </div>

    </div>

    <div
      id="stockPageList"
      class="stock-page-list-items"
    ></div>

  </div>

`;

document
  .querySelector(".app")
  .appendChild(stockPage);


// ========================================
// STOCK PAGE STYLE
// ========================================

const stockPageStyle =
  document.createElement("style");

stockPageStyle.textContent = `

  .stock-summary {

    display: grid;

    grid-template-columns:
      repeat(3, minmax(0, 1fr));

    gap: 10px;

    margin-bottom: 28px;

  }


  .stock-summary-card {

    padding: 16px 12px;

    background:
      rgba(82,66,61,.28);

    border:
      1px solid
      rgba(192,186,179,.14);

    border-radius: 18px;

    text-align: center;

    box-shadow:
      0 12px 30px
      rgba(0,0,0,.16);

  }


  .stock-summary-card span {

    display: block;

    color:
      var(--moon-rock);

    font-size: 8px;

    letter-spacing: .08em;

    margin-bottom: 8px;

  }


  .stock-summary-card strong {

    display: block;

    color:
      var(--soft-dove);

    font-size: 23px;

  }


  .stock-summary-card.low strong {

    color: #C77A7A;

  }


  .stock-summary-card.normal strong {

    color: #9FA99D;

  }


  .stock-page-list {

    margin-top: 8px;

  }


  .stock-page-list-header {

    margin-bottom: 12px;

  }


  .stock-page-list-items {

    display: flex;

    flex-direction: column;

    gap: 10px;

  }


  .stock-page-item {

    width: 100%;

    display: flex;

    align-items: center;

    justify-content: space-between;

    gap: 12px;

    padding: 14px;

    color:
      var(--soft-dove);

    background:
      rgba(82,66,61,.24);

    border:
      1px solid
      rgba(192,186,179,.13);

    border-radius: 18px;

    text-align: left;

  }


  .stock-page-item-main {

    min-width: 0;

    display: flex;

    align-items: center;

    gap: 12px;

  }


  .stock-page-item-number {

    width: 38px;
    height: 38px;

    flex-shrink: 0;

    display: flex;

    align-items: center;
    justify-content: center;

    color:
      var(--soft-dove);

    background:
      rgba(22,15,12,.45);

    border:
      1px solid
      rgba(192,186,179,.1);

    border-radius: 12px;

    font-size: 10px;

  }


  .stock-page-item-info {

    min-width: 0;

  }


  .stock-page-item-name {

    overflow: hidden;

    color:
      var(--soft-dove);

    font-size: 11px;

    white-space: nowrap;

    text-overflow: ellipsis;

  }


  .stock-page-item-th {

    margin-top: 3px;

    overflow: hidden;

    color:
      var(--moon-rock);

    font-family:
      "Noto Sans Thai",
      sans-serif;

    font-size: 9px;

    white-space: nowrap;

    text-overflow: ellipsis;

  }


  .stock-page-item-value {

    flex-shrink: 0;

    text-align: right;

  }


  .stock-page-current {

    color:
      var(--soft-dove);

    font-size: 16px;

    font-weight: 700;

  }


  .stock-page-current.low {

    color:
      #C77A7A;

  }


  .stock-page-min {

    margin-top: 2px;

    color:
      var(--moon-rock);

    font-size: 8px;

  }


  @media (max-width: 390px) {

    .stock-summary {

      gap: 7px;

    }


    .stock-summary-card {

      padding: 14px 8px;

    }


    .stock-summary-card strong {

      font-size: 20px;

    }

  }

`;

document.head.appendChild(
  stockPageStyle
);


// ========================================
// STOCK PAGE RENDER
// ========================================

function renderStockPage() {

  const totalItems =
    allProducts.length;


  let lowItems = 0;
  let normalItems = 0;


  allProducts.forEach(
    product => {

      const stock =
        stockMap[product.id];


      const currentStock =
        stock
          ? Number(
              stock.current_stock
            )
          : 0;


      const minStock =
        stock
          ? Number(
              stock.min_stock
            )
          : Number(
              product.min_stock || 5
            );


      if (
        currentStock <=
        minStock
      ) {

        lowItems++;

      } else {

        normalItems++;

      }

    }
  );


  document
    .getElementById(
      "stockTotalItems"
    )
    .textContent =
    totalItems;


  document
    .getElementById(
      "stockLowItems"
    )
    .textContent =
    lowItems;


  document
    .getElementById(
      "stockNormalItems"
    )
    .textContent =
    normalItems;


  document
    .getElementById(
      "stockPageCount"
    )
    .textContent =
    `${totalItems} items`;


  const list =
    document.getElementById(
      "stockPageList"
    );


  list.innerHTML =
    allProducts
      .map(product => {

        const stock =
          stockMap[product.id];


        const currentStock =
          stock
            ? Number(
                stock.current_stock
              )
            : 0;


        const minStock =
          stock
            ? Number(
                stock.min_stock
              )
            : Number(
                product.min_stock || 5
              );


        const isLow =
          currentStock <=
          minStock;


        return `

          <button
            class="stock-page-item"
            data-product-id="${escapeHtml(
              product.id
            )}"
          >

            <div
              class="stock-page-item-main"
            >

              <div
                class="stock-page-item-number"
              >
                ${String(
                  product.item_no
                ).padStart(2, "0")}
              </div>


              <div
                class="stock-page-item-info"
              >

                <div
                  class="stock-page-item-name"
                >
                  ${escapeHtml(
                    product.name_en || ""
                  )}
                </div>


                <div
                  class="stock-page-item-th"
                >
                  ${escapeHtml(
                    product.name_th || ""
                  )}
                </div>

              </div>

            </div>


            <div
              class="stock-page-item-value"
            >

              <div
                class="
                  stock-page-current
                  ${isLow ? "low" : ""}
                "
              >
                ${formatNumber(
                  currentStock
                )}
              </div>


              <div
                class="stock-page-min"
              >
                MIN ${
                  formatNumber(
                    minStock
                  )
                }
              </div>

            </div>

          </button>

        `;

      })
      .join("");


  list
    .querySelectorAll(
      ".stock-page-item"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const product =
            allProducts.find(
              item =>
                item.id ===
                button.dataset
                  .productId
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
// PAGE NAVIGATION ELEMENTS
// ========================================

const navHome =
  document.getElementById(
    "navHome"
  );

const navStock =
  document.getElementById(
    "navStock"
  );

const navCatalog =
  document.getElementById(
    "navCatalog"
  );

const navDashboard =
  document.getElementById(
    "navDashboard"
  );


const homeElements = [

  document.querySelector(".hero"),

  document.querySelector(".search-area"),

  document
    .getElementById("categoryRow")
    ?.closest("section"),

  productGrid

];


// ========================================
// NAV HELPERS
// ========================================

function setActiveNav(
  activeButton
) {

  document
    .querySelectorAll(
      ".nav-item"
    )
    .forEach(button => {

      button.classList.remove(
        "active"
      );

    });


  if (activeButton) {

    activeButton.classList.add(
      "active"
    );

  }

}


// ========================================
// HOME
// ========================================

function showHomePage() {

  homeElements.forEach(
    element => {

      if (element) {

        element.style.display =
          "";

      }

    }
  );


  stockPage.style.display =
    "none";


  dashboardPage.style.display =
    "none";


  setActiveNav(
    navHome
  );


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


// ========================================
// STOCK PAGE
// ========================================

function showStockPage() {

  homeElements.forEach(
    element => {

      if (element) {

        element.style.display =
          "none";

      }

    }
  );


  dashboardPage.style.display =
    "none";


  stockPage.style.display =
    "block";


  renderStockPage();


  setActiveNav(
    navStock
  );


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


navHome.addEventListener(
  "click",
  showHomePage
);


navStock.addEventListener(
  "click",
  showStockPage
);


// ========================================
// DASHBOARD PAGE
// ========================================

const dashboardPage =
  document.createElement("section");

dashboardPage.id =
  "dashboardPage";

dashboardPage.style.display =
  "none";

dashboardPage.innerHTML = `

  <div class="section-header">

    <div class="section-title">
      Dashboard
    </div>

    <div
      class="section-count"
      id="dashboardDate"
    >
      Today
    </div>

  </div>


  <div class="dashboard-grid">

    <div class="dashboard-card">

      <div class="dashboard-card-label">
        Total Items
      </div>

      <div
        class="dashboard-card-value"
        id="dashboardTotalItems"
      >
        0
      </div>

      <div class="dashboard-card-sub">
        Products
      </div>

    </div>


    <div class="dashboard-card low">

      <div class="dashboard-card-label">
        Low Stock
      </div>

      <div
        class="dashboard-card-value"
        id="dashboardLowStock"
      >
        0
      </div>

      <div class="dashboard-card-sub">
        Need attention
      </div>

    </div>


    <div class="dashboard-card normal">

      <div class="dashboard-card-label">
        Normal Stock
      </div>

      <div
        class="dashboard-card-value"
        id="dashboardNormalStock"
      >
        0
      </div>

      <div class="dashboard-card-sub">
        In safe level
      </div>

    </div>


    <div class="dashboard-card">

      <div class="dashboard-card-label">
        Total Stock
      </div>

      <div
        class="dashboard-card-value"
        id="dashboardTotalStock"
      >
        0
      </div>

      <div class="dashboard-card-sub">
        Current units
      </div>

    </div>


    <div class="dashboard-card">

      <div class="dashboard-card-label">
        Stock In Today
      </div>

      <div
        class="dashboard-card-value"
        id="dashboardStockInToday"
      >
        0
      </div>

      <div class="dashboard-card-sub">
        Received today
      </div>

    </div>


    <div class="dashboard-card">

      <div class="dashboard-card-label">
        Stock Out Today
      </div>

      <div
        class="dashboard-card-value"
        id="dashboardStockOutToday"
      >
        0
      </div>

      <div class="dashboard-card-sub">
        Used today
      </div>

    </div>

  </div>


  <div class="dashboard-section">

    <div class="section-header">

      <div class="section-title">
        Recent Stock Movements
      </div>

      <div
        class="section-count"
        id="movementCount"
      >
        Latest 10
      </div>

    </div>


    <div
      class="movement-list"
      id="movementList"
    >

      <div class="dashboard-loading">
        Loading...
      </div>

    </div>

  </div>


  <div class="dashboard-section">

    <div class="section-header">

      <div class="section-title">
        Inventory Overview
      </div>

    </div>


    <div
      class="dashboard-overview"
      id="dashboardOverview"
    >

      <div class="dashboard-loading">
        Loading...
      </div>

    </div>

  </div>

`;

document
  .querySelector(".app")
  .appendChild(
    dashboardPage
  );


// ========================================
// DASHBOARD STYLE
// ========================================

const dashboardStyle =
  document.createElement("style");

dashboardStyle.textContent = `

  .dashboard-grid {

    display: grid;

    grid-template-columns:
      repeat(2, minmax(0, 1fr));

    gap: 10px;

    margin-bottom: 28px;

  }


  .dashboard-card {

    min-height: 135px;

    padding: 18px;

    background:
      rgba(82,66,61,.28);

    border:
      1px solid
      rgba(192,186,179,.14);

    border-radius: 22px;

    box-shadow:
      0 12px 30px
      rgba(0,0,0,.16);

  }


  .dashboard-card.low {

    background:
      rgba(57,18,20,.32);

  }


  .dashboard-card.normal {

    background:
      rgba(82,66,61,.28);

  }


  .dashboard-card-label {

    color:
      var(--moon-rock);

    font-size: 8px;

    letter-spacing: .08em;

    text-transform: uppercase;

    margin-bottom: 14px;

  }


  .dashboard-card-value {

    color:
      var(--soft-dove);

    font-size: 30px;

    font-weight: 700;

    line-height: 1;

  }


  .dashboard-card.low
  .dashboard-card-value {

    color: #C77A7A;

  }


  .dashboard-card.normal
  .dashboard-card-value {

    color: #9FA99D;

  }


  .dashboard-card-sub {

    margin-top: 10px;

    color:
      var(--moon-rock);

    font-size: 8px;

  }


  .dashboard-section {

    margin-top: 28px;

  }


  .movement-list {

    display: flex;

    flex-direction: column;

    gap: 9px;

  }


  .movement-item {

    display: flex;

    align-items: center;

    justify-content: space-between;

    gap: 12px;

    padding: 14px;

    background:
      rgba(82,66,61,.24);

    border:
      1px solid
      rgba(192,186,179,.13);

    border-radius: 18px;

  }


  .movement-main {

    min-width: 0;

    display: flex;

    align-items: center;

    gap: 11px;

  }


  .movement-type {

    width: 34px;
    height: 34px;

    flex-shrink: 0;

    display: flex;

    align-items: center;
    justify-content: center;

    border-radius: 11px;

    font-size: 9px;

    font-weight: 700;

  }


  .movement-type.in {

    color: #9FA99D;

    background:
      rgba(159,169,157,.1);

  }


  .movement-type.out {

    color: #C77A7A;

    background:
      rgba(199,122,122,.1);

  }


  .movement-info {

    min-width: 0;

  }


  .movement-name {

    overflow: hidden;

    color:
      var(--soft-dove);

    font-size: 10px;

    white-space: nowrap;

    text-overflow: ellipsis;

  }


  .movement-meta {

    margin-top: 3px;

    color:
      var(--moon-rock);

    font-size: 8px;

  }


  .movement-right {

    flex-shrink: 0;

    text-align: right;

  }


  .movement-quantity {

    font-size: 14px;

    font-weight: 700;

  }


  .movement-quantity.in {

    color: #9FA99D;

  }


  .movement-quantity.out {

    color: #C77A7A;

  }


  .movement-time {

    margin-top: 3px;

    color:
      var(--moon-rock);

    font-size: 7px;

  }


  .movement-empty {

    padding: 30px;

    color:
      var(--moon-rock);

    text-align: center;

    font-size: 10px;

    background:
      rgba(82,66,61,.18);

    border-radius: 18px;

  }


  .dashboard-overview {

    display: flex;

    flex-direction: column;

    gap: 10px;

  }


  .dashboard-overview-item {

    display: flex;

    align-items: center;

    justify-content: space-between;

    gap: 12px;

    padding: 15px;

    background:
      rgba(82,66,61,.24);

    border:
      1px solid
      rgba(192,186,179,.13);

    border-radius: 18px;

  }


  .dashboard-overview-main {

    min-width: 0;

    display: flex;

    align-items: center;

    gap: 12px;

  }


  .dashboard-overview-number {

    width: 36px;
    height: 36px;

    flex-shrink: 0;

    display: flex;

    align-items: center;
    justify-content: center;

    color:
      var(--soft-dove);

    background:
      rgba(22,15,12,.45);

    border:
      1px solid
      rgba(192,186,179,.1);

    border-radius: 11px;

    font-size: 9px;

  }


  .dashboard-overview-info {

    min-width: 0;

  }


  .dashboard-overview-name {

    overflow: hidden;

    color:
      var(--soft-dove);

    font-size: 10px;

    white-space: nowrap;

    text-overflow: ellipsis;

  }


  .dashboard-overview-th {

    margin-top: 3px;

    overflow: hidden;

    color:
      var(--moon-rock);

    font-family:
      "Noto Sans Thai",
      sans-serif;

    font-size: 8px;

    white-space: nowrap;

    text-overflow: ellipsis;

  }


  .dashboard-overview-stock {

    flex-shrink: 0;

    text-align: right;

  }


  .dashboard-overview-current {

    color:
      var(--soft-dove);

    font-size: 15px;

    font-weight: 700;

  }


  .dashboard-overview-current.low {

    color:
      #C77A7A;

  }


  .dashboard-overview-min {

    margin-top: 2px;

    color:
      var(--moon-rock);

    font-size: 8px;

  }


  .dashboard-loading {

    padding: 30px;

    color:
      var(--moon-rock);

    text-align: center;

    font-size: 10px;

  }


  @media (min-width: 700px) {

    .dashboard-grid {

      grid-template-columns:
        repeat(3, minmax(0, 1fr));

    }

  }


  @media (max-width: 390px) {

    .dashboard-card {

      min-height: 125px;

      padding: 15px;

    }


    .dashboard-card-value {

      font-size: 26px;

    }

  }

`;

document.head.appendChild(
  dashboardStyle
);


// ========================================
// DASHBOARD ELEMENTS
// ========================================

const dashboardDate =
  document.getElementById(
    "dashboardDate"
  );

const dashboardTotalItems =
  document.getElementById(
    "dashboardTotalItems"
  );

const dashboardLowStock =
  document.getElementById(
    "dashboardLowStock"
  );

const dashboardNormalStock =
  document.getElementById(
    "dashboardNormalStock"
  );

const dashboardTotalStock =
  document.getElementById(
    "dashboardTotalStock"
  );

const dashboardStockInToday =
  document.getElementById(
    "dashboardStockInToday"
  );

const dashboardStockOutToday =
  document.getElementById(
    "dashboardStockOutToday"
  );

const dashboardOverview =
  document.getElementById(
    "dashboardOverview"
  );

const movementList =
  document.getElementById(
    "movementList"
  );

const movementCount =
  document.getElementById(
    "movementCount"
  );


// ========================================
// LOAD RECENT MOVEMENTS
// ========================================

async function loadRecentMovements() {

  movementList.innerHTML = `
    <div class="dashboard-loading">
      Loading...
    </div>
  `;


  const result =
    await supabaseClient
      .from("stock_movements")
      .select(`
        id,
        movement_type,
        quantity,
        note,
        created_at,
        product_id,
        products (
          item_no,
          name_en,
          name_th,
          unit
        )
      `)
      .order(
        "created_at",
        {
          ascending: false
        }
      )
      .limit(10);


  if (result.error) {

    console.error(
      "Recent movements error:",
      result.error
    );


    movementList.innerHTML = `
      <div class="movement-empty">
        โหลดประวัติไม่สำเร็จ
      </div>
    `;

    return;

  }


  const movements =
    result.data || [];


  movementCount.textContent =
    `Latest ${movements.length}`;


  if (!movements.length) {

    movementList.innerHTML = `
      <div class="movement-empty">
        ยังไม่มีประวัติ Stock Movement
      </div>
    `;

    return;

  }


  movementList.innerHTML =
    movements
      .map(movement => {

        const product =
          movement.products;


        const isIn =
          movement.movement_type ===
          "IN";


        const typeClass =
          isIn
            ? "in"
            : "out";


        const typeText =
          isIn
            ? "IN"
            : "OUT";


        const sign =
          isIn
            ? "+"
            : "-";


        const quantity =
          formatNumber(
            Number(
              movement.quantity
            ) || 0
          );


        const date =
          new Date(
            movement.created_at
          );


        const timeText =
          date.toLocaleString(
            "en-GB",
            {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit"
            }
          );


        const note =
          movement.note
            ? ` · ${escapeHtml(
                movement.note
              )}`
            : "";


        return `

          <div
            class="movement-item"
          >

            <div
              class="movement-main"
            >

              <div
                class="
                  movement-type
                  ${typeClass}
                "
              >
                ${typeText}
              </div>


              <div
                class="movement-info"
              >

                <div
                  class="movement-name"
                >
                  ${escapeHtml(
                    product?.name_en ||
                    "Unknown Product"
                  )}
                </div>


                <div
                  class="movement-meta"
                >
                  ITEM ${
                    String(
                      product?.item_no ??
                      ""
                    ).padStart(2,"0")
                  }${note}
                </div>

              </div>

            </div>


            <div
              class="movement-right"
            >

              <div
                class="
                  movement-quantity
                  ${typeClass}
                "
              >
                ${sign}${quantity}
              </div>


              <div
                class="movement-time"
              >
                ${timeText}
              </div>

            </div>

          </div>

        `;

      })
      .join("");

}


// ========================================
// LOAD DASHBOARD
// ========================================

async function loadDashboard() {

  dashboardTotalItems.textContent =
    allProducts.length;


  let lowItems = 0;
  let normalItems = 0;
  let totalStock = 0;


  allProducts.forEach(
    product => {

      const stock =
        stockMap[product.id];


      const currentStock =
        stock
          ? Number(
              stock.current_stock
            )
          : 0;


      const minStock =
        stock
          ? Number(
              stock.min_stock
            )
          : Number(
              product.min_stock || 5
            );


      totalStock +=
        currentStock;


      if (
        currentStock <=
        minStock
      ) {

        lowItems++;

      } else {

        normalItems++;

      }

    }
  );


  dashboardLowStock.textContent =
    lowItems;


  dashboardNormalStock.textContent =
    normalItems;


  dashboardTotalStock.textContent =
    formatNumber(
      totalStock
    );


  // ======================================
  // TODAY
  // ======================================

  const today =
    new Date();


  const startOfDay =
    new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );


  const startISO =
    startOfDay.toISOString();


  const endISO =
    new Date(
      startOfDay.getTime() +
      24 * 60 * 60 * 1000
    ).toISOString();


  const movementResult =
    await supabaseClient
      .from("stock_movements")
      .select(
        "movement_type, quantity, created_at"
      )
      .gte(
        "created_at",
        startISO
      )
      .lt(
        "created_at",
        endISO
      );


  if (
    movementResult.error
  ) {

    console.error(
      "Dashboard movement error:",
      movementResult.error
    );


    dashboardStockInToday.textContent =
      "—";


    dashboardStockOutToday.textContent =
      "—";

  } else {

    let stockInToday = 0;
    let stockOutToday = 0;


    (
      movementResult.data ||
      []
    ).forEach(
      movement => {

        const quantity =
          Number(
            movement.quantity
          ) || 0;


        if (
          movement.movement_type ===
          "IN"
        ) {

          stockInToday +=
            quantity;

        }


        if (
          movement.movement_type ===
          "OUT"
        ) {

          stockOutToday +=
            quantity;

        }

      }
    );


    dashboardStockInToday.textContent =
      formatNumber(
        stockInToday
      );


    dashboardStockOutToday.textContent =
      formatNumber(
        stockOutToday
      );

  }


  // ======================================
  // DATE
  // ======================================

  dashboardDate.textContent =
    today.toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );


  // ======================================
  // RECENT MOVEMENTS
  // ======================================

  await loadRecentMovements();


  // ======================================
  // INVENTORY OVERVIEW
  // ======================================

  dashboardOverview.innerHTML =
    allProducts
      .map(product => {

        const stock =
          stockMap[product.id];


        const currentStock =
          stock
            ? Number(
                stock.current_stock
              )
            : 0;


        const minStock =
          stock
            ? Number(
                stock.min_stock
              )
            : Number(
                product.min_stock || 5
              );


        const isLow =
          currentStock <=
          minStock;


        return `

          <div
            class="dashboard-overview-item"
          >

            <div
              class="dashboard-overview-main"
            >

              <div
                class="dashboard-overview-number"
              >
                ${String(
                  product.item_no
                ).padStart(2,"0")}
              </div>


              <div
                class="dashboard-overview-info"
              >

                <div
                  class="dashboard-overview-name"
                >
                  ${escapeHtml(
                    product.name_en || ""
                  )}
                </div>


                <div
                  class="dashboard-overview-th"
                >
                  ${escapeHtml(
                    product.name_th || ""
                  )}
                </div>

              </div>

            </div>


            <div
              class="dashboard-overview-stock"
            >

              <div
                class="
                  dashboard-overview-current
                  ${isLow ? "low" : ""}
                "
              >
                ${formatNumber(
                  currentStock
                )}
              </div>


              <div
                class="dashboard-overview-min"
              >
                MIN ${
                  formatNumber(
                    minStock
                  )
                }
              </div>

            </div>

          </div>

        `;

      })
      .join("");

}


// ========================================
// DASHBOARD NAVIGATION
// ========================================

function showDashboardPage() {

  homeElements.forEach(
    element => {

      if (element) {

        element.style.display =
          "none";

      }

    }
  );


  stockPage.style.display =
    "none";


  dashboardPage.style.display =
    "block";


  loadDashboard();


  setActiveNav(
    navDashboard
  );


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


navDashboard.onclick =
  showDashboardPage;


// ========================================
// CATALOG
// ========================================

navCatalog.addEventListener(
  "click",
  () => {

    showHomePage();

    alert(
      "Catalog จะเปิดใช้งานในขั้นถัดไป"
    );

  }
);


// ========================================
// REFRESH DASHBOARD
// ========================================

async function refreshDashboard() {

  await refreshStock();


  if (
    dashboardPage.style.display !==
    "none"
  ) {

    await loadDashboard();

  }

}


// ========================================
// START
// ========================================

loadProducts();
