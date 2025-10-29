let couponDiscount = 0;
let discountType = "";

// ===== GIỎ HÀNG =====
function getCart(type = "normalCart") {
  return JSON.parse(localStorage.getItem(type)) || [];
}

function setCart(cart, type = "normalCart") {
  localStorage.setItem(type, JSON.stringify(cart));
}

// ===== CẬP NHẬT ICON GIỎ HÀNG =====
function updateCartIcon() {
  const normalCart = getCart("normalCart");
  const auctionCart = getCart("auctionCart");
  const totalItems = normalCart.reduce((sum, i) => sum + i.qty, 0) + auctionCart.length;
  const cartCountEl = document.querySelector(".cart-count");
  if (cartCountEl) cartCountEl.textContent = totalItems;
}

function renderCart() {
  const normalCartBody = document.getElementById("normal-cart-body");
  const auctionCartBody = document.getElementById("auction-cart-body");
  const normalCart = getCart("normalCart");
  const auctionCart = getCart("auctionCart");

  normalCartBody.innerHTML = "";
  auctionCartBody.innerHTML = "";

  // ===== GIỎ HÀNG MUA NGAY =====
  if (!normalCart.length) {
    normalCartBody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align:center; padding:40px 0;">
          <img src="../images/gio hang.png" alt="Empty Cart" style="width:100px; opacity:0.7;">
          <p style="margin-top:15px; font-size:18px;">Giỏ hàng của bạn chưa có sản phẩm nào</p>
        </td>
      </tr>`;
  } else {
    normalCart.forEach((item, index) => {
      const itemTotal = item.price * item.qty;
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>
          <div class="product-info">
            <img src="${item.img}" alt="${item.name}">
            <div class="details">
              <span>${item.name}</span><br>
              <a href="#" class="remove" onclick="confirmRemove(${index})">Xóa</a>
            </div>
          </div>
        </td>
        <td>
          <div class="quantity-box">
            <button onclick="changeQty(${index}, -1)">-</button>
            <input type="number" value="${item.qty}" min="1" onchange="manualQty(${index}, this.value)">
            <button onclick="changeQty(${index}, 1)">+</button>
          </div>
        </td>
        <td>${item.price.toLocaleString("vi-VN")}₫</td>
        <td>${itemTotal.toLocaleString("vi-VN")}₫</td>
      `;
      normalCartBody.appendChild(row);
    });
  }

  // ===== GIỎ HÀNG ĐẤU GIÁ =====
