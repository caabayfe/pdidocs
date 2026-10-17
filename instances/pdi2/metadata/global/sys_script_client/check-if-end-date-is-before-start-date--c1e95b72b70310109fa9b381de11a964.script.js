function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    var selectedStartDate = g_form.getValue("start_date");
    if (isLoading || newValue === '' || selectedStartDate === '') {
        return;
    }

    var selectedEndDate = new Date(getDateFromFormat(newValue, g_user_date_format)).getTime();
    selectedStartDate = new Date(getDateFromFormat(selectedStartDate, g_user_date_format)).getTime();
    if (selectedStartDate > selectedEndDate) {
        g_form.setValue("end_date", g_form.getValue("start_date"));
        g_form.showFieldMsg('end_date', "The selected Date (" + newValue + ") is before the selected Start Date. End Date has been reset to the Start Date ", 'warning');
    }
}
