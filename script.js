document.addEventListener('DOMContentLoaded', () => {

    // 1. Hero Slider Logic
    const slides = document.querySelectorAll('.slide');
    const nextBtn = document.querySelector('.next-slide');
    const prevBtn = document.querySelector('.prev-slide');
    let currentSlide = 0;
    const slideInterval = 5000; // 5 seconds

    function showSlide(index) {
        // Wrap around logic
        if (index >= slides.length) currentSlide = 0;
        else if (index < 0) currentSlide = slides.length - 1;
        else currentSlide = index;

        // Update classes
        slides.forEach(slide => slide.classList.remove('active'));
        slides[currentSlide].classList.add('active');
    }

    function nextSlide() {
        showSlide(currentSlide + 1);
    }

    function prevSlide() {
        showSlide(currentSlide - 1);
    }

    // Event Listeners for Controls
    if (nextBtn) nextBtn.addEventListener('click', () => {
        nextSlide();
        resetTimer();
    });

    if (prevBtn) prevBtn.addEventListener('click', () => {
        prevSlide();
        resetTimer();
    });

    // Auto Advance
    let slideTimer = setInterval(nextSlide, slideInterval);

    function resetTimer() {
        clearInterval(slideTimer);
        slideTimer = setInterval(nextSlide, slideInterval);
    }

    // 2. Mobile Menu Toggle
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navList = document.querySelector('.nav-list');

    if (mobileBtn && navList) {
        mobileBtn.addEventListener('click', () => {
            navList.classList.toggle('show');
            mobileBtn.classList.toggle('active');
        });
    }
    // Close menu when a link is clicked
    const navLinks = document.querySelectorAll('.nav-list a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navList && navList.classList.contains('show')) {
                navList.classList.remove('show');
            }
        });
    });

    // 3. News Ticker Animation (Simple Pause on Hover)
    const newsTicker = document.querySelector('.ticker-content');
    if (newsTicker) {
        newsTicker.addEventListener('mouseover', () => {
            newsTicker.style.animationPlayState = 'paused';
        });
        newsTicker.addEventListener('mouseout', () => {
            newsTicker.style.animationPlayState = 'running';
        });
    }
});
