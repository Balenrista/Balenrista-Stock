const SUPABASE_URL = "https://wkovagycpdrozqojhxby.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_qn4s361UDciFJN_w-nFdbg_8nJLV3Eq";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

async function loadProducts() {
  const status = document.querySelector(".status");

  status.textContent = "กำลังโหลดสินค้า...";

  const { data, error } = await supabaseClient
    .from("products")
    .select("*")
    .eq("active", true)
    .order("item_no", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    status.textContent = "โหลดข้อมูลไม่สำเร็จ";
    return;
  }

  console.log("Products loaded:", data);

  status.innerHTML = `
    โหลดสินค้าสำเร็จ 🎉
    <br>
    พบสินค้า ${data.length} รายการ
  `;
}

loadProducts();
