const SUPABASE_URL = "https://wkovagycpdrozqojhxby.supabase.co";
const SUPABASE_KEY = "sb_publishable_qn4s361UDciFJN_w-nFdbg_8nJLV3Eq";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

async function loadProducts() {
  const status = document.querySelector(".status");

  status.textContent = "กำลังโหลดสินค้า...";

  try {
    const { data, error } = await supabaseClient
      .from("products")
      .select("*")
      .eq("active", true)
      .order("item_no", { ascending: true });

    if (error) {
      throw error;
    }

    status.innerHTML = `
      <strong>โหลดสินค้าสำเร็จ 🎉</strong>
      <br>
      พบสินค้า ${data.length} รายการ
    `;

    console.log("Products loaded:", data);

  } catch (error) {
    console.error("Supabase error:", error);

    status.innerHTML = `
      <strong>โหลดข้อมูลไม่สำเร็จ ❌</strong>
      <br><br>
      Error: ${error.message || "ไม่ทราบสาเหตุ"}
      <br>
      Code: ${error.code || "ไม่มี"}
      <br>
      Details: ${error.details || "-"}
    `;
  }
}

loadProducts();
