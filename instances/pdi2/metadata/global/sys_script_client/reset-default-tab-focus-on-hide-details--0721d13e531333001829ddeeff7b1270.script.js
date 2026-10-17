function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading) {
        return;
    }
    setDefaultTabFocus(newValue === "true");

    function setDefaultTabFocus(hideDetails) {
        var details = "Details";
        if (hideDetails) {
            g_form.removeOption('default_tab_focus', details);
            var sel = g_form.getElement('default_tab_focus');
            var option = sel.options[0];
            if (option) {
                g_form.setValue('default_tab_focus', option.value);
            } else {
                g_form.clearValue('default_tab_focus');
            }
        } else {
            g_form.addOption('default_tab_focus', details, details, 0);
        }

    }
}
