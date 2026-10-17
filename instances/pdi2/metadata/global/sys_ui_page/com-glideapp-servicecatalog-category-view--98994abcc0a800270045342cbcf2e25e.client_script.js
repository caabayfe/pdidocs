window.addEventListener("load", function() {
    var target =
        document.querySelector('.service_catalog') ||
        document.querySelector('.category_title_div > a') ||
        document.querySelector('.sc_header_back_button');

    if (target) target.focus();
});
