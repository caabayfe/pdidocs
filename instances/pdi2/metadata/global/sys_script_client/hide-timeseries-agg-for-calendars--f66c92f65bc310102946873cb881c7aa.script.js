function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

    var indicator = new GlideRecord('pa_indicators');
    indicator.get(newValue);
    if (indicator.calendar == 'standard' || indicator.calendar == '') {
        g_form.setDisplay('aggregate', true);
        g_form.setDisplay('is_compare_chart', true);
    } else {
        g_form.clearValue('aggregate');
        g_form.clearValue('is_compare_chart');
        g_form.setDisplay('aggregate', false);
        g_form.setDisplay('is_compare_chart', false);
    }
}
