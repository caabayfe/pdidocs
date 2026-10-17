function onCondition() {
      // restore script (show script field)
      if (g_scratchpad.tmp_acl_script) {
        g_form.setValue('script', g_scratchpad.tmp_acl_script);
      }
      g_form.setDisplay('script', true);
}
