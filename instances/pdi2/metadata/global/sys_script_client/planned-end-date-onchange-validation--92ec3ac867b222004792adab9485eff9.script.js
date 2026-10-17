function onChange(control, oldValue, newValue, isLoading, isTemplate) {
  if (isLoading || newValue === '')
    return;
  
  if (typeof validateField === 'function')
    validateField('planned_start_date', 'planned_end_date');
  else {
    g_form.hideFieldMsg('planned_end_date', true);
    validateStartDateBeforeEndDate('planned_start_date', 'planned_end_date', function(errorMsg) {
      g_form.showErrorBox('planned_end_date', errorMsg);
    });
  }

  // implementation must fall within planned start/end dates of related change request
  if (g_form.getValue('change_task_type') === 'implementation'){
    var changeRequestStartDate = g_form.getValue('change_request.start_date');
    var changeRequestEndDate = g_form.getValue('change_request.end_date');
    var startDate = g_form.getValue('planned_start_date');
    var endDate = g_form.getValue('planned_end_date');
    if (!areDatesWithinRange(changeRequestStartDate, changeRequestEndDate, [startDate, endDate]))
      g_form.showErrorBox('planned_end_date', new GwtMessage().getMessage('Change task planned start and end dates must fall within the planned start and end dates of the change request it is related to'));
  }
}
