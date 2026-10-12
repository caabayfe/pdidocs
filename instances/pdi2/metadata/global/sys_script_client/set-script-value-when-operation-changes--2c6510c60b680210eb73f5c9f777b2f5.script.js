function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '')
        return;

    g_form.clearValue('client_script');
    var RUN_CLIENT_SCRIPT_SYS_ID = 'e16fffc367233110db9fb9770cf9224b';
    if (newValue === RUN_CLIENT_SCRIPT_SYS_ID) {
        var template = "function onChange(inputName, newValue) {\n}";
        g_form.setValue('client_script', template);
    }
}