if (!auctionCart.length) {
  auctionCartBody.innerHTML = `
    <tr>
      <td colspan="4" style="text-align:center; padding:40px 0;">
        <img src="../images/gio hang.png" alt="Empty Cart" style="width:100px; opacity:0.7;">
        <p style="margin-top:15px; font-size:18px;">Bạn chưa có cuốn sách đấu giá nào</p>
      </td>
    </tr>`;
} else {
  auctionCart.forEach((item) => {
    const itemTotal = item.winPrice * (item.qty || 1);
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>
        <div class="product-info">
          <img src="${item.img}" alt="${item.name}">
          <div class="details">
            <span style="font-weight:bold;">${item.name}</span><br>
            <small>Tác giả: ${item.author || "Không rõ"}</small><br>
            <span style="color: var(--green); font-weight:600;">Đấu giá thành công</span>
          </div>
        </div>
      </td>
      <td>${item.winPrice.toLocaleString("vi-VN")}₫</td>
      <td>${itemTotal.toLocaleString("vi-VN")}₫</td>
      <td>${item.qty || 1}</td>
    `;
    auctionCartBody.appendChild(row);
  });
}

  // ===== CẬP NHẬT TỔNG =====
  const totalNormal = normalCart.reduce((sum, i) => sum + i.price * i.qty, 0);
const totalAuction = auctionCart.reduce((sum, i) => sum + i.winPrice + 25000, 0);
let totalAmount = totalNormal + totalAuction;
const totalItems = normalCart.reduce((sum, i) => sum + i.qty, 0) + auctionCart.length;

// ===== TÍNH GIẢM GIÁ THEO SỐ LƯỢNG HOẶC TỔNG TIỀN =====
let discountValue = 0;
let discountText = "";

if (totalItems >= 5) {
  discountValue = 30000;
  discountText = "Giảm 30.000₫ vì mua từ 5 sản phẩm trở lên";
} else if (totalItems >= 3) {
  discountValue = 20000;
  discountText = "Giảm 20.000₫ vì mua từ 3 sản phẩm trở lên";
} else if (totalAmount >= 500000) {
  discountValue = 80000;
  discountText = "Giảm 80.000₫ vì hóa đơn trên 500.000₫ ";
}

// Trừ giảm giá theo số lượng
totalAmount -= discountValue;

// Trừ thêm mã giảm giá nếu có
if (couponDiscount > 0) {
  if (discountType === "percent") {
    totalAmount -= totalAmount * (couponDiscount / 100);
  } else {
    totalAmount -= couponDiscount;
  }
}
// ===== HIỂN THỊ TỔNG =====
const totalNormalEl = document.getElementById("normal-total");
const totalAuctionEl = document.getElementById("auction-total");
const totalAmountEl = document.getElementById("total-amount");
const totalItemsEl = document.getElementById("total-items");
const discountEl = document.getElementById("discount-amount");
const discountMsgEl = document.getElementById("discount-message");

if (totalNormalEl) totalNormalEl.textContent = totalNormal.toLocaleString("vi-VN") + "₫";
if (totalAuctionEl) totalAuctionEl.textContent = totalAuction.toLocaleString("vi-VN") + "₫";
if (discountEl) discountEl.textContent = discountValue > 0 ? `- ${discountValue.toLocaleString("vi-VN")}₫` : "0₫";
if (totalAmountEl) totalAmountEl.textContent = totalAmount.toLocaleString("vi-VN") + "₫";
if (totalItemsEl) totalItemsEl.textContent = totalItems;
if (discountMsgEl) discountMsgEl.textContent = discountText;

  updateCartIcon();
}

// ===== THÊM / XOÁ / THAY ĐỔI SỐ LƯỢNG =====
function addToCart(name, price, img) {
  let normalCart = getCart("normalCart");
  const existing = normalCart.find(i => i.name === name);
  if (existing) existing.qty += 1;
  else normalCart.push({ name, price, qty: 1, img });
  setCart(normalCart, "normalCart");
  renderCart();
}

function removeNormal(index) {
  productToDeleteIndex = index; // dùng modal deleteModal
  deleteModal.style.display = "flex";
}

function changeQty(index, delta) {
  let normalCart = getCart("normalCart");
  normalCart[index].qty += delta;
  if (normalCart[index].qty <= 0) removeNormal(index);
  else {
    setCart(normalCart, "normalCart");
    renderCart();
  }
}

function manualQty(index, value) {
  let normalCart = getCart("normalCart");
  const val = parseInt(value) || 0;
  normalCart[index].qty = val;
  if (val <= 0) removeNormal(index);
  else {
    setCart(normalCart, "normalCart");
    renderCart();
  }
}

// ===== DOMCONTENTLOADED =====
document.addEventListener("DOMContentLoaded", () => {
  renderCart();

  // Thêm vào giỏ
  document.querySelectorAll(".add-to-cart").forEach(button => {
    button.addEventListener("click", () => {
      const card = button.closest(".product-card");
      const name = card.querySelector("h3").innerText;
      const price = parseInt(card.querySelector("p").innerText.replace(/\D/g, ""));
      const img = card.querySelector("img").src;
      addToCart(name, price, img);
    });
  });

  // Icon giỏ hàng click
  document.querySelectorAll(".cart-icon-click").forEach((icon, i) => {
    icon.addEventListener("click", () => document.querySelectorAll(".add-to-cart")[i].click());
  });

  // ===== CHECKOUT FORM =====
  const confirmBtn = document.querySelector(".confirm-btn");
  const requiredInputs = document.querySelectorAll(".required");
  const paymentOptions = document.getElementsByName("payment");
  const modalConfirm = document.getElementById("confirmPaymentModal");
  const modalSuccess = document.getElementById("checkout_success");
  const rememberCheckbox = document.getElementById("remember-info");
  const customerInputs = document.querySelectorAll(".receiver-info input");

  function clearErrors() {
    requiredInputs.forEach(input => {
      input.classList.remove("error");
      const msg = input.parentElement.querySelector(".error-message");
      if (msg) msg.style.display = "none";
    });
    document.querySelectorAll(".payment-error").forEach(e => e.remove());
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function isValidPhone(phone) {
    return /^(0|\+84)\d{9}$/.test(phone);
  }

  // Load saved customer info
  const savedInfo = localStorage.getItem("customerInfo");
  if (savedInfo) {
    const data = JSON.parse(savedInfo);
    customerInputs.forEach(input => {
      if (data[input.id]) input.value = data[input.id];
    });
    rememberCheckbox.checked = true;
  }


    if (!Array.from(paymentOptions).some(p => p.checked)) {
      const msg = document.createElement("div");
      msg.className = "payment-error";
      msg.textContent = "Vui lòng chọn phương thức thanh toán";
      msg.style.color = "#e74c3c";
      msg.style.fontSize = "12px";
      msg.style.marginTop = "4px";
      document.querySelector(".payment-options").appendChild(msg);
      valid = false;
    }

    if (!valid) return;

    if (rememberCheckbox.checked) {
      const dataToSave = {};
      customerInputs.forEach(input => dataToSave[input.id] = input.value);
      localStorage.setItem("customerInfo", JSON.stringify(dataToSave));
    } else localStorage.removeItem("customerInfo");

    modalConfirm.style.display = "flex";
  });

  
  document.getElementById("confirmPaymentNo").addEventListener("click", () => modalConfirm.style.display = "none");

  window.onclick = e => { if (e.target.classList.contains("modal")) e.target.style.display = "none"; };

  // ===== QUẢN LÝ ĐỊA CHỈ =====
  const addAddressBtn = document.getElementById("addAddressBtn");
  const addressFormContainer = document.getElementById("address-form-container");
  const cancelAddressBtn = document.getElementById("cancelAddressBtn");
  const saveAddressBtn = document.getElementById("saveAddressBtn");
  const savedContainer = document.getElementById("address-list");

  function renderAddressList() {
  const saved = JSON.parse(localStorage.getItem("savedAddresses")) || [];
  savedContainer.innerHTML = "";

  if (!saved.length) {
    savedContainer.style.display = "none";
    addAddressBtn.style.display = "inline-block";
    return;
  }

  saved.forEach((data, index) => {
    const box = document.createElement("div");
    box.classList.add("saved-address-box");
     box.innerHTML = `
    <input type="radio" name="selectedAddress" value="${index}" style="display:none" ${data.isDefault ? "checked" : ""}>
    <div class="address-info">
      <strong>${data.fullName}</strong> | ${data.phone} | ${data.email || "(Không có email)"}<br>
      ${data.address}<br>
      <span class="tag">${data.type}</span>
      ${data.isDefault ? `<span class="tag default">Mặc định</span>` : ""}
      ${data.note ? `<p class="note">${data.note}</p>` : ""}
    </div>
    <div class="address-actions">
      <button class="edit-address" data-index="${index}">+ Thêm địa chỉ mới</button>
      <button class="delete-address" data-index="${index}">Xóa</button>
    </div>
  `;
  savedContainer.appendChild(box);

  // Khi click vào box, chọn radio
  const radio = box.querySelector('input[type="radio"]');
  box.querySelector(".address-info").addEventListener("click", () => {
    radio.checked = true;
    // highlight box đang chọn
    document.querySelectorAll(".saved-address-box .address-info").forEach(b => b.classList.remove("selected"));
    box.querySelector(".address-info").classList.add("selected");
  });

  // Nếu là mặc định → highlight luôn
  if (data.isDefault) box.querySelector(".address-info").classList.add("selected");
});
  savedContainer.style.display = "block";
  addAddressBtn.style.display = "none";
}
renderAddressList();
  addAddressBtn.addEventListener("click", e => {
    e.preventDefault();
    addressFormContainer.style.display = "block";
    window.scrollTo({ top: addressFormContainer.offsetTop - 50, behavior: "smooth" });
  });

  cancelAddressBtn.addEventListener("click", e => {
  e.preventDefault();
  addressFormContainer.style.display = "none"; // ẩn form

  const saved = localStorage.getItem("savedAddresses");
  if (saved) {
    // Có địa chỉ lưu → hiện lại danh sách
    renderAddressList();
  } else {
    // Chưa có địa chỉ → hiện nút thêm mới
    addAddressBtn.style.display = "inline-block";
  }
});

  saveAddressBtn.addEventListener("click", e => {
    e.preventDefault();
    const ids = ["full-name","phone","email","city","district","ward","house-number"];
    let valid = true;
    ids.forEach(id => {
      const el = document.getElementById(id);
      const msg = el.parentElement.querySelector(".error-message");
      if (!el.value.trim()) { if(msg) msg.style.display = "block"; el.classList.add("error"); valid=false; }
      else { if(msg) msg.style.display = "none"; el.classList.remove("error"); }
    });
    if(!valid) return;

    const fullName = document.getElementById("full-name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const email = document.getElementById("email").value.trim();
    const city = document.getElementById("city").value.trim();
    const district = document.getElementById("district").value.trim();
    const ward = document.getElementById("ward").value.trim();
    const house = document.getElementById("house-number").value.trim();
    const note = document.getElementById("note").value.trim();
    const type = document.getElementById("nharieng").checked ? "Nhà riêng" : "Cơ quan";
    const isDefault = document.getElementById("default-address").checked;
    const address = `${house}, ${ward}, ${district}, ${city}`;

let savedAddresses = JSON.parse(localStorage.getItem("savedAddresses")) || [];

// Nếu tick "Đặt làm mặc định" → bỏ mặc định ở các địa chỉ khác
if (isDefault) {
  savedAddresses = savedAddresses.map(a => ({ ...a, isDefault: false }));
}

const newAddress = { fullName, phone, email, address, type, isDefault, note, timestamp: new Date().toISOString() };
savedAddresses.push(newAddress);
localStorage.setItem("savedAddresses", JSON.stringify(savedAddresses));

addressFormContainer.style.display = "none";
renderAddressList();
    addressFormContainer.style.display = "none";
    renderAddressList();
  });

  savedContainer.addEventListener("click", e => {
    const data = JSON.parse(localStorage.getItem("savedAddresses") || "{}");
    if (e.target.classList.contains("edit-address")) {
      document.getElementById("full-name").value = data.fullName || "";
      document.getElementById("phone").value = data.phone || "";
      document.getElementById("email").value = data.email || "";
      document.getElementById("city").value = "";
      document.getElementById("district").value = "";
      document.getElementById("ward").value = "";
      document.getElementById("house-number").value = "";
      document.getElementById("nharieng").checked = data.type === "Nhà riêng";
      document.getElementById("coquan").checked = data.type === "Cơ quan";
      document.getElementById("default-address").checked = data.isDefault || false;
      document.getElementById("note").value = data.note || "";
      savedContainer.style.display = "none";
      addressFormContainer.style.display = "block";
    }

    if (e.target.classList.contains("delete-address")) {
  const index = e.target.dataset.index; // lấy chỉ số địa chỉ cần xóa
  let savedAddresses = JSON.parse(localStorage.getItem("savedAddresses")) || [];

  if (confirm("Bạn có chắc muốn xóa địa chỉ này không?")) {
    savedAddresses.splice(index, 1); // xóa đúng 1 địa chỉ
    localStorage.setItem("savedAddresses", JSON.stringify(savedAddresses));

    // nếu còn địa chỉ khác → render lại danh sách
    if (savedAddresses.length > 0) {
      renderAddressList();
    } else {
      savedContainer.style.display = "none";
      addAddressBtn.style.display = "inline-block";
    }
  }
}
  });
// ===================== MODAL =====================
const deleteModal = document.getElementById("deleteModal");
const confirmDeleteBtn = document.getElementById("confirmDelete");
const cancelDeleteBtn = document.getElementById("cancelDelete");

const deleteAddressModal = document.getElementById("deleteAddressModal");
const confirmDeleteAddressBtn = document.getElementById("confirmDeleteAddress");
const cancelDeleteAddressBtn = document.getElementById("cancelDeleteAddress");

const confirmPaymentModal = document.getElementById("confirmPaymentModal");
const confirmPaymentYes = document.getElementById("confirmPaymentYes");
const confirmPaymentNo = document.getElementById("confirmPaymentNo");

const checkoutSuccess = document.getElementById("checkout_success");

// ===== XÓA SẢN PHẨM =====
let productToDeleteIndex = null;
function confirmRemove(index) {
  productToDeleteIndex = index;
  deleteModal.style.display = "flex";
}

confirmDeleteBtn.addEventListener("click", () => {
  if (productToDeleteIndex !== null) {
    let normalCart = getCart("normalCart");
    normalCart.splice(productToDeleteIndex, 1);
    setCart(normalCart, "normalCart");
    renderCart();
    productToDeleteIndex = null;
  }
  deleteModal.style.display = "none";
});

cancelDeleteBtn.addEventListener("click", () => {
  productToDeleteIndex = null;
  deleteModal.style.display = "none";
});


// ===== THANH TOÁN =====
document.querySelector(".confirm-btn").addEventListener("click", e => {
  e.preventDefault();

  // Lấy danh sách địa chỉ lưu
  const savedAddresses = JSON.parse(localStorage.getItem("savedAddresses") || "[]");
  if (savedAddresses.length > 0) {
    const selectedAddress = document.querySelector('input[name="selectedAddress"]:checked');
    if (!selectedAddress) {
      alert("Vui lòng chọn một địa chỉ giao hàng");
      return;
    }
    const addressIndex = parseInt(selectedAddress.value);
    const shippingAddress = savedAddresses[addressIndex];
    console.log("Địa chỉ giao hàng:", shippingAddress);
  }

  // Hiển thị modal xác nhận thanh toán
  confirmPaymentModal.style.display = "flex";
});

confirmPaymentYes.addEventListener("click", () => {
  // Ẩn modal xác nhận
  confirmPaymentModal.style.display = "none";

  // Hiện modal thành công
  checkoutSuccess.style.display = "flex";

  // 🧹 Xóa giỏ hàng sau khi thanh toán
  localStorage.removeItem("normalCart");
  localStorage.removeItem("auctionCart");

  // Cập nhật lại giao diện
  renderCart();
  updateCartIcon();

  // Ẩn thông báo sau 3.5s
  setTimeout(() => checkoutSuccess.style.display = "none", 3500);
});
confirmPaymentNo.addEventListener("click", () => {
  confirmPaymentModal.style.display = "none";
});

// ===== CLICK RA NGOÀI ĐỂ ĐÓNG MODAL =====
window.addEventListener("click", e => {
  if (e.target.classList.contains("modal")) e.target.style.display = "none";
});

// ===== ÁP DỤNG MÃ GIẢM GIÁ =====
const applyCouponBtn = document.getElementById("apply-coupon-btn");
const couponInput = document.getElementById("coupon-input");
const couponMsg = document.getElementById("coupon-message");

const validCoupons = {
  "LIBRA10": { type: "percent", value: 10 },     // Giảm 10%
  "FREESHIP": { type: "amount", value: 20000 },  // Giảm 20.000₫
  "VIP25": { type: "percent", value: 25 },       // Giảm 25%
};

applyCouponBtn.addEventListener("click", () => {
  const code = couponInput.value.trim().toUpperCase();
  const coupon = validCoupons[code];

  if (!coupon) {
    couponMsg.textContent = "❌ Mã không hợp lệ hoặc đã hết hạn.";
    couponMsg.style.color = "red";
    couponDiscount = 0;
    renderCart();
    return;
  }

  couponDiscount = coupon.value;
  discountType = coupon.type;
  couponMsg.textContent = `✅ Áp dụng thành công: ${
    coupon.type === "percent" ? coupon.value + "%" : coupon.value.toLocaleString() + "₫"
  }`;
  couponMsg.style.color = "green";
  renderCart();
});
