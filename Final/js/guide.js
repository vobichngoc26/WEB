const menuLinks = document.querySelectorAll('.guide-menu a');
const sections = document.querySelectorAll('.guide-content section');

// Hàm highlight menu theo vị trí scroll
function updateActiveMenu() {
  const scrollPos = window.scrollY + 100; // offset top cho dễ nhìn

  sections.forEach((section, index) => {
    const sectionTop = section.offsetTop;
    const sectionBottom = sectionTop + section.offsetHeight;

    if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
      // Remove active cũ
      menuLinks.forEach(link => link.classList.remove('active'));
      // Set active cho link hiện tại
      menuLinks[index].classList.add('active');
    }
  });
}

// Khi scroll trang
window.addEventListener('scroll', updateActiveMenu);

// Khi click menu
menuLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    
    // Scroll nội dung mượt
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Highlight link sau khi scroll xong
    setTimeout(updateActiveMenu, 300);
  });
});
