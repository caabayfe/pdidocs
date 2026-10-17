function onCondition() {
      // restore condition (show condition field)
      if (g_scratchpad.tmp_acl_condition) {
        g_form.setValue('condition', g_scratchpad.tmp_acl_condition);
      }
      g_form.setDisplay('condition', true);
}
