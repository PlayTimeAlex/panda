Share = {
    //https://vk.com/dev/share_details
    vkontakte: function(purl, ptitle, pimg, text) {
        url  = 'http://vkontakte.ru/share.php?';
        url += 'url='          + encodeURIComponent(purl);
        url += '&title='       + encodeURIComponent(ptitle);
        url += '&description=' + encodeURIComponent(text);
        url += '&image='       + encodeURIComponent(pimg);
        url += '&noparse=true';
        Share.popup(url);
    },
    odnoklassniki: function(purl, text) {
        url  = 'http://www.odnoklassniki.ru/dk?st.cmd=addShare&st.s=1';
        url += '&st.comments=' + encodeURIComponent(text);
        url += '&st._surl='    + encodeURIComponent(purl);
        Share.popup(url);
    },
    facebook: function(purl) {
        url  = 'https://www.facebook.com/sharer/sharer.php?';
        url += 'u='       + encodeURIComponent(purl);
        Share.popup(url);
    },
    mailru: function(purl, ptitle, pimg, text) {
        url  = 'http://connect.mail.ru/share?';
        url += 'url='          + encodeURIComponent(purl);
        url += '&title='       + encodeURIComponent(ptitle);
        url += '&description=' + encodeURIComponent(text);
        url += '&image_url='    + encodeURIComponent(pimg);
        Share.popup(url)
    },
    gplus: function(purl) {
        url  = 'https://plus.google.com/share?';
        url += 'url='          + encodeURIComponent(purl);
        Share.popup(url)
    },
    popup: function(url) {
        window.open(url,'','toolbar=0,status=0,width=626,height=436');
    }
};

