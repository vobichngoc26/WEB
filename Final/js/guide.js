document.addEventListener('DOMContentLoaded', () => {
    // ==== Cập nhật số lượng giỏ hàng trên icon nếu hàm tồn tại ====
    if (typeof updateCartIcon === 'function') {
        updateCartIcon();
    }

    // ==== Lấy tất cả link menu và các section ====
    const menuLinks = document.querySelectorAll('.guide-menu a');
    const sections = document.querySelectorAll('.guide-content section');

    // ==== Hàm hiển thị section tương ứng và highlight menu ====
    function showSection(index) {
        sections.forEach((section, i) => {
            section.classList.toggle('active', i === index);
        });
        menuLinks.forEach((link, i) => {
            link.classList.toggle('active', i === index);
        });
    }

    // ==== Gán sự kiện click cho menu ====
    menuLinks.forEach((link, index) => {
        link.addEventListener('click', e => {
            e.preventDefault(); // Ngăn scroll mặc định
            showSection(index);
        });
    });

    // ==== Khởi tạo: hiển thị section đầu tiên ====
    showSection(0);

    // ==== Hiệu ứng hover cho hình ảnh trong guide-content ====
    const images = document.querySelectorAll('.guide-content img');
    images.forEach(img => {
        img.style.transition = 'transform 0.3s, box-shadow 0.3s';
        img.addEventListener('mouseover', () => {
            img.style.transform = 'scale(1.05)';
            img.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
        });
        img.addEventListener('mouseout', () => {
            img.style.transform = 'scale(1)';
            img.style.boxShadow = 'none';
        });
    });
});
