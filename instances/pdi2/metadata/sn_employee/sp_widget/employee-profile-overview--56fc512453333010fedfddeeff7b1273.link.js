function link(scope, element, attrs, controller) {
    $(element).on('focus blur click', ".section-header", function(e) {
        if (e.originalEvent.type !== 'focus')
            $(this).find(".accordion-icon").tooltip("hide");
        else
            $(this).find(".accordion-icon").tooltip("show");
    });

    // Scroll textarea (Bio field) content to bottom when there is overflow
    $(element).on('focus', '.textarea', function (event) {
        var textAreaElement = $('.textarea')[0];
        if (textAreaElement.scrollTop !== textAreaElement.scrollHeight) {
            textAreaElement.scrollTop = textAreaElement.scrollHeight;
        }
    });
}
