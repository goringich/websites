$(function(){

    /* gets elemets */
    var header = $("#header"), 
        introH = $("#intro").innerHeight(),
        scrollOffset = $(window).scrollTop()

    checkScroll(scrollOffset)


    /* fixed header */
    $(window).on("scroll", function(){
        scrollOffset = $(this).scrollTop()

        checkScroll(scrollOffset)
    })

    function checkScroll(scrollOffset){
        if (scrollOffset > introH){
            header.addClass("fixed")
        }else{
            header.removeClass("fixed")
        }
    }


     /* Smooth scroll */
    $("[data-scroll]").on("click", function(event) {
        event.preventDefault();
    
        var $this = $(this),
        blockId = $this.data('scroll'),
        blockOffset = $(blockId).offset().top - $('header').innerHeight();
    
        $("#nav a").removeClass('active')
        $this.addClass('active');
    
        if ($("#nav_toggle").hasClass('active')) {
            $(window).on("scroll", function() {
                $('#nav_toggle').removeClass("active");
                $("#nav").removeClass("active");
        });
        }
    
        $('.section__title').removeClass('bg-highlight')
        $(blockId + ' .section__title').addClass('bg-highlight')
    
        $("html, body").animate({
            scrollTop: blockOffset
        }, 500);
    })


    /* Menu nav toggle */
    $("#nav-toggle").on("click", function(event){
        event.preventDefault()

        $(this).toggleClass("active")
        $("#nav").toggleClass("active")
    })

    
    $(".nav_link").on("click", function(event){
        event.preventDefault()

        // При нажатии на ссылку окно закрывается
        $("#nav").removeClass("active")
        $("#nav-toggle").removeClass("active")
    })


    $(".header_logo").on("click", function(event){
        event.preventDefault()

        // При нажатии на заголовок окно закрывается и страница улетает вверх
        $("#nav").removeClass("active")
        $("#nav-toggle").removeClass("active")
    })
    
    $("[data-collapse]").on("click", function(event){
        event.preventDefault()

        var $this = $(this),
            blockId = $this.data("collapse")

        $this.toggleClass("active")
    })


    // slider
    $("[data-slider]").slick({
        infinite: true,
        speed: 750,
        slidesToShow: 1,
        slidesToScroll: 1
    })

    $('[data-slider]').slick({
        rtl: true
      });            
})
