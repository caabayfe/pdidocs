function onChange(control, oldValue, newValue, isLoading, isTemplate) {
  if (isLoading || newValue === '')
    return;

  if (typeof validateField === 'function')
    validateField('work_start', 'work_end');
  else {
    g_form.hideFieldMsg('work_end', true);
    validateStartDateBeforeEndDate('work_start', 'work_end', function(errorMsg) {
      g_form.showErrorBox('work_end', errorMsg);
    });
  }
}
