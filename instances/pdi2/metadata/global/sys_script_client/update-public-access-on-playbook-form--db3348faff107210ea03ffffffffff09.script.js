function onChange(control, oldValue, newValue, isLoading, isTemplate) {

  if (!g_form.isNewRecord()) {
    // handled by sys_ui_policy 70a750624f5432108c8da851b1ce0b1d
    return;
  }

  if (newValue === '') {
    g_form.setDisabled('public_access', false);
    return;
  }

  var processTypePublicAccessData = g_scratchpad.processTypePublicAccessData;

  if (!processTypePublicAccessData) {
    return;
  }

  var allowsPublicAccess = processTypePublicAccessData[newValue];

  if (allowsPublicAccess) {
    g_form.setDisabled('public_access', false);
  } else {
    g_form.setValue('public_access', false);
    g_form.setDisabled('public_access', true);
  }
}
