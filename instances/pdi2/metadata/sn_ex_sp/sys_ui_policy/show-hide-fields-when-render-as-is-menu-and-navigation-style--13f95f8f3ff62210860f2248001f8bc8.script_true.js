function onCondition() {
    var depth = Number(g_scratchpad.nav_item_depth);
    if (depth != 0) {
        g_form.setDisplay('render_as', false);
        g_form.setDisplay('menu_icon', false);
    } else {
        g_form.setDisplay('render_as', true);
        g_form.setDisplay('menu_icon', true);
    }

    g_form.setDisplay('position', false);
    g_form.setDisplay('submenu_type', false);
    g_form.setMandatory('widget', false);
    g_form.setDisplay('widget', false);
    g_form.setDisplay('widget_parameters', false);
    g_form.setDisplay('browse_button', false);
    g_form.setDisplay('browse_button_text', false);
}
