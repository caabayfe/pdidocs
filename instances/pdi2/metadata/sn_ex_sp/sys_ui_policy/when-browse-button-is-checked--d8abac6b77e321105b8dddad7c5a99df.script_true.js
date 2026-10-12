function onCondition() {


    var depth = Number(g_scratchpad.nav_item_depth);
    var topNavItemDisplayType = g_scratchpad.top_nav_item_display_type;
    var BROWSE_BUTTON_TEXT = 'browse_button_text';

    if ((depth == 0) || (depth == 1 && topNavItemDisplayType === 'expanded')) {
        g_form.setDisplay(BROWSE_BUTTON_TEXT, true);
    } else {
        g_form.setDisplay(BROWSE_BUTTON_TEXT, false);
    }

}
