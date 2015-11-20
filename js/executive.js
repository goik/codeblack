$(document).ready(function() {


    // FAQS JS

    var elementHeight = new Array();
    var doit;

    $(".faqs-listing-item").each(function(index) {
        elementHeight[index] = parseInt($(this).find(".faqs-listing-item-conetnet-fix-height").css("height")) + 70;
        clearTimeout(doit);
        doit = setTimeout(resizedw, 100);
    });

    /*
        $(window).resize(function() {
            $(".faqs-listing-item").each(function(index) {
                elementHeight[index] = parseInt($(this).find(".faqs-listing-item-conetnet-fix-height").css("height")) + 70;
                clearTimeout(doit);
                doit = setTimeout(resizedw, 100);
            });
        });
    */

    $("body .faqs-listing-item").each(function(index){
        fixHeight=parseInt($(this).find(".height-crop").css("height"));
        contentHeight=parseInt($(this).find(".height-crop-detect").css("height"));
        if (contentHeight<fixHeight){
            $(this).find(".read-more-cell-position").css({display:"none"});
        }else{
            $(this).find(".read-more-cell-position").css({display:"block"});
        }
    });

    function resizedw() {
        for (var i = 0; i < elementHeight.length; i++) {
            if (elementHeight[i] > elementHeight[0]) {
                elementHeight[0] = elementHeight[i];
            }
        }
        $(".faqs-listing-item").each(function(index) {
            $(this).find(".faqs-listing-item-conetnet").css({
                minHeight: elementHeight[0]
            });
            newHeight = parseInt(elementHeight[0]);
            $(this).find(".faqs-listing-item-conetnet-abs").css({
                minHeight: newHeight
            });
        });

        for (var i = 0; i < elementHeight.length; i++) {
            elementHeight[i] = 0
        }
    }

    var getHeightCrop;

    $("body").on("click", ".read-more-btn", function() {

        closeTabs();

        $(this).addClass("d-none");
        $(this).parent().find(".close-btn").removeClass("d-none");

        getHeightCrop=$(this).closest(".faqs-listing-item").find(".height-crop").css("height");
        heightDetect = $(this).closest(".faqs-listing-item").find(".height-crop-detect").css("height");
        heightDetect = parseInt(heightDetect) + 70;
        $(this).closest(".faqs-listing-item").find(".faqs-listing-item-conetnet-abs").stop().animate({height: heightDetect}, 200);
        $(this).closest(".faqs-listing-item").find(".height-crop").stop().animate({height: heightDetect}, 350);

        $(".faqs-listing-item").each(function() {
            $(this).addClass("opacity70");
        });
        $(this).closest(".faqs-listing-item").removeClass("opacity70").addClass("current_f");
        return false;
    });


    $("body").on("click", ".close-btn", function() {
        $(this).addClass("d-none");
        $(this).parent().find(".read-more-btn").removeClass("d-none");
        $(this).closest(".faqs-listing-item").find(".faqs-listing-item-conetnet-abs").stop().animate({height: getHeightCrop}, 300);
        $(this).closest(".faqs-listing-item").find(".height-crop").stop().animate({height: getHeightCrop}, 150);
        $(".faqs-listing-item").each(function(){
            $(this).removeClass("opacity70").removeClass("current_f");
        });
        return false;
    });



    function closeTabs(){
        $(".faqs-listing-item").each(function(){
            $(this).find(".close-btn").addClass("d-none");
            $(this).find(".read-more-btn").removeClass("d-none");
            $(this).find(".faqs-listing-item-conetnet-abs").stop().animate({height: getHeightCrop}, 300);
            $(this).find(".height-crop").stop().animate({height: getHeightCrop}, 150);
            $(this).removeClass("opacity70").removeClass("current_f");
        });
    }

    $("body").click(function(){
        closeTabs();
    })

    $("body").on("click",".faqs-listing-item",function(){
        return false;
    });


    // END FAQS JS


    //read-more-cell-position

    //.faqs-listing-item-conetnet-abs



    //class="faqs-listing-item faqs-item current_f" faqs-listing-item-conetnet
    /*

        $("body").on("click", ".read-more-btn", function() {
            heightDetect = $(this).closest(".faqs-listing-item").find(".height-crop-detect").css("height");
            heightDetect = parseInt(heightDetect) + 70;
            $(this).closest(".faqs-listing-item").find(".faqs-listing-item-conetnet-abs").stop().animate({
                height: heightDetect
            }, 300);
            $(this).closest(".faqs-listing-item").find(".height-crop").stop().animate({
                height: heightDetect
            }, 600)
        });
    */




    // $("body").on("click", ".faqs-listing-item", function() {
    //     $(".faqs-listing-item").each(function() {
    //         $(this).addClass("opacity70");
    //     });
    //     $(this).removeClass("opacity70").addClass("current_f");
    // });


    //read-more-btn

    var dd;

    $("body").on("mouseenter", ".tool-link-item", function() {
        clearTimeout(dd);
        $(this).find(".dd-profile").css({
            overflow: "visible"
        });
        $(this).addClass("dd-over");
    });

    $("body").on("mouseleave", ".tool-link-item", function() {
        $(this).removeClass("dd-over");
        dd = setTimeout(function() {
            $(".dd-profile").css({
                overflow: "hidden"
            });
        }, 400);
    });


    /**/


    $("body").on("focus", ".default-field", function() {
        $(this).closest(".field-deco-out-pad").find(".field-deco").addClass("focus-field");
    });

    $("body").on("blur", ".default-field", function() {
        $(this).closest(".field-deco-out-pad").find(".field-deco").removeClass("focus-field");
    });


    $('a[href*=#]:not([href=#])').click(function() {
        if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
            var target = $(this.hash);
            target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
            if (target.length) {
                $('html,body').animate({
                    scrollTop: target.offset().top
                }, 1200);
                return false;
            }
        }
    });

    $(".tb").each(function() {
        $(this).attr("target", "_blank");
    });

    var getAlt = "",
        getTitle = "";
    $("body").on("mouseenter", ".hta", function() {
        tag = $(this);
        getAlt = tag.attr("alt");
        getTitle = tag.attr("title");
        tag.attr("alt", "");
        tag.attr("title", "");
    });

    $("body").on("mouseleave", ".hta", function() {
        tag = $(this);
        tag.attr("alt", getAlt);
        tag.attr("title", getTitle);
    });

    /*=======================*/
    var ddTeacher1 = $(".home-slide").owlCarousel({
        items: 1,
        navigation: true,
        slideSpeed: 800,
        singleItem: true,
        transitionStyle: "fadeUp",
        responsive: true,
        afterAction: function(elem) {}
    });
    $(".main-home-slide-prev").click(function() {
        ddTeacher1.trigger('owl.prev');
        return false;
    });
    $(".main-home-slide-next").click(function() {
        ddTeacher1.trigger('owl.next');
        return false;
    });
    /*=======================*/

    /*=======================*/
    var carou1 = $(".js-carousel-list-cell-1").owlCarousel({
        items: 7,
        navigation: true,
        slideSpeed: 800,
        transitionStyle: "fadeUp",
        responsive: true,
        afterAction: function(elem) {}
    });
    $(".js-carousel-prev-1").click(function() {
        carou1.trigger('owl.prev');
        return false;
    });
    $(".js-carousel-next-1").click(function() {
        carou1.trigger('owl.next');
        return false;
    });
    /*=======================*/

    /*=======================*/
    var carou2 = $(".js-carousel-list-cell-2").owlCarousel({
        items: 7,
        navigation: true,
        slideSpeed: 800,
        transitionStyle: "fadeUp",
        responsive: true,
        afterAction: function(elem) {}
    });
    $(".js-carousel-prev-2").click(function() {
        carou2.trigger('owl.prev');
        return false;
    });
    $(".js-carousel-next-2").click(function() {
        carou2.trigger('owl.next');
        return false;
    });
    /*=======================*/

    /*=======================*/
    var carou3 = $(".js-carousel-list-cell-3").owlCarousel({
        items: 7,
        navigation: true,
        slideSpeed: 800,
        transitionStyle: "fadeUp",
        responsive: true,
        afterAction: function(elem) {}
    });
    $(".js-carousel-prev-3").click(function() {
        carou3.trigger('owl.prev');
        return false;
    });
    $(".js-carousel-next-3").click(function() {
        carou3.trigger('owl.next');
        return false;
    });
    /*=======================*/


    /*

    */
    /*
    if ($("div").hassClass("main-home-content-place") || $("div").hassClass("FILM-PAGE")){
    }
    */

    var nav = "#top";

    if ($("div").hasClass("main-home-content-place") == true) {
        nav = $('.main-home-content-place');
    }

    if ($("div").hasClass("FILM-PAGE") == true) {
        nav = $('.FILM-PAGE');
    }


    var navHomeY = nav.offset().top - 150;
    var isFixed = false;
    var $w = $(window);

    var scrollTop = $w.scrollTop();
    var shouldBeFixed = scrollTop > navHomeY;

    if (shouldBeFixed && !isFixed) {
        mainMenuBarVisible();
        isFixed = true;
    } else if (!shouldBeFixed && isFixed) {
        mainMenuBarHide();
        isFixed = false;
    }

    $w.scroll(function() {
        var scrollTop = $w.scrollTop();
        var shouldBeFixed = scrollTop > navHomeY;
        if (shouldBeFixed && !isFixed) {
            mainMenuBarVisible();
            isFixed = true;
        } else if (!shouldBeFixed && isFixed) {
            mainMenuBarHide();
            isFixed = false;
        }
    });



    $(document).scroll(function() {
        if ($(document).scrollTop() >= 50) {
            $(".main-home-slider-place").addClass("main-home-slider-blur");
        } else {
            $(".main-home-slider-place").removeClass("main-home-slider-blur");
        }
    });


    function mainMenuBarHide() {
        $(".main-header").removeClass("main-header-fill");
    }

    function mainMenuBarVisible() {
        $(".main-header").addClass("main-header-fill");
    }

    /*GENRES MOUSEENTER MOUSELEAVE*/
    $("body").on("mouseenter", ".dd-cell", function() {
        dd = $(this).find(".dd-bar");
        dd.css({
            display: "block"
        });
        dd.stop().animate({
            opacity: 1,
            top: 116
        }, 300, function() {});
    });

    $("body").on("mouseleave", ".dd-cell", function() {
        dd.stop().animate({
            opacity: 0,
            top: 130
        }, 300, function() {
            $(this).css({
                display: "none"
            });
        });
    });
    /*END GENRES MOUSEENTER MOUSELEAVE*/


    /*SEARCH OVER*/
    $("body").on("mouseenter", ".search-item", function() {

        $(".search-step-1").stop().animate({
            opacity: 0
        }, function() {
            $(this).css({
                display: "none"
            });
        });
        $(".search-step-2").css({
            display: "block"
        });
        $(".search-step-2").stop().animate({
            opacity: 1
        }, function() {});
    });

    $("body").on("mouseleave", ".search-item", function() {
        if (search == false) {
            $(".search-step-2").stop().animate({
                opacity: 0
            }, function() {
                $(this).css({
                    display: "none"
                });
            });
            $(".search-step-1").css({
                display: "block"
            });
            $(".search-step-1").stop().animate({
                opacity: 1
            }, function() {});
        }
    });

    var search = false;
    $("body").on("focus", ".search-def-inp", function() {
        search = true;
    });

    $("body").on("blur", ".search-def-inp", function() {
        search = false;
        $(".search-step-2").stop().animate({
            opacity: 0
        }, function() {
            $(this).css({
                display: "none"
            });
        });
        $(".search-step-1").css({
            display: "block"
        });
        $(".search-step-1").stop().animate({
            opacity: 1
        }, function() {});
    });
    /*END SEARCH OVER*/
    /*
    	$("a").click(function(){
    		return false;
    	});
    	*/

    $.fn.preload = function(fn) {
        var len = this.length,
            i = 0;
        return this.each(function() {
            var tmp = new Image,
                self = this;
            if (fn) tmp.onload = function() {
                fn.call(self, 100 * ++i / len, i === len);
            };
            tmp.src = this.src;
            $(this).addClass("item-visible");
        });
    };

    //$('img').preload(function(perc,done){});

    $(".check-label").each(function() {
        if ($(this).find(".default-checkbox").prop("checked") == true) {
            $(this).addClass("check");
        } else {
            $(this).removeClass("check");
        }
    });

    $("body").on("click", ".check-label", function() {
        if ($(this).find(".default-checkbox").prop("checked") == true) {
            $(this).addClass("check");
        } else {
            $(this).removeClass("check");
        }
    });


});
