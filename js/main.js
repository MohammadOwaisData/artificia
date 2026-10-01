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
    // On small screens the header must stay pinned: it holds the only menu
    // toggle, so hiding it on scroll-down would trap the visitor.
    var lastScrollTop = 0;

    function updateNavbar() {
        var $navbar = $('.sticky-top');
        if ($navbar.length === 0) {
            return;
        }

        var scrollTop = $(window).scrollTop();

        if (window.matchMedia("(max-width: 991.98px)").matches) {
            $navbar.addClass('shadow-sm').css('top', '0px');
        } else if (scrollTop > 200 && scrollTop > lastScrollTop) {
            $navbar.removeClass('shadow-sm').css('top', '-100px');
        } else {
            $navbar.addClass('shadow-sm').css('top', '0px');
        }

        lastScrollTop = scrollTop;
    }

    $(window).scroll(updateNavbar);
    $(window).resize(updateNavbar);
    updateNavbar();


    // Collapse the mobile menu after a link is followed, otherwise the panel
    // stays open over the page the visitor just navigated to.
    $('.navbar-collapse a[href]').on('click', function () {
        var $collapse = $('#navbarCollapse');
        if ($collapse.length === 0 || !$collapse.hasClass('show')) {
            return;
        }

        var href = $(this).attr('href');
        if (!href || href.charAt(0) === '#' || href.indexOf('.html') === -1) {
            return;
        }

        $collapse.removeClass('show');
        $('.navbar-toggler').attr('aria-expanded', 'false');
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