(function ($) {
    "use strict";

    // Spinner
    var spinner = function () {
        setTimeout(function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, 1);
    };
    spinner();


    // Initiate the wowjs animations
    if (typeof WOW !== "undefined") {
        new WOW().init();
    }


    // Sticky Navbar
    $(window).scroll(function () {
        if ($(this).scrollTop() > 200) {
            $('.sticky-top').addClass('shadow-sm').css('top', '0px');
        } else {
            $('.sticky-top').removeClass('shadow-sm').css('top', '-100px');
        }
    });


    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({ scrollTop: 0 }, 1500, 'easeInOutExpo');
        return false;
    });


    // Statistics counters
    if ($('[data-toggle="counter-up"]').length > 0 && typeof counterUp !== "undefined") {
        $('[data-toggle="counter-up"]').counterUp({
            delay: 10,
            time: 2000
        });
    }


    // Testimonials carousel (optional, only used where a carousel markup exists)
    if ($(".testimonial-carousel").length > 0 && typeof $.fn.owlCarousel !== "undefined") {
        $(".testimonial-carousel").owlCarousel({
            autoplay: true,
            smartSpeed: 1000,
            center: true,
            dots: false,
            loop: true,
            nav: true,
            navText: [
                '<i class="bi bi-arrow-left"></i>',
                '<i class="bi bi-arrow-right"></i>'
            ],
            responsive: {
                0: { items: 1 },
                768: { items: 2 }
            }
        });
    }


    // Portfolio filtering (optional, only used on the projects page)
    var $portfolio = $('.portfolio-container');
    if ($portfolio.length > 0 && typeof $.fn.isotope !== "undefined") {
        var portfolioIsotope = $portfolio.isotope({
            itemSelector: '.portfolio-item',
            layoutMode: 'fitRows'
        });
        $('#portfolio-flters li').on('click', function () {
            $('#portfolio-flters li').removeClass('active');
            $(this).addClass('active');
            portfolioIsotope.isotope({ filter: $(this).data('filter') });
        });
    }


    // Pre-fill the contact form from the Load Calculator result (shared session)
    var storedSummary = null;
    try {
        storedSummary = window.sessionStorage.getItem('prosolarCalculatorSummary');
    } catch (error) {
        storedSummary = null;
    }

    if (storedSummary) {
        var $prefillBox = $('#calculator-prefill');
        if ($prefillBox.length > 0) {
            $prefillBox.val(storedSummary);
            $('#calculator-prefill-wrap').show();
        }
    }

})(jQuery);