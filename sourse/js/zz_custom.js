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

        $('.b-spoiler__link').click(function(event) {
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

        $('.b-post__gif').click(function(){
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

        $('.js-sidebar-control').click(function(){
            var sidebar = $('.b-sidebar');

            if($(this).hasClass('close')){
                sidebar.removeClass('close');
                $(this).removeClass('close');
                if(!sidebar.hasClass('minimize')){
                    $('.container').removeClass('maximized');
                }
            } else {
                sidebar.addClass('close');
                $(this).addClass('close');

                $('.container').addClass('maximized');
            }

            return false;
        });

        $('.js-minimize-sidebar').click(function(){
            var sidebar = $('.b-sidebar');

            if(sidebar.hasClass('minimize')){
                sidebar.removeClass('minimize');
                $(this).removeClass('minimized').html('Свернуть');
                $('.container').removeClass('maximized');
            } else {
                sidebar.addClass('minimize');
                $(this).addClass('minimized').html('Развернуть');
                $('.container').addClass('maximized');
            }

            return false;
        });

        $('.b-sidebar__menu-l').hover(function(){
            if($('.b-sidebar').hasClass('minimize')){
                var html = $(this).html(),
                    parent = $(this).parent();
                parent.append('<span class="b-sidebar__menu-t">'+html+'</span>');
            }

        }, function(){
            var parent = $(this).parent();
            parent.children('.b-sidebar__menu-t').remove();
        });



        $('body').on('click', '.b-post__expand', function(){
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

        $('.anim-scroll').click(function(){
            $('.anim-scroll').removeClass('current');
            $(this).addClass('current');
            scrollto_c($(this).prop("hash"));
            return false;
        });

        ZeroClipboard.config( { swfPath: "swf/ZeroClipboard.swf" } );

        var client = new ZeroClipboard($(".pr-copy"));

        client.on( "copy", function (event) {
            var clipboard = event.clipboardData;
        });

        $('.pr-tooltip').tooltip({
            position: { my: "center bottom-10", at: "center top" }
        });

        $('.pr-scroll-top').click(function(){
            $('html, body').animate({
                scrollTop: 0
            }, 500);
        });
        var $scroolTopBtn = $('.pr-scroll-top'),
            scrollTopBtnStatus = false;
        $(window).scroll(function(){
            if($(this).scrollTop() > 500){
                if(!scrollTopBtnStatus) {
                    $scroolTopBtn.stop().animate({
                        opacity: 1
                    }, 200);
                }
                scrollTopBtnStatus = true;
            } else {
                if(scrollTopBtnStatus) {
                    $scroolTopBtn.stop().animate({
                        opacity: 0
                    }, 200);
                }
                scrollTopBtnStatus = false;
            }
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
                fileBrowse: 'Добавить изображение'
            });
        });
    });

    $(window).load(function() {
        $('.b-post__content').not('.b-post__content_full').each(function(){
            if($(this).height() > 500){
                $(this).height(500).append('<div class="b-post__expand">показать все</div>');
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
 *  Кнопка Редактировать комментарий.
 *
 *  @param {object} - объект кнопки
 *  @param {int} - доступное время для редактирования
 * */
function editButtonCount(button, time) {
    if (typeof button == "undefined" || button == "") return false;
    if (typeof time == "undefined" || time == "") time = 60;

    var interval = setInterval(function() {
        button.html('Редактировать '+--time+' сек');

        if (time <= 0) {
            button.remove();
            clearInterval(interval);
        }
    }, 1000);
}

/*
 * Плавная прокрутка
 *
 * param {string} Id объекта к которому нужно скролить
 * */
function scrollto_c(elem){
    console.log(elem);
    $('html, body').animate({
        scrollTop: $(elem).offset().top - 150
    }, 500);
}