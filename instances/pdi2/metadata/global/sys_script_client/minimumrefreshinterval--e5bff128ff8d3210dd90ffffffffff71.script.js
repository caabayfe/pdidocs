function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
        return;
    }
    
    var minimumRefreshInterval = 10;
    var refreshInterval = g_form.getIntValue('refresh_interval');
    
    if (refreshInterval < minimumRefreshInterval) {
        g_form.showErrorBox('refresh_interval', 'Minimum refresh interval is ' + minimumRefreshInterval + ' minutes');
        // Do not clear the field, this triggers an infinite loop. Let users clean the field.
        return;
    }
    
    g_form.hideErrorBox('refresh_interval');
}
