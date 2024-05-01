$(function(){
    
    // slider
    $('.slider__inner, .news__slider-inner--items').slick({
        nextArrow: '<button type="button" class="slick-btn slick-next"></button>',
        prevArrow: '<button type="button" class="slick-btn slick-prev"></button>',
        infinite: false
    });


    // select style
    $('select').styler();

    $(".header__btn-menu").on("click", function(){
        $(".menu ul").slideToggle();
    })


    /* gets elemets */
    var header = $("#header"), 
        introH = $("#header").innerHeight(),
        scrollOffset = $(window).scrollTop(),
        header__logo = $(".header__logo")
        
    checkScroll(scrollOffset)


    /* fixed header */
    $(window).on("scroll", function(){
        scrollOffset = $(this).scrollTop()

        checkScroll(scrollOffset)
    })

    function checkScroll(scrollOffset){
        if (scrollOffset > introH){
            header.addClass("fixed");
            header__logo.addClass("active");
        }else{
            header.removeClass("fixed")
            header__logo.removeClass("active");
        }
    }


     /* Smooth scroll */
    $("[data-scroll]").on("click", function(event) {
        event.preventDefault();
    
        var $this = $(this),
        blockId = $this.data('scroll'),
        blockOffset = $(blockId).offset().top - $('.header__top').innerHeight();

        // при нажатии на кнопку происходит скролл
        $("html, body").animate({
            scrollTop: blockOffset
            // scrollTop: blockOffset
        }, 500);
    })

    
    $(".menu__a").on("click", function(event){
        event.preventDefault()

        // При нажатии на ссылку окно закрывается
        $(".header__menu").style.display = "none"
    })


    $(".header__logo, header__logo header__logo--2 active").on("click", function(event){
        event.preventDefault()

        // При нажатии на заголовок окно закрывается и страница улетает вверх
        $(".header__menu").style.display = "none"
    })   
})

