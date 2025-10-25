let cart = [];

const cartBody = document.getElementById("cart-body");
const totalPriceLineEl = document.getElementById("total-price-line");
const cartCountEl = document.querySelector(".cart-count");
const modal = document.getElementById("deleteModal");
const confirmBtn = document.getElementById("confirmDelete");
const cancelBtn = document.getElementById("cancelDelete");

let deleteIndex = null;

// ===== Cập nhật giỏ hàng & hóa đơn =====
function renderCart() {
  cartBody.innerHTML = "";
  let total = 0;
  let totalQty = 0;

  if (cart.length === 0) {
    cartBody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align:center; padding:40px 0;">
          <img src="../images/gio hang.png" alt="Empty Cart" style="width:100px; opacity:0.7;">
          <p style="margin-top:15px; font-size:18px;">Giỏ hàng của bạn chưa có sản phẩm nào</p>
        </td>
      </tr>
    `;
  } else {
    cart.forEach((item, index) => {
      const itemTotal = item.price * item.qty;
      total += itemTotal;
      totalQty += item.qty;

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
            <input type="number" value="${item.qty}" min="0" onchange="manualQty(${index}, this.value)">
            <button onclick="changeQty(${index}, 1)">+</button>
          </div>
        </td>
        <td>${item.price.toLocaleString("vi-VN")}₫</td>
        <td>${itemTotal.toLocaleString("vi-VN")}₫</td>
      `;
      cartBody.appendChild(row);
    });
  }

  // Cập nhật icon giỏ hàng
  cartCountEl.textContent = totalQty;

  // Cập nhật hóa đơn tạm tính
  const totalItemsEl = document.getElementById("total-items");
  const totalAmountEl = document.getElementById("total-amount");
  if (totalItemsEl && totalAmountEl) {
    totalItemsEl.textContent = totalQty;
    totalAmountEl.textContent = total.toLocaleString("vi-VN") + "₫";
  }

  // Cập nhật tổng tiền dưới bảng giỏ hàng
  totalPriceLineEl.textContent = total.toLocaleString("vi-VN") + "₫";
}

// ===== Thêm / xóa / thay đổi số lượng =====
function addToCart(name, price, img) {
  const existingItem = cart.find(item => item.name === name);
  if (existingItem) {
    existingItem.qty += 1;
  } else {
    cart.push({ name, price, qty: 1, img });
  }
  renderCart();
}

function changeQty(index, delta) {
  cart[index].qty += delta;
  if (cart[index].qty <= 0) confirmRemove(index);
  else renderCart();
}

function manualQty(index, newVal) {
  const val = parseInt(newVal) || 0;
  cart[index].qty = val;
  if (val === 0) confirmRemove(index);
  else renderCart();
}

function confirmRemove(index) {
  deleteIndex = index;
  modal.style.display = "flex";
}

confirmBtn.onclick = () => {
  if (deleteIndex !== null) {
    cart.splice(deleteIndex, 1);
    renderCart();
  }
  modal.style.display = "none";
  deleteIndex = null;
};

cancelBtn.onclick = () => {
  modal.style.display = "none";
  deleteIndex = null;
};

// ===== Render lần đầu =====
renderCart();

// Gắn sự kiện cho các nút "Thêm vào giỏ"
document.addEventListener("DOMContentLoaded", () => {
const addButtons = document.querySelectorAll('.add-to-cart');

addButtons.forEach(button => {
  button.addEventListener('click', () => {
    const card = button.closest('.product-card');
    const name = card.querySelector('h3').innerText;
    const priceText = card.querySelector('p').innerText;
    const price = parseInt(priceText.replace(/\D/g, ''));
    const img = card.querySelector('img').src;

    addToCart(name, price, img);
  });
});
document.querySelectorAll('.cart-icon-click').forEach((icon, index) => {
    icon.addEventListener('click', () => {
      addButtons[index].click(); // kích hoạt nút tương ứng
    });
  });
});
// Render ban đầu
renderCart();


