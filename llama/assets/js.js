$(function(){
    $('.gallery__inner').magnificPopup({
		delegate: 'a',
        type: 'image',
        // max-width: "50%",
        // max-height: "50%",
		tLoading: 'Loading image #%curr%...',
		mainClass: 'mfp-img-mobile',
		gallery: {
			enabled: true,
			navigateByImgClick: true,
			preload: [0,1] // Will preload 0 - before current, and 1 after the current image
		},
		image: {
			tError: '<a href="%url%">The image #%curr%</a> could not be loaded.',
			titleSrc: function(item) {
				return item.el.attr('title') + '<small></small>';
			}
		}
    });
    

    /* Smooth scroll */
    $("[data-scroll]").on("click", function(event) {
        event.preventDefault();
    
        var $this = $(this),
        blockId = $this.data('scroll'),
        blockOffset = $(blockId).offset().top - $('.header__inner-top').innerHeight();

        // при нажатии на кнопку происходит скролл
        $("html, body").animate({
            scrollTop: blockOffset
        }, 500);
    })

    // select style
    // $('select').styler();

    $("#nav-toggle").on("click", function(event){
        event.preventDefault()

        $(this).toggleClass("active")
        $(".nav-toggle").toggleClass("active")
        $(".nav__2").toggleClass("active")
    })

    $(".nav__link").on("click", function(event){
        event.preventDefault()

        // При нажатии на ссылку окно закрывается
        $("#nav").removeClass("active")
        $("#nav-toggle").removeClass("active")
    }, 200)

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

    $(".header__logo, header__logo header__logo--2 active").on("click", function(event){
        event.preventDefault()

        $(".nav").style.display = "none"
    })   
})
