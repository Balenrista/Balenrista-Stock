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

// Calendar
let calendarDate = new Date();
calendarDate.setDate(1);

let calendarMovements = [];
let selectedCalendarDate = null;


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
  background: rgba(0,0,0,.62);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.stock-modal-overlay.show {
  display: flex;
}

.stock-modal {
  width: min(100%,560px);
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
  border: 1px solid rgba(192,186,179,.18);
  border-radius: 30px;
  box-shadow:
    0 30px 90px rgba(0,0,0,.55),
    inset 0 1px 0 rgba(255,255,255,.05);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  animation: modalUp .25s ease;
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
  background: rgba(192,186,179,.07);
  border: 1px solid rgba(192,186,179,.14);
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
  background: rgba(22,15,12,.5);
  border-radius: 22px;
  border: 1px solid rgba(192,186,179,.12);
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
  font-family: "Noto Sans Thai",sans-serif;
  font-size: 13px;
  margin-bottom: 22px;
}

.stock-panel {
  padding: 18px;
  margin-bottom: 16px;
  background: rgba(22,15,12,.38);
  border: 1px solid rgba(192,186,179,.12);
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
  background: rgba(192,186,179,.07);
  border: 1px solid rgba(192,186,179,.12);
  border-radius: 999px;
  font-size: 9px;
}

.stock-badge.low {
  background: rgba(57,18,20,.7);
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
  border: 1px solid rgba(192,186,179,.14);
  font-size: 11px;
  transition:
    transform .2s ease,
    background .2s ease;
}

.stock-action:hover {
  transform: translateY(-2px);
}

.stock-action.in {
  background: rgba(82,66,61,.6);
}

.stock-action.out {
  background: rgba(57,18,20,.65);
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
  border-top: 1px solid rgba(192,186,179,.1);
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
  background: rgba(22,15,12,.55);
  border: 1px solid rgba(192,186,179,.14);
  border-radius: 15px;
  outline: none;
}

.form-input:focus {
  border-color: rgba(192,186,179,.35);
}

.form-submit {
  width: 100%;
  height: 52px;
  color: var(--soft-dove);
  background: rgba(57,18,20,.9);
  border: 1px solid rgba(192,186,179,.18);
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

@media (min-width:700px) {
  .stock-modal-overlay {
    align-items: center;
  }
}

.quantity-counter {
  display: grid;
  grid-template-columns: 58px 1fr 58px;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.quantity-button {
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--soft-dove);
  background: rgba(82,66,61,.55);
  border: 1px solid rgba(192,186,179,.16);
  border-radius: 16px;
  font-size: 25px;
  line-height: 1;
  transition: transform .15s ease;
}

.quantity-button:active {
  transform: scale(.94);
}

.quantity-value {
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--soft-dove);
  background: rgba(22,15,12,.55);
  border: 1px solid rgba(192,186,179,.14);
  border-radius: 16px;
  font-size: 22px;
  font-weight: 700;
}

.quantity-presets {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 7px;
  margin-bottom: 14px;
}

.quantity-preset {
  height: 38px;
  color: var(--soft-dove);
  background: rgba(57,18,20,.55);
  border: 1px solid rgba(192,186,179,.13);
  border-radius: 12px;
  font-size: 9px;
  transition: transform .15s ease;
}

.quantity-preset:active {
  transform: scale(.95);
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

<div class="stock-modal" id="stockModal">

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

        <span class="stock-badge-dot"></span>

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

<div class="quantity-counter">

  <button
    type="button"
    class="quantity-button"
    id="quantityMinus"
  >
    −
  </button>

  <div
    class="quantity-value"
    id="quantityValue"
  >
    1
  </div>

  <button
    type="button"
    class="quantity-button"
    id="quantityPlus"
  >
    +
  </button>

</div>

<div class="quantity-presets">

  <button
    type="button"
    class="quantity-preset"
    data-add="5"
  >
    +5
  </button>

  <button
    type="button"
    class="quantity-preset"
    data-add="10"
  >
    +10
  </button>

  <button
    type="button"
    class="quantity-preset"
    data-add="50"
  >
    +50
  </button>

  <button
    type="button"
    class="quantity-preset"
    data-add="100"
  >
    +100
  </button>

</div>

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

const quantityMinus =
  document.getElementById(
    "quantityMinus"
  );

const quantityPlus =
  document.getElementById(
    "quantityPlus"
  );

const quantityValue =
  document.getElementById(
    "quantityValue"
  );

const quantityPresets =
  document.querySelectorAll(
    ".quantity-preset"
  );

let movementQuantityValue = 1;

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
  color: var(--soft-dove);
  background: rgba(57,18,20,.94);
  border: 1px solid rgba(192,186,179,.2);
  border-radius: 999px;
  box-shadow: 0 12px 35px rgba(0,0,0,.35);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  font-size: 9px;
  letter-spacing: .05em;
}

.floating-stock-alert.show {
  display: flex;
}

.floating-stock-alert svg {
  width: 17px;
  height: 17px;
  stroke: currentColor;
}

.floating-stock-alert-count {
  min-width: 19px;
  height: 19px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
  color: var(--soft-dove);
  background: rgba(192,186,179,.16);
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
  background: rgba(0,0,0,.62);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.alert-panel-overlay.show {
  display: flex;
}

.alert-panel {
  width: min(100%,560px);
  max-height: 78vh;
  overflow-y: auto;
  padding: 20px;
  background:
    linear-gradient(
      145deg,
      rgba(82,66,61,.96),
      rgba(22,15,12,.98)
    );
  border: 1px solid rgba(192,186,179,.18);
  border-radius: 28px;
  box-shadow: 0 30px 80px rgba(0,0,0,.55);
  animation: alertUp .22s ease;
}

@keyframes alertUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
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
  color: var(--soft-dove);
  font-size: 16px;
  font-weight: 700;
}

.alert-panel-count {
  color: var(--moon-rock);
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
  color: var(--soft-dove);
  background: rgba(22,15,12,.38);
  border: 1px solid rgba(192,186,179,.11);
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
  background: rgba(57,18,20,.65);
  border-radius: 10px;
  font-size: 9px;
}

.alert-panel-info {
  min-width: 0;
}

