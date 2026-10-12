function onChange(control, oldValue, newValue, isLoading, isTemplate) {
  if (isLoading || newValue === '')
    return;
  
  if (typeof validateField === 'function')
    validateField('start_date', 'end_date');
  else {
    var showErrorMsg = function(errorMsg) {
      g_form.showErrorBox('end_date', errorMsg);
    };
    g_form.hideFieldMsg('end_date', true);
    if (validateStartDateBeforeEndDate('start_date', 'end_date', showErrorMsg) && (typeof validateMaxDateDuration !== 'undefined'))
      validateMaxDateDuration('start_date', 'end_date', showErrorMsg);
  }
}