document.addEventListener("DOMContentLoaded", () => {
  // ===== DOM Elements =====
  const confirmBtn = document.querySelector(".confirm-btn");
  const requiredInputs = document.querySelectorAll(".required");
  const paymentOptions = document.getElementsByName("payment");
  const modalConfirm = document.getElementById("confirmPaymentModal");
  const modalSuccess = document.getElementById("checkout_success");

  const rememberCheckbox = document.getElementById("remember-info");
  const customerInputs = document.querySelectorAll(".receiver-info input");

  // ===== Ẩn lỗi =====
  function clearErrors() {
    requiredInputs.forEach(input => {
      input.classList.remove("error");
      const msg = input.parentElement.querySelector(".error-message");
      if (msg) msg.style.display = "none";
    });
    document.querySelectorAll(".payment-error").forEach(e => e.remove());
  }

  // ===== Kiểm tra email & SĐT =====
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
  function isValidPhone(phone) {
    return /^(0|\+84)\d{9}$/.test(phone);
  }

  // ===== Load dữ liệu lưu trước đó =====
  const savedInfo = localStorage.getItem("customerInfo");
  if (savedInfo) {
    const data = JSON.parse(savedInfo);
    customerInputs.forEach(input => {
      if (data[input.id]) input.value = data[input.id];
    });
    rememberCheckbox.checked = true;
  }

  // ===== Khi bấm xác nhận =====
  confirmBtn.addEventListener("click", (e) => {
    e.preventDefault();
    clearErrors();

    let valid = true;

    // Validate các input bắt buộc
    requiredInputs.forEach(input => {
      const value = input.value.trim();
      const errorSpan = input.parentElement.querySelector(".error-message");

      if (!value) {
        input.classList.add("error");
        if (errorSpan) errorSpan.style.display = "block";
        valid = false;
      } else {
        if (input.type === "email" && !isValidEmail(value)) {
          input.classList.add("error");
          if (errorSpan) errorSpan.textContent = "Email không hợp lệ";
          errorSpan.style.display = "block";
          valid = false;
        } else if (input.type === "tel" && !isValidPhone(value)) {
          input.classList.add("error");
          if (errorSpan) errorSpan.textContent = "Số điện thoại không hợp lệ";
          errorSpan.style.display = "block";
          valid = false;
        }
      }
    });

    // Kiểm tra phương thức thanh toán
    let paymentChecked = false;
    paymentOptions.forEach(p => { if (p.checked) paymentChecked = true; });
    if (!paymentChecked) {
      const paymentGroup = document.querySelector(".payment-options");
      const msg = document.createElement("div");
      msg.className = "payment-error";
      msg.textContent = "Vui lòng chọn phương thức thanh toán";
      msg.style.color = "#e74c3c";
      msg.style.fontSize = "12px";
      msg.style.marginTop = "4px";
      paymentGroup.appendChild(msg);
      valid = false;
    }

    if (!valid) return;

    // ===== Lưu thông tin địa chỉ nếu checkbox tick =====
    if (rememberCheckbox.checked) {
      const dataToSave = {};
      customerInputs.forEach(input => {
        dataToSave[input.id] = input.value;
      });
      localStorage.setItem("customerInfo", JSON.stringify(dataToSave));
    } else {
      localStorage.removeItem("customerInfo");
    }

    // ===== Hiển thị modal xác nhận =====
    modalConfirm.style.display = "flex";
  });

  // ===== Modal xác nhận thanh toán =====
  document.getElementById("confirmPaymentYes").addEventListener("click", () => {
    modalConfirm.style.display = "none";
    modalSuccess.style.display = "flex";
    setTimeout(() => {
      modalSuccess.style.display = "none";
    }, 3500);
  });

  document.getElementById("confirmPaymentNo").addEventListener("click", () => {
    modalConfirm.style.display = "none";
  });

  // ===== Click ngoài modal để đóng =====
  window.onclick = (e) => {
    if (e.target.classList.contains("modal")) e.target.style.display = "none";
  };
});