(function($) {
    $(document).ready(function(){

        $('.b-spoiler__link').on('touchstart click', function(event) {
            event.preventDefault();

            var parent = $(this).closest('.b-spoiler');

            if(parent.hasClass('open')) {
                $('.b-spoiler__content', parent).stop().slideUp('fast', function(){
                    parent.removeClass('open');
                });
            } else {
                $('.b-spoiler__content', parent).stop().slideDown('fast', function(){
                    parent.addClass('open');
                });
            }
        });

        $('.b-post__gif').on('touchend click', function(){
            if($(this).hasClass('preload')){
                var $img = $(this).children('img'),
                    src = $img.attr('src');
                $parent = $(this).closest('.b-post__content'),
                    $item = $parent.children('.b-post__expand'),
                    $cut = $('.b-post__cut', $parent);
                $parent.css({'maxHeight': 'none', 'height': 'auto'});
                if($cut.length){
                    $cut.slideDown('fast', function(){
                        $item.hide('fast');
                    });
                } else {
                    $item.hide('fast');
                }
                $img.attr('src', $img.data('img')).data('img', src);
                $(this).removeClass('preload');
            } else {
                var $img = $(this).children('img'),
                    src = $img.attr('src');
                $img.attr('src', $img.data('img')).data('img', src);
                $(this).addClass('preload');
            }
            return false;
        });

        $('.js-show-share').on('touchstart click', function(){
            var $el = $(this).siblings('.b-post__m-share');
            $el.css('display', 'block').animate({
                opacity: 1
            }, 200);
            $('body').css('overflow', 'hidden');
            return false;
        });

        $('.b-post__m-share-cl').on('touchstart click', function(){
            $(this).parent().animate({
                opacity: 0
            }, 200, function(){
                $(this).css('display', 'none');
            });
            $('body').css('overflow', 'visible');
            return false;
        });

        $('.anim-scroll').on('touchstart click', function(){
            $('.anim-scroll').removeClass('current');
            $(this).addClass('current');
            scrollto_c($(this).prop("hash"));
            return false;
        });

        $('body').on('touchstart click', '.b-post__expand', function(){
            var $parent = $(this).parent(),
                $item = $(this),
                $cut = $('.b-post__cut', $parent);
            $parent.css({'maxHeight': 'none', 'height': 'auto'});
            if($cut.length){
                $('.b-post__cut', $parent).slideDown('fast', function(){
                    $item.hide('fast');
                });
            } else {
                $item.hide('fast');
            }
        });

        $('.js-file').styler({
            filePlaceholder: '',
            fileBrowse: 'Добавить изображение'
        });

        var replyTemplate = $('#template_reply');
        $('.js-reply').click(function(){
            $('.js-reply__block').remove();
            $('.b-comments__bottom').show('fast');
            var $parent = $(this).closest('.b-comments__content');
            $parent.append(replyTemplate.render());
            $parent.children('.b-comments__bottom').hide('fast');
            $('.js-file').styler({
                filePlaceholder: '',
                fileBrowse: 'Изображение'
            });
        });

        $('.b-footer__scrooltop').click(function(){
            $('html, body').animate({
                scrollTop: 0
            }, 500);
        });

        $('.b-comments__show-nrati').on('touchstart click', function(){
            var $parent = $(this).closest('.b-comments__item'),
                $content = $parent.find('.b-comments__text'),
                $item = $parent.find('.b-comments__nrati');
                $content.show('fast');
                $item.hide('fast').remove();
            return false;
        });

        var $wrap_content = $('.wrap__content');

        $('.js-sidebar-control').on('touchend click', function(){
            if($wrap_content.hasClass('animating')) return false;

            $wrap_content.addClass('animating');

            showSidebar();

            return false;
        });

        $('.js-search-control').on('touchend click', function(){
            if($wrap_content.hasClass('animating')) return false;

            $wrap_content.addClass('animating');

            showSearch();

            return false;
        });

        $("body").swipe({
            swipeLeft:function(event, direction, distance, duration, fingerCount) {
                if($wrap_content.hasClass('animating') || $wrap_content.hasClass('show-search')) return false;

                $wrap_content.addClass('animating');

                if($wrap_content.hasClass('show-sidebar')) {
                    showSidebar();

                    return false;
                }

                showSearch();


            },
            swipeRight:function(event, direction, distance, duration, fingerCount) {
                if($wrap_content.hasClass('animating') || $wrap_content.hasClass('show-sidebar')) return false;

                $wrap_content.addClass('animating');

                if($wrap_content.hasClass('show-search')) {
                    showSearch();

                    return false;
                }

                showSidebar();
            }
        });

        function showSearch(){
            var leftMargin = $(window).width() - 48;

            if($wrap_content.hasClass('show-search')){
                $wrap_content.animate({
                   left: 0
                }, 300, function(){
                    $wrap_content.removeClass('show-search animating');
                    $('body').removeClass('noscroll');
                });
            } else {
                $wrap_content.animate({
                    left: -leftMargin
                }, 300, function(){
                    $wrap_content.addClass('show-search')
                        .removeClass('animating');
                    $('body').addClass('noscroll');
                });
            }
        }

        function showSidebar(){
            if($wrap_content.hasClass('show-sidebar')){
                $wrap_content.animate({
                    left: 0
                }, 300, function(){
                    $wrap_content.removeClass('show-sidebar animating');
                    $('body').removeClass('noscroll');
                });
            } else {
                $wrap_content.animate({
                    left: 200
                }, 300, function(){
                    $wrap_content.addClass('show-sidebar')
                        .removeClass('animating');
                    $('body').addClass('noscroll');
                });
            }
        }

        $(document).on("touchmove", '.noscroll', function(event) {
            if(!$('.b-sidebar, .b-search').has($(event.target)).length) {
                event.preventDefault();
                event.stopPropagation();
            }
        });


    });

    $(window).load(function() {
        $('.b-post__content').not('.b-post__content_full').each(function(){
            if($(this).height() > 380){
                $(this).height(380).append('<div class="b-post__expand">показать все</div>');
            }
        });

        if(location.hash){
            setTimeout(function(){
                scrollto_c(location.hash);
            },1);

        }
    });
}(jQuery));


/*
 * Плавная прокрутка
 *
 * param {string} Id объекта к которому нужно скролить
 * */
function scrollto_c(elem){
    $('html, body').animate({
        scrollTop: $(elem).offset().top
    }, 500);
}
