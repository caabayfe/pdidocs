function onCondition() {
      // hide script field
      g_scratchpad.tmp_acl_script = g_form.getValue('script');
      g_form.clearValue('script');
      g_form.setDisplay('script', false);
}
