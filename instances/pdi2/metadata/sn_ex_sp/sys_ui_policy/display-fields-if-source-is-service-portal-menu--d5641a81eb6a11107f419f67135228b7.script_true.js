function onCondition() {
    if ((g_scratchpad.menu_type == 'scripted') || (g_scratchpad.menu_type == 'filtered')) {
      g_form.clearValue('browse_button');
      g_form.setDisplay('browse_button', false);
      g_form.setDisplay('browse_button_text', false);
      g_form.setDisplay('submenu_type', false);
    }
}