.alert-panel-name {
  overflow: hidden;
  color: var(--soft-dove);
  font-size: 10px;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.alert-panel-th {
  margin-top: 3px;
  overflow: hidden;
  color: var(--moon-rock);
  font-family: "Noto Sans Thai",sans-serif;
  font-size: 8px;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.alert-panel-stock {
  flex-shrink: 0;
  text-align: right;
}

.alert-panel-current {
  color: #C77A7A;
  font-size: 15px;
  font-weight: 700;
}

.alert-panel-min {
  margin-top: 2px;
  color: var(--moon-rock);
  font-size: 8px;
}

@media (min-width:700px) {
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

  <div class="alert-panel-header">

    <div class="alert-panel-title">
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
      .filter(item =>
        item.current_stock <=
        item.min_stock
      )
      .sort((a,b) => {

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
  // FLOATING ALERT
  // ======================================

  if (alertItems.length) {

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
  // IMPORTANT:
  // HOME STOCK ALERT SECTION IS HIDDEN
  // ======================================

  if (stockAlertSection) {

    stockAlertSection.style.display =
      "none";

  }


  // ======================================
  // FLOATING ALERT PANEL
  // ======================================

  alertPanelCount.textContent =
    `${alertItems.length} items`;


  alertPanelList.innerHTML =
    alertItems
      .map(item => {

        const itemNumber =
          String(item.item_no)
            .padStart(2,"0");

        return `

          <button
            class="alert-panel-item"
            data-product-id="${escapeHtml(
              item.id
            )}"
          >

            <div class="alert-panel-item-main">

              <div class="alert-panel-number">
                ${itemNumber}
              </div>

              <div class="alert-panel-info">

                <div class="alert-panel-name">
                  ${escapeHtml(
                    item.name_en || ""
                  )}
                </div>

                <div class="alert-panel-th">
                  ${escapeHtml(
                    item.name_th || ""
                  )}
                </div>

              </div>

            </div>

            <div class="alert-panel-stock">

              <div class="alert-panel-current">
                ${formatNumber(
                  item.current_stock
                )}
              </div>

              <div class="alert-panel-min">
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
                button.dataset.productId
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

  if (!categoryRow) {
    return;
  }

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

              item.classList.remove(
                "active"
              );

            });

          button.classList.add(
            "active"
          );

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

if (searchInput) {

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

}


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
        product =>
          product.category &&
          product.category.trim() ===
          currentCategory
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
            .padStart(2,"0");

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

  detailNumber.textContent =
    `ITEM ${String(
      product.item_no
    ).padStart(2,"0")}`;

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

  movementForm.classList.remove(
    "show"
  );

  movementQuantityValue =
    1;

  movementNote.value =
    "";

  formMessage.textContent =
    "";

  modalOverlay.classList.add(
    "show"
  );

  document.body.style.overflow =
    "hidden";

}


// ========================================
// CLOSE MODAL
// ========================================

function closeModal() {

  modalOverlay.classList.remove(
    "show"
  );

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
      modalOverlay.classList.contains(
        "show"
      )
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

    movementQuantityValue =
      1;

    updateQuantityDisplay();

    movementForm.classList
      .add("show");

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

    movementQuantityValue =
      1;

    updateQuantityDisplay();

    movementForm.classList
      .add("show");

    formMessage.textContent =
      "";

  }
);

// ========================================
// QUANTITY COUNTER
// ========================================

function getCurrentProductStock() {

  if (!selectedProduct) {

    return 0;

  }

  const stock =
    stockMap[
      selectedProduct.id
    ];

  return stock
    ? Number(
        stock.current_stock
      ) || 0
    : 0;

}


function updateQuantityDisplay() {

  if (!quantityValue) {

    return;

  }

  if (
    selectedMovementType ===
    "OUT"
  ) {

    const currentStock =
      getCurrentProductStock();

    if (
      currentStock <= 0
    ) {

      movementQuantityValue =
        0;

    } else if (
      movementQuantityValue >
      currentStock
    ) {

      movementQuantityValue =
        currentStock;

    }

  }


  if (
    movementQuantityValue < 1 &&
    selectedMovementType === "IN"
  ) {

    movementQuantityValue =
      1;

  }


  quantityValue.textContent =
    formatNumber(
      movementQuantityValue
    );

}


// ========================================
// MINUS
// ========================================

quantityMinus.addEventListener(
  "click",
  () => {

    if (
      movementQuantityValue <=
      1
    ) {

      return;

    }

    movementQuantityValue--;

    updateQuantityDisplay();

  }
);


// ========================================
// PLUS
// ========================================

quantityPlus.addEventListener(
  "click",
  () => {

    const currentStock =
      getCurrentProductStock();


    if (
      selectedMovementType ===
      "OUT" &&
      movementQuantityValue >=
      currentStock
    ) {

      return;

    }


    movementQuantityValue++;

    updateQuantityDisplay();

  }
);


// ========================================
// QUICK ADD
// ========================================

quantityPresets.forEach(
  button => {

    button.addEventListener(
      "click",
      () => {

        const amount =
          Number(
            button.dataset.add
          ) || 0;


        if (!amount) {

          return;

        }


        movementQuantityValue +=
          amount;


        if (
          selectedMovementType ===
          "OUT"
        ) {

          const currentStock =
            getCurrentProductStock();


          if (
            movementQuantityValue >
            currentStock
          ) {

            movementQuantityValue =
              currentStock;

          }

        }


        updateQuantityDisplay();

      }
    );

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
    movementQuantityValue
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

    if (
      typeof loadCalendarMovements ===
      "function"
    ) {

      await loadCalendarMovements();

    }

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
    typeof dashboardPage !==
      "undefined" &&
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
    repeat(3,minmax(0,1fr));
  gap: 10px;
  margin-bottom: 28px;
}

.stock-summary-card {
  padding: 16px 12px;
  background: rgba(82,66,61,.28);
  border: 1px solid rgba(192,186,179,.14);
  border-radius: 18px;
  text-align: center;
  box-shadow: 0 12px 30px rgba(0,0,0,.16);
}

.stock-summary-card span {
  display: block;
  color: var(--moon-rock);
  font-size: 8px;
  letter-spacing: .08em;
  margin-bottom: 8px;
}

.stock-summary-card strong {
  display: block;
  color: var(--soft-dove);
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
  color: var(--soft-dove);
  background: rgba(82,66,61,.24);
  border: 1px solid rgba(192,186,179,.13);
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
  color: var(--soft-dove);
  background: rgba(22,15,12,.45);
  border: 1px solid rgba(192,186,179,.1);
  border-radius: 12px;
  font-size: 10px;
}

.stock-page-item-info {
  min-width: 0;
}

.stock-page-item-name {
  overflow: hidden;
  color: var(--soft-dove);
  font-size: 11px;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.stock-page-item-th {
  margin-top: 3px;
  overflow: hidden;
  color: var(--moon-rock);
  font-family: "Noto Sans Thai",sans-serif;
  font-size: 9px;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.stock-page-item-value {
  flex-shrink: 0;
  text-align: right;
}

.stock-page-current {
  color: var(--soft-dove);
  font-size: 16px;
  font-weight: 700;
}

.stock-page-current.low {
  color: #C77A7A;
}

.stock-page-min {
  margin-top: 2px;
  color: var(--moon-rock);
  font-size: 8px;
}

@media (max-width:390px) {

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
                ).padStart(2,"0")}
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
                button.dataset.productId
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


// IMPORTANT:
// stockAlertSection is intentionally NOT
// included in Home page elements.
// The floating alert handles alerts.

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

  // Always hide the static Stock Alert
  if (stockAlertSection) {

    stockAlertSection.style.display =
      "none";

  }

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

  if (stockAlertSection) {

    stockAlertSection.style.display =
      "none";

  }

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


<!-- =====================================
     CALENDAR
===================================== -->

<div class="dashboard-section">

  <div class="section-header">

    <div class="section-title">
      Stock Calendar
    </div>

    <div
      class="section-count"
      id="calendarMonthLabel"
    >
      Month
    </div>

  </div>


  <div class="calendar-card">

    <div class="calendar-header">

      <button
        class="calendar-nav-button"
        id="calendarPrev"
        aria-label="Previous month"
      >

        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.7"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M15 18l-6-6 6-6"></path>
        </svg>

      </button>


      <div
        class="calendar-title"
        id="calendarTitle"
      >
        September 2026
      </div>


      <button
        class="calendar-nav-button"
        id="calendarNext"
        aria-label="Next month"
      >

        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.7"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M9 18l6-6-6-6"></path>
        </svg>

      </button>

    </div>


    <div class="calendar-weekdays">

      <div>MON</div>
      <div>TUE</div>
      <div>WED</div>
      <div>THU</div>
      <div>FRI</div>
      <div>SAT</div>
      <div>SUN</div>

    </div>


    <div
      class="calendar-grid"
      id="calendarGrid"
    ></div>


    <div
      class="calendar-selected"
      id="calendarSelected"
    >

      <div class="calendar-selected-header">

        <div
          class="calendar-selected-date"
          id="calendarSelectedDate"
        >
          Select a date
        </div>

        <div
          class="calendar-selected-count"
          id="calendarSelectedCount"
        >
          0 movements
        </div>

      </div>


      <div
        class="calendar-day-summary"
        id="calendarDaySummary"
      ></div>


      <div
        class="calendar-day-list"
        id="calendarDayList"
      ></div>

    </div>

  </div>

</div>


<!-- =====================================
     RECENT MOVEMENTS
===================================== -->

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


<!-- =====================================
     INVENTORY
===================================== -->

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
    repeat(2,minmax(0,1fr));
  gap: 10px;
  margin-bottom: 28px;
}

.dashboard-card {
  min-height: 135px;
  padding: 18px;
  background: rgba(82,66,61,.28);
  border: 1px solid rgba(192,186,179,.14);
  border-radius: 22px;
  box-shadow: 0 12px 30px rgba(0,0,0,.16);
}

.dashboard-card.low {
  background: rgba(57,18,20,.32);
}

.dashboard-card-label {
  color: var(--moon-rock);
  font-size: 8px;
  letter-spacing: .08em;
  text-transform: uppercase;
  margin-bottom: 14px;
}

.dashboard-card-value {
  color: var(--soft-dove);
  font-size: 30px;
  font-weight: 700;
  line-height: 1;
}

.dashboard-card.low .dashboard-card-value {
  color: #C77A7A;
}

.dashboard-card.normal .dashboard-card-value {
  color: #9FA99D;
}

.dashboard-card-sub {
  margin-top: 10px;
  color: var(--moon-rock);
  font-size: 8px;
}

.dashboard-section {
  margin-top: 28px;
}


/* =====================================
   CALENDAR
===================================== */

.calendar-card {
  padding: 16px;
  background: rgba(82,66,61,.24);
  border: 1px solid rgba(192,186,179,.13);
  border-radius: 22px;
  box-shadow: 0 12px 30px rgba(0,0,0,.14);
}

.calendar-header {
  display: grid;
  grid-template-columns: 42px 1fr 42px;
  align-items: center;
  gap: 8px;
  margin-bottom: 18px;
}

.calendar-nav-button {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--soft-dove);
  background: rgba(22,15,12,.4);
  border: 1px solid rgba(192,186,179,.12);
  border-radius: 13px;
}

.calendar-nav-button svg {
  width: 17px;
  height: 17px;
}

.calendar-title {
  color: var(--soft-dove);
  text-align: center;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: .02em;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns:
    repeat(7,minmax(0,1fr));
  margin-bottom: 8px;
}

.calendar-weekdays div {
  color: var(--moon-rock);
  text-align: center;
  font-size: 7px;
  letter-spacing: .08em;
}

.calendar-grid {
  display: grid;
  grid-template-columns:
    repeat(7,minmax(0,1fr));
  gap: 5px;
}

.calendar-day {
  position: relative;
  min-height: 44px;
  padding: 7px 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  color: var(--soft-dove);
  background: rgba(22,15,12,.26);
  border: 1px solid transparent;
  border-radius: 12px;
}

.calendar-day.empty {
  background: transparent;
}

.calendar-day-number {
  font-size: 10px;
  line-height: 1;
}

.calendar-day.today {
  border-color: rgba(192,186,179,.28);
}

.calendar-day.selected {
  background: rgba(57,18,20,.7);
  border-color: rgba(192,186,179,.22);
}

.calendar-day.has-movement::after {
  content: "";
  width: 4px;
  height: 4px;
  margin-top: 6px;
  border-radius: 50%;
  background: #C77A7A;
}

.calendar-day.has-in::before {
  content: "";
  position: absolute;
  bottom: 5px;
  left: 7px;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: #9FA99D;
}

.calendar-selected {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(192,186,179,.1);
}

.calendar-selected-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
}

.calendar-selected-date {
  color: var(--soft-dove);
  font-size: 12px;
  font-weight: 700;
}

.calendar-selected-count {
  color: var(--moon-rock);
  font-size: 8px;
}

.calendar-day-summary {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 10px;
}

.calendar-summary-box {
  padding: 11px;
  background: rgba(22,15,12,.32);
  border: 1px solid rgba(192,186,179,.1);
  border-radius: 13px;
}

.calendar-summary-label {
  color: var(--moon-rock);
  font-size: 7px;
  letter-spacing: .08em;
  margin-bottom: 5px;
}

.calendar-summary-value {
  font-size: 17px;
  font-weight: 700;
}

.calendar-summary-value.in {
  color: #9FA99D;
}

.calendar-summary-value.out {
  color: #C77A7A;
}

.calendar-day-list {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.calendar-day-movement {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 11px;
  background: rgba(22,15,12,.28);
  border: 1px solid rgba(192,186,179,.09);
  border-radius: 14px;
}

.calendar-day-movement-main {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 9px;
}

.calendar-day-type {
  width: 29px;
  height: 29px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  font-size: 7px;
  font-weight: 700;
}

.calendar-day-type.in {
  color: #9FA99D;
  background: rgba(159,169,157,.1);
}

.calendar-day-type.out {
  color: #C77A7A;
  background: rgba(199,122,122,.1);
}

.calendar-day-info {
  min-width: 0;
}

.calendar-day-name {
  overflow: hidden;
  color: var(--soft-dove);
  font-size: 9px;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.calendar-day-meta {
  margin-top: 3px;
  color: var(--moon-rock);
  font-size: 7px;
}

.calendar-day-quantity {
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 700;
}

.calendar-day-quantity.in {
  color: #9FA99D;
}

.calendar-day-quantity.out {
  color: #C77A7A;
}

.calendar-empty {
  padding: 18px;
  color: var(--moon-rock);
  text-align: center;
  font-size: 9px;
  background: rgba(22,15,12,.2);
  border-radius: 13px;
}


/* =====================================
   MOVEMENTS
===================================== */

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
  background: rgba(82,66,61,.24);
  border: 1px solid rgba(192,186,179,.13);
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
  background: rgba(159,169,157,.1);
}

.movement-type.out {
  color: #C77A7A;
  background: rgba(199,122,122,.1);
}

.movement-info {
  min-width: 0;
}

.movement-name {
  overflow: hidden;
  color: var(--soft-dove);
  font-size: 10px;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.movement-meta {
  margin-top: 3px;
  color: var(--moon-rock);
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
  color: var(--moon-rock);
  font-size: 7px;
}

.movement-empty {
  padding: 30px;
  color: var(--moon-rock);
  text-align: center;
  font-size: 10px;
  background: rgba(82,66,61,.18);
  border-radius: 18px;
}


/* =====================================
   OVERVIEW
===================================== */

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
  background: rgba(82,66,61,.24);
  border: 1px solid rgba(192,186,179,.13);
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
  color: var(--soft-dove);
  background: rgba(22,15,12,.45);
  border: 1px solid rgba(192,186,179,.1);
  border-radius: 11px;
  font-size: 9px;
}

.dashboard-overview-info {
  min-width: 0;
}

.dashboard-overview-name {
  overflow: hidden;
  color: var(--soft-dove);
  font-size: 10px;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.dashboard-overview-th {
  margin-top: 3px;
  overflow: hidden;
  color: var(--moon-rock);
  font-family: "Noto Sans Thai",sans-serif;
  font-size: 8px;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.dashboard-overview-stock {
  flex-shrink: 0;
  text-align: right;
}

.dashboard-overview-current {
  color: var(--soft-dove);
  font-size: 15px;
  font-weight: 700;
}

.dashboard-overview-current.low {
  color: #C77A7A;
}

.dashboard-overview-min {
  margin-top: 2px;
  color: var(--moon-rock);
  font-size: 8px;
}

.dashboard-loading {
  padding: 30px;
  color: var(--moon-rock);
  text-align: center;
  font-size: 10px;
}

@media (min-width:700px) {

  .dashboard-grid {
    grid-template-columns:
      repeat(3,minmax(0,1fr));
  }

}

@media (max-width:390px) {

  .dashboard-card {
    min-height: 125px;
    padding: 15px;
  }

  .dashboard-card-value {
    font-size: 26px;
  }

  .calendar-card {
    padding: 12px;
  }

  .calendar-grid {
    gap: 3px;
  }

  .calendar-day {
    min-height: 41px;
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


// Calendar elements

const calendarMonthLabel =
  document.getElementById(
    "calendarMonthLabel"
  );

const calendarTitle =
  document.getElementById(
    "calendarTitle"
  );

const calendarGrid =
  document.getElementById(
    "calendarGrid"
  );

const calendarPrev =
  document.getElementById(
    "calendarPrev"
  );

const calendarNext =
  document.getElementById(
    "calendarNext"
  );

const calendarSelectedDate =
  document.getElementById(
    "calendarSelectedDate"
  );

const calendarSelectedCount =
  document.getElementById(
    "calendarSelectedCount"
  );

const calendarDaySummary =
  document.getElementById(
    "calendarDaySummary"
  );

const calendarDayList =
  document.getElementById(
    "calendarDayList"
  );


// ========================================
// THAILAND TIME HELPERS
// ========================================

function getBangkokDateKey(
  dateValue
) {

  const date =
    new Date(dateValue);

  const parts =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone: "Asia/Bangkok",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      }
    ).formatToParts(date);

  const year =
    parts.find(
      p => p.type === "year"
    )?.value;

  const month =
    parts.find(
      p => p.type === "month"
    )?.value;

  const day =
    parts.find(
      p => p.type === "day"
    )?.value;

  return `${year}-${month}-${day}`;

}


function formatBangkokDate(
  dateValue
) {

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      timeZone: "Asia/Bangkok",
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  ).format(
    new Date(dateValue)
  );

}


function formatBangkokTime(
  dateValue
) {

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      timeZone: "Asia/Bangkok",
      hour: "2-digit",
      minute: "2-digit"
    }
  ).format(
    new Date(dateValue)
  );

}


function getBangkokMonthRange(
  year,
  month
) {

  const start =
    new Date(
      `${year}-${String(
        month + 1
      ).padStart(2,"0")}-01T00:00:00+07:00`
    );

  const nextMonth =
    month === 11
      ? 1
      : month + 2;

  const nextYear =
    month === 11
      ? year + 1
      : year;

  const end =
    new Date(
      `${nextYear}-${String(
        nextMonth
      ).padStart(2,"0")}-01T00:00:00+07:00`
    );

  return {
    start,
    end
  };

}


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

        const timeText =
          formatBangkokDate(
            movement.created_at
          ) +
          " " +
          formatBangkokTime(
            movement.created_at
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
  // TODAY - BANGKOK
  // ======================================

  const now =
    new Date();

  const todayKey =
    getBangkokDateKey(
      now
    );

  const startDate =
    new Date(
      `${todayKey}T00:00:00+07:00`
    );

  const startISO =
    startDate.toISOString();

  const endISO =
    new Date(
      startDate.getTime() +
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
    new Intl.DateTimeFormat(
      "en-GB",
      {
        timeZone: "Asia/Bangkok",
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    ).format(
      now
    );


  // ======================================
  // RECENT
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
// CALENDAR - LOAD MOVEMENTS
// ========================================

async function loadCalendarMovements() {

  if (
    !calendarGrid
  ) {

    return;

  }

  const year =
    calendarDate.getFullYear();

  const month =
    calendarDate.getMonth();

  const range =
    getBangkokMonthRange(
      year,
      month
    );

  calendarGrid.innerHTML = `
    <div
      class="calendar-empty"
      style="grid-column:1/-1;"
    >
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
      .gte(
        "created_at",
        range.start.toISOString()
      )
      .lt(
        "created_at",
        range.end.toISOString()
      )
      .order(
        "created_at",
        {
          ascending: true
        }
      );

  if (result.error) {

    console.error(
      "Calendar movement error:",
      result.error
    );

    calendarMovements = [];

    renderCalendar();

    calendarDayList.innerHTML = `
      <div class="calendar-empty">
        โหลดข้อมูลปฏิทินไม่สำเร็จ
      </div>
    `;

    return;

  }

  calendarMovements =
    result.data || [];

  renderCalendar();

}


// ========================================
// CALENDAR - RENDER
// ========================================

function renderCalendar() {

  const year =
    calendarDate.getFullYear();

  const month =
    calendarDate.getMonth();

  const monthName =
    new Intl.DateTimeFormat(
      "en-US",
      {
        month: "long"
      }
    ).format(
      new Date(
        year,
        month,
        1
      )
    );

  const monthShort =
    new Intl.DateTimeFormat(
      "en-US",
      {
        month: "short"
      }
    ).format(
      new Date(
        year,
        month,
        1
      )
    );

  calendarTitle.textContent =
    `${monthName} ${year}`;

  calendarMonthLabel.textContent =
    `${monthShort} ${year}`;


  const movementByDate = {};

  calendarMovements.forEach(
    movement => {

      const key =
        getBangkokDateKey(
          movement.created_at
        );

      if (
        !movementByDate[key]
      ) {

        movementByDate[key] =
          [];

      }

      movementByDate[key].push(
        movement
      );

    }
  );


  const firstDay =
    new Date(
      year,
      month,
      1
    );

  const daysInMonth =
    new Date(
      year,
      month + 1,
      0
    ).getDate();

  let startOffset =
    firstDay.getDay() - 1;

  if (
    startOffset < 0
  ) {

    startOffset = 6;

  }


  let html = "";

  for (
    let i = 0;
    i < startOffset;
    i++
  ) {

    html += `
      <div class="calendar-day empty"></div>
    `;

  }


  const todayKey =
    getBangkokDateKey(
      new Date()
    );


  for (
    let day = 1;
    day <= daysInMonth;
    day++
  ) {

    const dateKey =
      `${year}-${String(
        month + 1
      ).padStart(2,"0")}-${String(
        day
      ).padStart(2,"0")}`;

    const dayMovements =
      movementByDate[
        dateKey
      ] || [];

    const hasMovement =
      dayMovements.length > 0;

    const hasIn =
      dayMovements.some(
        movement =>
          movement.movement_type ===
          "IN"
      );

    const isToday =
      dateKey ===
      todayKey;

    const isSelected =
      dateKey ===
      selectedCalendarDate;

    html += `

      <button
        class="
          calendar-day
          ${hasMovement ? "has-movement" : ""}
          ${hasIn ? "has-in" : ""}
          ${isToday ? "today" : ""}
          ${isSelected ? "selected" : ""}
        "
        data-date="${dateKey}"
      >

        <span class="calendar-day-number">
          ${day}
        </span>

      </button>

    `;

  }


  calendarGrid.innerHTML =
    html;


  calendarGrid
    .querySelectorAll(
      ".calendar-day:not(.empty)"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          selectedCalendarDate =
            button.dataset.date;

          renderCalendar();

          renderCalendarSelectedDay();

        }
      );

    });


  if (
    !selectedCalendarDate
  ) {

    const currentYear =
      Number(
        todayKey.split("-")[0]
      );

    const currentMonth =
      Number(
        todayKey.split("-")[1]
      ) - 1;

    if (
      currentYear === year &&
      currentMonth === month
    ) {

      selectedCalendarDate =
        todayKey;

      renderCalendar();

      renderCalendarSelectedDay();

    }

  }

}


// ========================================
// CALENDAR - SELECTED DAY
// ========================================

function renderCalendarSelectedDay() {

  if (
    !selectedCalendarDate
  ) {

    calendarSelectedDate.textContent =
      "Select a date";

    calendarSelectedCount.textContent =
      "0 movements";

    calendarDaySummary.innerHTML =
      "";

    calendarDayList.innerHTML = `
      <div class="calendar-empty">
        เลือกวันที่เพื่อดู Stock Movement
      </div>
    `;

    return;

  }


  const movements =
    calendarMovements.filter(
      movement =>
        getBangkokDateKey(
          movement.created_at
        ) ===
        selectedCalendarDate
    );


  const date =
    new Date(
      `${selectedCalendarDate}T12:00:00+07:00`
    );


  const dateText =
    new Intl.DateTimeFormat(
      "en-GB",
      {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
        timeZone: "Asia/Bangkok"
      }
    ).format(
      date
    );


  calendarSelectedDate.textContent =
    dateText;

  calendarSelectedCount.textContent =
    `${movements.length} movement${
      movements.length === 1
        ? ""
        : "s"
    }`;


  let stockIn = 0;
  let stockOut = 0;

  movements.forEach(
    movement => {

      const quantity =
        Number(
          movement.quantity
        ) || 0;

      if (
        movement.movement_type ===
        "IN"
      ) {

        stockIn +=
          quantity;

      } else {

        stockOut +=
          quantity;

      }

    }
  );


  calendarDaySummary.innerHTML = `

    <div class="calendar-summary-box">

      <div class="calendar-summary-label">
        STOCK IN
      </div>

      <div
        class="
          calendar-summary-value
          in
        "
      >
        +${formatNumber(stockIn)}
      </div>

    </div>


    <div class="calendar-summary-box">

      <div class="calendar-summary-label">
        STOCK OUT
      </div>

      <div
        class="
          calendar-summary-value
          out
        "
      >
        -${formatNumber(stockOut)}
      </div>

    </div>

  `;


  if (!movements.length) {

    calendarDayList.innerHTML = `
      <div class="calendar-empty">
        ไม่มี Stock Movement ในวันนี้
      </div>
    `;

    return;

  }


  calendarDayList.innerHTML =
    movements
      .map(movement => {

        const isIn =
          movement.movement_type ===
          "IN";

        const typeClass =
          isIn
            ? "in"
            : "out";

        const sign =
          isIn
            ? "+"
            : "-";

        const product =
          movement.products;

        const quantity =
          formatNumber(
            Number(
              movement.quantity
            ) || 0
          );

        const note =
          movement.note
            ? ` · ${escapeHtml(
                movement.note
              )}`
            : "";

        return `

          <div
            class="calendar-day-movement"
          >

            <div
              class="calendar-day-movement-main"
            >

              <div
                class="
                  calendar-day-type
                  ${typeClass}
                "
              >
                ${
                  isIn
                    ? "IN"
                    : "OUT"
                }
              </div>


              <div
                class="calendar-day-info"
              >

                <div
                  class="calendar-day-name"
                >
                  ${escapeHtml(
                    product?.name_en ||
                    "Unknown Product"
                  )}
                </div>


                <div
                  class="calendar-day-meta"
                >
                  ITEM ${
                    String(
                      product?.item_no ??
                      ""
                    ).padStart(2,"0")
                  }
                  ·
                  ${formatBangkokTime(
                    movement.created_at
                  )}
                  ${note}
                </div>

              </div>

            </div>


            <div
              class="
                calendar-day-quantity
                ${typeClass}
              "
            >
              ${sign}${quantity}
            </div>

          </div>

        `;

      })
      .join("");

}


// ========================================
// CALENDAR NAVIGATION
// ========================================

calendarPrev.addEventListener(
  "click",
  async () => {

    calendarDate.setMonth(
      calendarDate.getMonth() - 1
    );

    selectedCalendarDate =
      null;

    await loadCalendarMovements();

  }
);


calendarNext.addEventListener(
  "click",
  async () => {

    calendarDate.setMonth(
      calendarDate.getMonth() + 1
    );

    selectedCalendarDate =
      null;

    await loadCalendarMovements();

  }
);


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


  if (stockAlertSection) {

    stockAlertSection.style.display =
      "none";

  }


  stockPage.style.display =
    "none";

  dashboardPage.style.display =
    "block";


  setActiveNav(
    navDashboard
  );


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });


  loadDashboard();

  loadCalendarMovements();

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

    await loadCalendarMovements();

  }

}

