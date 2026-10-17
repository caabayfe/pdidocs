function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

    var showOverlapDataLabels = false;
    if (g_form.getValue('type') == 'time' && newValue == 'true') {
        showOverlapDataLabels = true;
    }

    g_form.setDisplay('overlap_data_labels', showOverlapDataLabels);
}
