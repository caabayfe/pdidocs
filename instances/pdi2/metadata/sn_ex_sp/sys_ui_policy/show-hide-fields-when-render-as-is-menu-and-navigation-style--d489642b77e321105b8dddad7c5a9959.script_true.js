function onCondition() {
    var depth = Number(g_scratchpad.nav_item_depth);
    var BROWSE_BUTTON_TEXT = 'browse_button_text';
    g_form.setDisplay('menu_icon', false);
    if (depth == 0) {
        g_form.setDisplay('submenu_type', true);
        g_form.setMandatory('widget', false);
        g_form.setDisplay('widget', false);
        g_form.setDisplay('widget_parameters', false);
        g_form.setDisplay('browse_button', true);
        if (g_form.getValue('browse_button') == 'true') {
            g_form.setDisplay(BROWSE_BUTTON_TEXT, true);
        } else {
            g_form.setDisplay(BROWSE_BUTTON_TEXT, false);
        }
    } else {
        g_form.setDisplay('render_as', false);
        g_form.setDisplay('position', false);
        g_form.setDisplay('submenu_type', false);
        g_form.setDisplay('widget', false);
        g_form.setMandatory('widget', false);
        g_form.setDisplay('widget_parameters', false);

        var topNavItemDisplayType = g_scratchpad.top_nav_item_display_type;
        if (depth == 1 && topNavItemDisplayType === 'expanded') {
            g_form.setDisplay('browse_button', true);
            if (g_form.getValue('browse_button') == 'true') {
                g_form.setDisplay(BROWSE_BUTTON_TEXT, true);
            } else {
                g_form.setDisplay(BROWSE_BUTTON_TEXT, false);
            }
        } else {
            g_form.setDisplay('browse_button', false);
            g_form.setDisplay(BROWSE_BUTTON_TEXT, false);
        }
    }
}