/* =========================================================
   BALENRISTA DASHBOARD ANALYTICS — ONE BLOCK EXTENSION
   ========================================================= */
(function installDashboardAnalytics() {
  const style = document.createElement("style");
  style.id = "balenrista-dashboard-analytics-style";
  style.textContent = `
    .br-analytics-section{margin-top:28px}
    .br-analytics-head{
      display:flex;
      align-items:flex-end;
      justify-content:space-between;
      gap:12px;
      margin-bottom:12px
    }

    .br-analytics-title{
      color:var(--soft-dove);
      font-size:14px;
      font-weight:700;
      letter-spacing:.04em
    }

    .br-analytics-sub{
      margin-top:4px;
      color:var(--moon-rock);
      font-size:9px
    }

    .br-range-switch{
      display:flex;
      gap:6px;
      flex-shrink:0
    }

    .br-range-switch button{
      height:32px;
      padding:0 10px;
      color:var(--moon-rock);
      background:rgba(192,186,179,.06);
      border:1px solid rgba(192,186,179,.12);
      border-radius:10px;
      font-size:8px;
      cursor:pointer
    }

    .br-range-switch button.active{
      color:var(--soft-dove);
      background:rgba(57,18,20,.88);
      border-color:rgba(192,186,179,.2)
    }

    .br-analytics-card,
    .br-analytics-panel{
      padding:16px;
      color:var(--soft-dove);
      background:rgba(82,66,61,.22);
      border:1px solid rgba(192,186,179,.12);
      border-radius:20px;
      box-shadow:0 12px 30px rgba(0,0,0,.14)
    }

    .br-movement-totals{
      display:grid;
      grid-template-columns:1fr 1fr;
      gap:9px;
      margin-bottom:16px
    }

    .br-movement-total{
      padding:12px;
      border-radius:15px;
      background:rgba(22,15,12,.32);
      border:1px solid rgba(192,186,179,.08)
    }

    .br-movement-total-label{
      color:var(--moon-rock);
      font-size:8px;
      letter-spacing:.08em
    }

    .br-movement-total-value{
      margin-top:5px;
      font-size:20px;
      font-weight:700
    }

    .br-movement-total.in .br-movement-total-value{
      color:#9FA99D
    }

    .br-movement-total.out .br-movement-total-value{
      color:#C77A7A
    }

    .br-chart-wrap{
      overflow-x:auto;
      padding-bottom:3px;
      scrollbar-width:thin
    }

    .br-chart{
      min-width:620px;
      height:190px;
      display:flex;
      align-items:stretch;
      gap:5px
    }

    .br-chart-column{
      flex:1;
      min-width:18px;
      display:flex;
      flex-direction:column;
      justify-content:flex-end
    }

    .br-chart-bars{
      height:155px;
      display:flex;
      align-items:flex-end;
      justify-content:center;
      gap:2px
    }

    .br-chart-bar{
      width:42%;
      min-height:2px;
      border-radius:5px 5px 2px 2px
    }

    .br-chart-bar.in{
      background:#6F8E78
    }

    .br-chart-bar.out{
      background:#A85D5D
    }

    .br-chart-label{
      margin-top:7px;
      text-align:center;
      color:var(--moon-rock);
      font-size:7px
    }

    .br-chart-legend{
      display:flex;
      gap:14px;
      margin-bottom:8px;
      color:var(--moon-rock);
      font-size:8px
    }

    .br-legend-item{
      display:flex;
      align-items:center;
      gap:5px
    }

    .br-legend-dot{
      width:7px;
      height:7px;
      border-radius:50%
    }

    .br-legend-dot.in{
      background:#6F8E78
    }

    .br-legend-dot.out{
      background:#A85D5D
    }

    .br-analytics-grid{
      display:grid;
      grid-template-columns:1fr;
      gap:12px;
      margin-top:12px
    }

    .br-panel-title{
      color:var(--soft-dove);
      font-size:12px;
      font-weight:700
    }

    .br-panel-sub{
      margin-top:4px;
      margin-bottom:12px;
      color:var(--moon-rock);
      font-size:8px
    }

    .br-rank-list{
      display:flex;
      flex-direction:column;
      gap:7px
    }

    .br-rank-row{
      display:grid;
      grid-template-columns:26px 1fr auto;
      gap:8px;
      align-items:center;
      padding:9px;
      background:rgba(22,15,12,.28);
      border:1px solid rgba(192,186,179,.07);
      border-radius:13px
    }

    .br-rank-number{
      color:var(--moon-rock);
      font-size:9px;
      text-align:center
    }

    .br-rank-name{
      overflow:hidden;
      color:var(--soft-dove);
      font-size:9px;
      white-space:nowrap;
      text-overflow:ellipsis
    }

    .br-rank-meta{
      margin-top:3px;
      color:var(--moon-rock);
      font-size:7px
    }

    .br-rank-value{
      color:var(--soft-dove);
      font-size:11px;
      font-weight:700;
      text-align:right
    }

    .br-rank-value.in{
      color:#9FA99D
    }

    .br-rank-value.out,
    .br-rank-value.low{
      color:#C77A7A
    }

    .br-rank-progress{
      height:4px;
      margin-top:5px;
      overflow:hidden;
      background:rgba(192,186,179,.08);
      border-radius:99px
    }

    .br-rank-progress span{
      display:block;
      height:100%;
      background:rgba(192,186,179,.38);
      border-radius:99px
    }

    .br-analytics-empty{
      padding:18px 8px;
      color:var(--moon-rock);
      font-size:9px;
      text-align:center
    }

    .br-activity-summary{
      display:grid;
      grid-template-columns:1fr 1fr 1fr;
      gap:7px;
      margin-bottom:10px
    }

    .br-activity-stat{
      padding:10px 7px;
      background:rgba(22,15,12,.28);
      border-radius:13px;
      text-align:center
    }

    .br-activity-stat-label{
      color:var(--moon-rock);
      font-size:7px
    }

    .br-activity-stat-value{
      margin-top:4px;
      color:var(--soft-dove);
      font-size:14px;
      font-weight:700
    }

    @media(min-width:700px){
      .br-analytics-grid{
        grid-template-columns:1fr 1fr
      }
    }
  `;

  document.head.appendChild(style);

  let analyticsRange = "7";
  let realtimeChannel = null;

  function ensureUI() {

    if (
      !dashboardPage ||
      document.getElementById("brDashboardAnalytics")
    ) {
      return;
    }

    const section = document.createElement("section");

    section.id = "brDashboardAnalytics";
    section.className = "br-analytics-section";

    section.innerHTML = `
      <div class="br-analytics-head">

        <div>
          <div class="br-analytics-title">
            Stock Movement Analytics
          </div>

          <div class="br-analytics-sub">
            IN / OUT movement overview
          </div>
        </div>

        <div class="br-range-switch">

          <button data-analytics-range="7">
            7D
          </button>

          <button data-analytics-range="30">
            30D
          </button>

          <button data-analytics-range="month">
            MONTH
          </button>

        </div>

      </div>


      <div class="br-analytics-card">

        <div class="br-movement-totals">

          <div class="br-movement-total in">

            <div class="br-movement-total-label">
              STOCK IN
            </div>

            <div
              class="br-movement-total-value"
              id="brAnalyticsIn"
            >
              0
            </div>

          </div>


          <div class="br-movement-total out">

            <div class="br-movement-total-label">
              STOCK OUT
            </div>

            <div
              class="br-movement-total-value"
              id="brAnalyticsOut"
            >
              0
            </div>

          </div>

        </div>


        <div class="br-chart-legend">

          <div class="br-legend-item">
            <span class="br-legend-dot in"></span>
            IN
          </div>

          <div class="br-legend-item">
            <span class="br-legend-dot out"></span>
            OUT
          </div>

        </div>


        <div class="br-chart-wrap">

          <div
            class="br-chart"
            id="brMovementChart"
          ></div>

        </div>

      </div>


      <div class="br-analytics-grid">

        <div class="br-analytics-panel">

          <div class="br-panel-title">
            Fast Moving Items
          </div>

          <div class="br-panel-sub">
            Products with the most movement in the selected period
          </div>

          <div
            class="br-rank-list"
            id="brFastMovingList"
          ></div>

        </div>


        <div class="br-analytics-panel">

          <div class="br-panel-title">
            Low Stock Overview
          </div>

          <div class="br-panel-sub">
            Items at or below minimum stock
          </div>

          <div
            class="br-rank-list"
            id="brLowStockList"
          ></div>

        </div>

      </div>


      <div
        class="br-analytics-panel"
        style="margin-top:12px"
      >

        <div class="br-panel-title">
          Latest Activity
        </div>

        <div class="br-panel-sub">
          Activity in the selected period
        </div>

        <div id="brAnalyticsLatest"></div>

      </div>
    `;

    dashboardPage.appendChild(section);


    section
      .querySelectorAll("[data-analytics-range]")
      .forEach(button => {

        button.addEventListener(
          "click",
          async () => {

            analyticsRange =
              button.dataset.analyticsRange;

            updateRangeButtons();

            await renderAnalytics();

          }
        );

      });


    updateRangeButtons();

  }


  function updateRangeButtons() {

    document
      .querySelectorAll("[data-analytics-range]")
      .forEach(button => {

        button.classList.toggle(
          "active",
          button.dataset.analyticsRange ===
          analyticsRange
        );

      });

  }


  function getRange() {

    if (analyticsRange === "month") {

      const now = new Date();

      const parts =
        new Intl.DateTimeFormat(
          "en-US",
          {
            timeZone:"Asia/Bangkok",
            year:"numeric",
            month:"numeric"
          }
        ).formatToParts(now);

      const year =
        Number(
          parts.find(
            x => x.type === "year"
          ).value
        );

      const month =
        Number(
          parts.find(
            x => x.type === "month"
          ).value
        ) - 1;

      return getBangkokMonthRange(
        year,
        month
      );

    }


    const days =
      Number(analyticsRange);

    const end =
      new Date();

    const start =
      new Date(end);

    start.setDate(
      start.getDate() -
      (days - 1)
    );

    return {
      start:start.toISOString(),
      end:end.toISOString()
    };

  }


  async function getRows() {

    const range =
      getRange();

    const result =
      await supabaseClient
        .from("stock_movements")
        .select(`
          id,
          product_id,
          movement_type,
          quantity,
          note,
          created_at,
          products (
            item_no,
            name_en,
            name_th,
            unit
          )
        `)
        .gte(
          "created_at",
          range.start
        )
        .lt(
          "created_at",
          range.end
        )
        .order(
          "created_at",
          {
            ascending:true
          }
        );


    if (result.error) {

      console.error(
        "Dashboard analytics error:",
        result.error
      );

      return [];

    }


    return result.data || [];

  }


  function getDates() {

    const dates = [];


    if (analyticsRange === "month") {

      const now =
        new Date();

      const parts =
        new Intl.DateTimeFormat(
          "en-US",
          {
            timeZone:"Asia/Bangkok",
            year:"numeric",
            month:"numeric"
          }
        ).formatToParts(now);

      const year =
        Number(
          parts.find(
            x => x.type === "year"
          ).value
        );

      const month =
        Number(
          parts.find(
            x => x.type === "month"
          ).value
        ) - 1;

      const days =
        new Date(
          year,
          month + 1,
          0
        ).getDate();


      for (
        let d = 1;
        d <= days;
        d++
      ) {

        dates.push(
          `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`
        );

      }


      return dates;

    }


    const count =
      Number(analyticsRange);


    for (
      let i = count - 1;
      i >= 0;
      i--
    ) {

      const d =
        new Date();

      d.setDate(
        d.getDate() - i
      );

      dates.push(
        getBangkokDateKey(d)
      );

    }


    return dates;

  }


  async function renderAnalytics() {

    ensureUI();


    const chart =
      document.getElementById(
        "brMovementChart"
      );

    const inEl =
      document.getElementById(
        "brAnalyticsIn"
      );

    const outEl =
      document.getElementById(
        "brAnalyticsOut"
      );


    if (
      !chart ||
      !inEl ||
      !outEl
    ) {
      return;
    }


    chart.innerHTML = `
      <div class="br-analytics-empty">
        กำลังโหลด...
      </div>
    `;


    const rows =
      await getRows();


    const grouped = {};


    rows.forEach(row => {

      const key =
        getBangkokDateKey(
          row.created_at
        );


      if (!grouped[key]) {

        grouped[key] = {
          IN:0,
          OUT:0
        };

      }


      const q =
        Number(row.quantity) || 0;


      if (
        row.movement_type === "IN"
      ) {

        grouped[key].IN += q;

      }


      if (
        row.movement_type === "OUT"
      ) {

        grouped[key].OUT += q;

      }

    });


    const dates =
      getDates();


    const values =
      dates.map(
        d =>
          grouped[d] || {
            IN:0,
            OUT:0
          }
      );


    const max =
      Math.max(
        1,
        ...values.map(
          v =>
            Math.max(
              v.IN,
              v.OUT
            )
        )
      );


    const totalIn =
      values.reduce(
        (s,v) => s + v.IN,
        0
      );


    const totalOut =
      values.reduce(
        (s,v) => s + v.OUT,
        0
      );


    inEl.textContent =
      formatNumber(
        totalIn
      );

    outEl.textContent =
      formatNumber(
        totalOut
      );


    chart.innerHTML =
      dates.map(
        (date,i) => {

          const v =
            values[i];


          const ih =
            v.IN
              ? Math.max(
                  3,
                  (v.IN / max) * 100
                )
              : 0;


          const oh =
            v.OUT
              ? Math.max(
                  3,
                  (v.OUT / max) * 100
                )
              : 0;


          const label =
            analyticsRange === "month"
              ? date.slice(8,10)
              : date.slice(5,10);


          return `
            <div
              class="br-chart-column"
              title="${date}"
            >

              <div class="br-chart-bars">

                <div
                  class="br-chart-bar in"
                  style="height:${ih}%"
                ></div>

                <div
                  class="br-chart-bar out"
                  style="height:${oh}%"
                ></div>

              </div>

              <div class="br-chart-label">
                ${label}
              </div>

            </div>
          `;

        }
      ).join("");


    renderFastMoving(rows);

    renderLowStock();

    renderLatest(rows);

  }


  function renderFastMoving(rows) {

    const el =
      document.getElementById(
        "brFastMovingList"
      );


    if (!el) {
      return;
    }


    const map = {};


    rows.forEach(row => {

      if (!map[row.product_id]) {

        map[row.product_id] = {
          product:row.products,
          total:0,
          in:0,
          out:0
        };

      }


      const q =
        Number(row.quantity) || 0;


      map[row.product_id].total += q;


      if (
        row.movement_type === "IN"
      ) {

        map[row.product_id].in += q;

      }


      if (
        row.movement_type === "OUT"
      ) {

        map[row.product_id].out += q;

      }

    });


    const ranked =
      Object.values(map)
        .sort(
          (a,b) =>
            b.total - a.total
        )
        .slice(0,8);


    if (!ranked.length) {

      el.innerHTML = `
        <div class="br-analytics-empty">
          ยังไม่มี Stock Movement ในช่วงนี้
        </div>
      `;

      return;

    }


    const max =
      Math.max(
        1,
        ranked[0].total
      );


    el.innerHTML =
      ranked.map(
        (x,i) => `

          <div class="br-rank-row">

            <div class="br-rank-number">
              ${i+1}
            </div>

            <div>

              <div class="br-rank-name">
                ${escapeHtml(
                  x.product?.name_en ||
                  "Unknown Product"
                )}
              </div>

              <div class="br-rank-meta">
                IN ${formatNumber(x.in)}
                ·
                OUT ${formatNumber(x.out)}
              </div>

              <div class="br-rank-progress">

                <span
                  style="width:${(x.total/max)*100}%"
                ></span>

              </div>

            </div>

            <div class="br-rank-value">
              ${formatNumber(x.total)}
            </div>

          </div>

        `
      ).join("");

  }


  function renderLowStock() {

    const el =
      document.getElementById(
        "brLowStockList"
      );


    if (!el) {
      return;
    }


    const low =
      allProducts
        .map(product => {

          const stock =
            stockMap[product.id];


          const current =
            stock
              ? Number(stock.current_stock) || 0
              : 0;


          const min =
            stock
              ? Number(stock.min_stock) || 5
              : Number(product.min_stock) || 5;


          return {
            product,
            current,
            min
          };

        })
        .filter(
          x => x.current <= x.min
        )
        .sort(
          (a,b) =>
            a.current - b.current ||
            a.product.item_no -
            b.product.item_no
        )
        .slice(0,8);


    if (!low.length) {

      el.innerHTML = `
        <div class="br-analytics-empty">
          ไม่มีรายการ Low Stock 🎉
        </div>
      `;

      return;

    }


    el.innerHTML =
      low.map(
        (x,i) => {

          const pct =
            x.min > 0
              ? Math.min(
                  100,
                  (x.current / x.min) * 100
                )
              : 0;


          return `

            <div class="br-rank-row">

              <div class="br-rank-number">
                ${i+1}
              </div>

              <div>

                <div class="br-rank-name">
                  ${escapeHtml(
                    x.product.name_en || ""
                  )}
                </div>

                <div class="br-rank-meta">
                  MIN ${formatNumber(x.min)}
                  ${escapeHtml(
                    x.product.unit || ""
                  )}
                </div>

                <div class="br-rank-progress">

                  <span
                    style="width:${pct}%"
                  ></span>

                </div>

              </div>

              <div class="br-rank-value low">
                ${formatNumber(x.current)}
              </div>

            </div>

          `;

        }
      ).join("");

  }


  function renderLatest(rows) {

    const el =
      document.getElementById(
        "brAnalyticsLatest"
      );


    if (!el) {
      return;
    }


    const latest =
      [...rows]
        .sort(
          (a,b) =>
            new Date(b.created_at) -
            new Date(a.created_at)
        )
        .slice(0,5);


    const totalIn =
      rows
        .filter(
          r => r.movement_type === "IN"
        )
        .reduce(
          (s,r) =>
            s + (Number(r.quantity) || 0),
          0
        );


    const totalOut =
      rows
        .filter(
          r => r.movement_type === "OUT"
        )
        .reduce(
          (s,r) =>
            s + (Number(r.quantity) || 0),
          0
        );


    if (!latest.length) {

      el.innerHTML = `
        <div class="br-analytics-empty">
          ยังไม่มีรายการ
        </div>
      `;

      return;

    }


    el.innerHTML = `

      <div class="br-activity-summary">

        <div class="br-activity-stat">

          <div class="br-activity-stat-label">
            MOVEMENTS
          </div>

          <div class="br-activity-stat-value">
            ${formatNumber(rows.length)}
          </div>

        </div>


        <div class="br-activity-stat">

          <div class="br-activity-stat-label">
            IN
          </div>

          <div
            class="br-activity-stat-value"
            style="color:#9FA99D"
          >
            ${formatNumber(totalIn)}
          </div>

        </div>


        <div class="br-activity-stat">

          <div class="br-activity-stat-label">
            OUT
          </div>

          <div
            class="br-activity-stat-value"
            style="color:#C77A7A"
          >
            ${formatNumber(totalOut)}
          </div>

        </div>

      </div>


      <div class="br-rank-list">

        ${
          latest.map(row => {

            const isIn =
              row.movement_type === "IN";


            return `

              <div class="br-rank-row">

                <div
                  class="br-rank-number"
                  style="
                    color:${isIn
                      ? "#9FA99D"
                      : "#C77A7A"}
                  "
                >
                  ${isIn ? "IN" : "OUT"}
                </div>


                <div>

                  <div class="br-rank-name">
                    ${escapeHtml(
                      row.products?.name_en ||
                      "Unknown Product"
                    )}
                  </div>


                  <div class="br-rank-meta">

                    ITEM
                    ${String(
                      row.products?.item_no ?? ""
                    ).padStart(2,"0")}

                    ·

                    ${formatBangkokTime(
                      row.created_at
                    )}

                    ${
                      row.note
                        ? ` · ${escapeHtml(row.note)}`
                        : ""
                    }

                  </div>

                </div>


                <div
                  class="br-rank-value ${
                    isIn ? "in" : "out"
                  }"
                >
                  ${
                    isIn
                      ? "+"
                      : "−"
                  }${formatNumber(
                    row.quantity
                  )}
                </div>

              </div>

            `;

          }).join("")
        }

      </div>

    `;

  }


  const originalLoadDashboard =
    loadDashboard;


  loadDashboard =
    async function() {

      await originalLoadDashboard();


      if (
        dashboardPage.style.display ===
        "none"
      ) {
        return;
      }


      ensureUI();

      await renderAnalytics();

    };


  function setupRealtime() {

    if (realtimeChannel) {
      return;
    }


    realtimeChannel =
  supabaseClient
    .channel(
      "balenrista-dashboard-realtime"
    )
    .on(
      "postgres_changes",
      {
        event:"*",
        schema:"public",
        table:"stock_movements"
      },
      async () => {

        await refreshStock();

        if (
          dashboardPage.style.display !==
          "none"
        ) {

          await loadCalendarMovements();

        }

      }
    )
    .subscribe();

  }


  setupRealtime();

})();

// ========================================
// START
// ========================================

// Make absolutely sure the static
// Home Stock Alert is hidden.

if (stockAlertSection) {

  stockAlertSection.style.display =
    "none";

}

loadProducts();
