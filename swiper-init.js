const swiper = new Swiper('.swiper-container', {
    slidesPerView: 3,
    spaceBetween: 40,
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    breakpoints: {
        600: {
          slidesPerView: 1,
          spaceBetween: 40,
        },
        800: {
          slidesPerView: 3,
          spaceBetween: 40,
        }
    },
});