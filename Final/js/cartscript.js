// ===== GIỎ HÀNG =====
function getCart(type = "normalCart") {
  return JSON.parse(localStorage.getItem(type)) || [];
}

function setCart(cart, type = "normalCart") {
  localStorage.setItem(type, JSON.stringify(cart));
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
    auctionCart.forEach(item => {
      const shipFee = 25000;
      const itemTotal = item.winPrice + shipFee;
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>
          <div class="product-info">
            <img src="${item.img}" alt="${item.name}">
            <div class="details">
              <span style="font-weight:bold;">${item.name}</span><br>
              <small>Tác giả: ${item.author || "Không rõ"}</small><br>
              <small style="color:#e67e22;">⏰ Thanh toán trong vòng 48h</small>
            </div>
          </div>
        </td>
        <td>${item.winPrice.toLocaleString("vi-VN")}₫</td>
        <td>${shipFee.toLocaleString("vi-VN")}₫</td>
        <td>${itemTotal.toLocaleString("vi-VN")}₫</td>
      `;
      auctionCartBody.appendChild(row);
    });
  }

  // ===== CẬP NHẬT TỔNG =====
  const totalNormal = normalCart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const totalAuction = auctionCart.reduce((sum, i) => sum + i.winPrice + 25000, 0);
  const totalAmount = totalNormal + totalAuction;
  const totalItems = normalCart.reduce((sum, i) => sum + i.qty, 0) + auctionCart.length; // tính số lượng thực tế

  document.getElementById("normal-total").textContent = totalNormal.toLocaleString("vi-VN") + "₫";
  document.getElementById("auction-total").textContent = totalAuction.toLocaleString("vi-VN") + "₫";
  document.getElementById("total-amount").textContent = totalAmount.toLocaleString("vi-VN") + "₫";
  document.getElementById("total-items").textContent = totalItems;

  // ===== CẬP NHẬT ICON GIỎ HÀNG HEADER =====
  const cartCountEl = document.querySelector(".cart-count");
  if(cartCountEl) cartCountEl.textContent = totalItems;
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

  confirmBtn.addEventListener("click", e => {
    e.preventDefault();
    clearErrors();
    let valid = true;

    requiredInputs.forEach(input => {
      const value = input.value.trim();
      const msg = input.parentElement.querySelector(".error-message");
      if (!value) {
        input.classList.add("error");
        if (msg) msg.style.display = "block";
        valid = false;
      } else if (input.type === "email" && !isValidEmail(value)) {
        input.classList.add("error");
        if (msg) { msg.textContent = "Email không hợp lệ"; msg.style.display = "block"; }
        valid = false;
      } else if (input.type === "tel" && !isValidPhone(value)) {
        input.classList.add("error");
        if (msg) { msg.textContent = "Số điện thoại không hợp lệ"; msg.style.display = "block"; }
        valid = false;
      }
    });

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

  document.getElementById("confirmPaymentYes").addEventListener("click", () => {
    modalConfirm.style.display = "none";
    modalSuccess.style.display = "flex";
    setTimeout(() => modalSuccess.style.display = "none", 3500);
  });
  document.getElementById("confirmPaymentNo").addEventListener("click", () => modalConfirm.style.display = "none");

  window.onclick = e => { if (e.target.classList.contains("modal")) e.target.style.display = "none"; };

  // ===== QUẢN LÝ ĐỊA CHỈ =====
  const addAddressBtn = document.getElementById("addAddressBtn");
  const addressFormContainer = document.getElementById("address-form-container");
  const cancelAddressBtn = document.getElementById("cancelAddressBtn");
  const saveAddressBtn = document.getElementById("saveAddressBtn");
  const savedContainer = document.getElementById("address-list");

  function renderAddress() {
    const saved = localStorage.getItem("savedAddress");
    if (!saved) return;
    const data = JSON.parse(saved);
    savedContainer.innerHTML = `
      <div class="saved-address-box">
        <div class="address-header">
          <strong>${data.fullName}</strong> | ${data.phone} | ${data.email || "(Không có email)"}
        </div>
        <div class="address-body">
          ${data.address}<br>
          <div class="address-tags">
            <span class="tag">${data.type}</span>
            ${data.isDefault ? `<span class="tag default">Mặc định</span>` : ""}
          </div>
          ${data.note ? `<p class="note">${data.note}</p>` : ""}
        </div>
        <div class="address-actions">
          <button class="edit-address">Sửa</button>
          <button class="delete-address">Xóa</button>
        </div>
      </div>
    `;
    savedContainer.style.display = "block";
    addAddressBtn.style.display = "none";
  }

  renderAddress();

  addAddressBtn.addEventListener("click", e => {
    e.preventDefault();
    addressFormContainer.style.display = "block";
    window.scrollTo({ top: addressFormContainer.offsetTop - 50, behavior: "smooth" });
  });

  cancelAddressBtn.addEventListener("click", e => {
  e.preventDefault();
  addressFormContainer.style.display = "none"; // ẩn form

  const saved = localStorage.getItem("savedAddress");
  if (saved) {
    // Có địa chỉ lưu → hiện lại danh sách
    renderAddress();
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

    localStorage.setItem("savedAddress", JSON.stringify({ fullName, phone, email, address, type, isDefault, note }));
    addressFormContainer.style.display = "none";
    renderAddress();
  });

  savedContainer.addEventListener("click", e => {
    const data = JSON.parse(localStorage.getItem("savedAddress") || "{}");
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
      if(confirm("Bạn có chắc muốn xóa địa chỉ này không?")) {
        localStorage.removeItem("savedAddress");
        savedContainer.style.display = "none";
        addAddressBtn.style.display = "inline-block";
      }
    }
  });
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

// ===== XÓA ĐỊA CHỈ =====
let deletingAddress = false;
savedContainer.addEventListener("click", e => {
  if (e.target.classList.contains("delete-address")) {
    deletingAddress = true;
    deleteAddressModal.style.display = "flex";
  }
});

confirmDeleteAddressBtn.addEventListener("click", () => {
  if (deletingAddress) {
    localStorage.removeItem("savedAddress");
    savedContainer.style.display = "none";
    addAddressBtn.style.display = "inline-block";
    deletingAddress = false;
  }
  deleteAddressModal.style.display = "none";
});

cancelDeleteAddressBtn.addEventListener("click", () => {
  deletingAddress = false;
  deleteAddressModal.style.display = "none";
});

// ===== THANH TOÁN =====
document.querySelector(".confirm-btn").addEventListener("click", e => {
  e.preventDefault();
  // kiểm tra form ở đây
  // nếu hợp lệ:
  confirmPaymentModal.style.display = "flex";
});

confirmPaymentYes.addEventListener("click", () => {
  confirmPaymentModal.style.display = "none";
  checkoutSuccess.style.display = "flex";
  setTimeout(() => checkoutSuccess.style.display = "none", 3500);
});

confirmPaymentNo.addEventListener("click", () => {
  confirmPaymentModal.style.display = "none";
});

// ===== CLICK RA NGOÀI ĐỂ ĐÓNG MODAL =====
window.addEventListener("click", e => {
  if (e.target.classList.contains("modal")) e.target.style.display = "none";
});
