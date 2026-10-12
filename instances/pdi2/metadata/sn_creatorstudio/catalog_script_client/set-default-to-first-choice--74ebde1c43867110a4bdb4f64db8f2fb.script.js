function onChange(control, oldValue, newValue, isLoading) {
    if (isLoading || newValue == '') {
        return;
    }

    if (newValue == 'true' && g_form.getValue('sub_type') == '3') {
        g_form.setValue('do_not_select_first', 'true');
    }
}
