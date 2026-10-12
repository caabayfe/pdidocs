function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    // Show annotation if 'attribute' is 'index_calculated_field'. Hide otherwise
    if (g_form.getValue('attribute') == '9133d5244f202110d8699bcc32ce0bae') {
        // Show the annotation
        $('calcfield_annotation').up().show();
    } else {
        // Hide the annotation
        $('calcfield_annotation').up().hide();
    }
}
