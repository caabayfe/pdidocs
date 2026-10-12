function onChange(control, oldValue, newValue, isLoading) {
    if (isLoading) {
        g_form.setDisplay('delivery_time', false);
        convertDurationToDays();
        return;
    }
    var dateSuffix = ' 00:00:00';
    var daysString = !newValue ? '0' : newValue;
    g_form.setValue('delivery_time', daysString + dateSuffix);
}

function convertDurationToDays() {
    var durationValue = g_form.getValue('delivery_time');
    var days = (!durationValue || durationValue.split(" ").length == 1) ? 0 : durationValue.split(" ")[0];
    g_form.setValue('delivery_time_var', days);
}
