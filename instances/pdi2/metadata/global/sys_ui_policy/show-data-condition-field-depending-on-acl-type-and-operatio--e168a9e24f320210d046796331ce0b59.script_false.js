function onCondition() {
      // hide condition field
      g_scratchpad.tmp_acl_condition = g_form.getValue('condition');
      g_form.clearValue('condition');
      g_form.setDisplay('condition', false);
}
