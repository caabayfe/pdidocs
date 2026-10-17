function onCondition() {
    if (g_scratchpad.sn_ex_sp_show_image_url_field == 'true') {
        g_form.setDisplay('background_image_url', true);
        g_form.setDisplay('icon_url', true);
    } else {
        g_form.setDisplay('background_image_url', false);
        g_form.setDisplay('icon_url', false);
    }
}
