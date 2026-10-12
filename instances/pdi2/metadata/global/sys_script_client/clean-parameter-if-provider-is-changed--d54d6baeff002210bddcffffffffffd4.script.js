function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') 
        return;
    
    var parameterProvider = g_form.getReference('parameter').provider;
    if (parameterProvider !== '' && g_form.getReference('queue').provider !== parameterProvider)
        g_form.clearValue('parameter');

}
