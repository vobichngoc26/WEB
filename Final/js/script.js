  let cart = [
    { name: "Bàn về sự chậm rãi", price: 100000, qty: 1, img: "../images/chậm rãi.png" },
    { name: "Truy đuổi khói tuyết", price: 150000, qty: 1, img: "../images/truy đuổi khói tuyết.png" }
  ];

  const cartBody = document.getElementById("cart-body");
  const totalPriceLineEl = document.getElementById("total-price-line");
  const modal = document.getElementById("deleteModal");
  const confirmBtn = document.getElementById("confirmDelete");
  const cancelBtn = document.getElementById("cancelDelete");
  const cartCountEl = document.querySelector(".cart-count");

  let deleteIndex = null;

  function updateCartCount() {
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    cartCountEl.textContent = totalQty;
  }

  function renderCart() {
    cartBody.innerHTML = "";
    let total = 0;

    if (cart.length === 0) {
      cartBody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align:center; padding:40px 0;">
            <img src="../images/gio hang.png" alt="Empty Cart" style="width:100px; opacity:0.7;">
            <p style="margin-top:15px; font-size:18px;">Giỏ hàng của bạn chưa có sản phẩm nào</p>
          </td>
        </tr>
      `;
      totalPriceLineEl.textContent = "0₫";
      updateCartCount();
      return;
    }

    cart.forEach((item, index) => {
      const itemTotal = item.price * item.qty;
      total += itemTotal;

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

    totalPriceLineEl.textContent = total.toLocaleString("vi-VN") + "₫";
    updateCartCount();
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

  renderCart();

  // -------------------------------
  // 📦 QUẢN LÝ ĐỊA CHỈ GIAO HÀNG
  // -------------------------------
  function showAddressForm() {
    document.getElementById("address-form").style.display = "block";
    document.getElementById("has-address-section").style.display = "none";
    document.getElementById("no-address-section").style.display = "none";
  }

  function saveAddress() {
    const name = document.getElementById("inputName").value.trim();
    const phone = document.getElementById("inputPhone").value.trim();
    const address = document.getElementById("inputAddress").value.trim();
    const typeRadio = document.querySelector('input[name="addrType"]:checked');
    const type = typeRadio ? typeRadio.value : "";

    if (!name || !phone || !address || !type) {
      document.getElementById("err_hoten").style.display = "block";
      return;
    }

    document.getElementById("err_hoten").style.display = "none";

    const maskedPhone = "*".repeat(phone.length - 3) + phone.slice(-3);

    // hiển thị địa chỉ
    document.getElementById("addr-display").innerText =
      `${name.toUpperCase()} | ${maskedPhone} | ${type}`;
    document.getElementById("addr-detail-display").innerText = address;

    // chuyển trạng thái hiển thị
    document.getElementById("address-form").style.display = "none";
    document.getElementById("has-address-section").style.display = "block";
    document.getElementById("no-address-section").style.display = "none";

    // lưu vào localStorage
    localStorage.setItem("userAddress", JSON.stringify({
      name,
      phone: maskedPhone,
      address,
      type
    }));
  }

  window.onload = () => {
    const data = localStorage.getItem("userAddress");
    if (data) {
      const addr = JSON.parse(data);
      document.getElementById("addr-display").innerText =
        `${addr.name.toUpperCase()} | ${addr.phone} | ${addr.type}`;
      document.getElementById("addr-detail-display").innerText = addr.address;

      document.getElementById("has-address-section").style.display = "block";
      document.getElementById("no-address-section").style.display = "none";
    } else {
      document.getElementById("no-address-section").style.display = "block";
      document.getElementById("has-address-section").style.display = "none";
    }
  };
