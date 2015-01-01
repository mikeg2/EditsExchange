var timeout = 10;
var closetimer = 0;
var ddmenuitem = 0;

function jsddm_open() {
    jsddm_canceltimer();
    jsddm_close();
    ddmenuitem = $(this).find('ul').css('visibility', 'visible');
}

function jsddm_close() {
    if (ddmenuitem) ddmenuitem.css('visibility', 'hidden');
}

function jsddm_timer() {
    closetimer = window.setTimeout(jsddm_close, timeout);
}

function jsddm_canceltimer() {
    if (closetimer) {
        window.clearTimeout(closetimer);
        closetimer = null;
    }
}

$(document).ready(function() {
    $trig = $('div.right-side-navigation.user-tab');
    $trig.bind('mouseover', jsddm_open);
    $trig.bind('mouseout', jsddm_timer);
    $('ul.user-pages-navigation').css('visibility', 'hidden');
});

document.onclick = jsddm_close;
document.onclick = jsddm_close;