function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
    
    if (newValue == 'true') {
        g_form.setValue('hide_select_all', 'true');
        g_form.setValue('hide_pagination', 'true');
        g_form.setValue('hide_drag_and_drop', 'true');
        g_form.setValue('hide_column_grouping', 'true');
    } else {
        g_form.clearValue('hide_select_all');
        g_form.clearValue('hide_pagination');
        g_form.clearValue('hide_drag_and_drop');
        g_form.clearValue('hide_column_grouping');
        if(g_form.getValue('live_updates') == 'automatic_refresh')
            g_form.setValue('live_updates','off');
    }
}
