function onSubmit() {
    var showErrorMsg = function(errorMsg) {
        g_form.addErrorMessage(errorMsg);
    };

    // Clearing existing messages so the same error message doesn't show multiple times
    g_form.clearMessages();

    var isValid = true;
    if (typeof validateStartDateBeforeEndDate === 'function')
        isValid = validateStartDateBeforeEndDate('planned_start_date', 'planned_end_date', showErrorMsg);

    // Need to check if the method exists in case StartEndDateValidation UI Script has been skipped during upgrade
    if (typeof validateMaxDateDuration !== 'undefined')
        isValid = isValid && validateMaxDateDuration('planned_start_date', 'planned_end_date', showErrorMsg);

    // Implementation must fall within planned start/end dates of related change request
    if (g_form.getValue('change_task_type') === 'implementation' && (typeof areDatesWithinRange === 'function')) {
        var changeRequestStartDate = g_form.getValue('change_request.start_date');
        var changeRequestEndDate = g_form.getValue('change_request.end_date');
        var startDate = g_form.getValue('planned_start_date');
        var endDate = g_form.getValue('planned_end_date');
        if (!areDatesWithinRange(changeRequestStartDate, changeRequestEndDate, [startDate, endDate])) {
            g_form.addErrorMessage(new GwtMessage().getMessage('Change task planned start and end dates must fall within the planned start and end dates of the change request it is related to'));
            isValid = false;
        }
    }
    return isValid;
}
