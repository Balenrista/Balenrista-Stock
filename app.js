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


// Stock Alert

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
// LOAD PRODUCTS
// ========================================

async function loadProducts() {

  productGrid.innerHTML = `
    <div class="status">
      กำลังโหลดสินค้า...
    </div>
  `;


  // Load products

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


  // Build category

  buildCategories();


  // Render Stock Alert

  renderStockAlerts();


  // Render products

  renderProducts(
    allProducts
  );

}


// ========================================
// STOCK ALERT
// ========================================

function renderStockAlerts() {

  // ถ้า HTML ไม่มีส่วน Alert
  // ไม่ทำอะไร

  if (
    !stockAlertSection ||
    !stockAlertList ||
    !stockAlertCount
  ) {

    console.warn(
      "Stock Alert elements not found."
    );

    return;

  }


  // หาสินค้าที่ Current Stock
  // น้อยกว่าหรือเท่ากับ Minimum Stock

  const alertItems =
    allProducts
      .map(product => {

        const stock =
          stockMap[product.id];


        const currentStock =
          stock
            ? Number(stock.current_stock)
            : 0;


        const minStock =
          stock
            ? Number(stock.min_stock)
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


  // ไม่มีรายการ Low Stock

  if (!alertItems.length) {

    stockAlertSection.style.display =
      "none";

    stockAlertCount.textContent =
      "0 items";

    stockAlertList.innerHTML =
      "";

    return;

  }


  // มีรายการ Low Stock

  stockAlertSection.style.display =
    "block";


  stockAlertCount.textContent =
    `${alertItems.length} items`;


  stockAlertList.innerHTML =
    alertItems
      .map(item => {

        const itemNumber =
          String(item.item_no)
            .padStart(2, "0");


        return `

          <button
            class="stock-alert-item"
            data-product-id="${escapeHtml(
              item.id
            )}"
          >

            <div class="stock-alert-main">

              <div class="stock-alert-number">
                ${itemNumber}
              </div>


              <div class="stock-alert-info">

                <div
                  class="stock-alert-name-en"
                >
                  ${escapeHtml(
                    item.name_en || ""
                  )}
                </div>


                <div
                  class="stock-alert-name-th"
                >
                  ${escapeHtml(
                    item.name_th || ""
                  )}
                </div>

              </div>

            </div>


            <div class="stock-alert-stock">

              <div
                class="stock-alert-current"
              >
                ${formatNumber(
                  item.current_stock
                )}
              </div>


              <div
                class="stock-alert-min"
              >
                /
                ${formatNumber(
                  item.min_stock
                )}
              </div>

            </div>

          </button>

        `;

      })
      .join("");


  // Click Alert
  // → เปิด Product Detail

  stockAlertList
    .querySelectorAll(
      ".stock-alert-item"
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


    // Current stock

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


    // ป้องกัน Stock Out
    // มากกว่าสต็อกที่มี

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


    // Insert movement

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


  (data || [])
    .forEach(stock => {

      stockMap[stock.id] =
        stock;

    });


  // Update Stock Alert

  renderStockAlerts();


  // Update Product Cards

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

stockPage.id = "stockPage";

stockPage.style.display = "none";

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
// PAGE NAVIGATION
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

  stockAlertSection,

  productGrid

];


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


  setActiveNav(
    navHome
  );


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


function showStockPage() {

  homeElements.forEach(
    element => {

      if (element) {

        element.style.display =
          "none";

      }

    }
  );


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


// Catalog / Dashboard
// ยังไม่เปิดใช้งาน

navCatalog.addEventListener(
  "click",
  () => {

    showHomePage();

    alert(
      "Catalog จะเปิดใช้งานในขั้นถัดไป"
    );

  }
);


navDashboard.addEventListener(
  "click",
  () => {

    showHomePage();

    alert(
      "Dashboard จะเปิดใช้งานในขั้นถัดไป"
    );

  }
);


// ========================================
// START
// ========================================

loadProducts();

