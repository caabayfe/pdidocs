function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '' || g_form.isNewRecord()) {
        return; 
    }
    if (oldValue !== newValue)
        g_form.showFieldMsg('ui_action_layout', 'Please be aware that changing the layout may invalidate this UI Action group.', 'warning');
    else {
        g_form.hideFieldMsg('ui_action_layout');
    }

}
