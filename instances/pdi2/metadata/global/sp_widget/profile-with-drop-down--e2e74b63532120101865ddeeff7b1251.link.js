function link(scope, element, attrs, controller) {
    var prevFocusIndex = -1; // This is used for prev focus of nav-bar(avatar) drop down items when its visible.
    $(document).keyup(function(event) {
        if (event.which == 9 || event.which == 37 || event.which == 39) { //tab key handler + arrow keys
            if ($(event.target).parents(".dropdown-menu").length == 0) { //if we are NOT inside a dropdown...
                //close the dropdowns
                $(".dropdown").removeClass("open");
                $("[data-toggle='dropdown']").attr("aria-expanded", "false");
                prevFocusIndex = -1;
            }
        } else if (event.which == 38 || event.which == 40) {
            var parent = $(event.target).parents('.dropdown-menu');
            if (parent.length) {
                var items = $(parent).find('li a');
                if (!items.length)
                    return;

                var index = items.index(items.filter(':focus'));
                if (index == -1) return;

                if (prevFocusIndex == index) {
                    if (index == 0)
                        index = items.length - 1;
                    else if (index == items.length - 1)
                        index = 0;

                    items[index].focus();
                }
                prevFocusIndex = index;

            }
        }
        // on esc/close of the menu, reset the index
        if (event.which == 27)
            prevFocusIndex = -1;

        if (event.which == 13 || event.which == 32)
            $(event.target).parent(".dropdown.open").find("ul.dropdown-menu li:first-child a").focus();
    });

}
