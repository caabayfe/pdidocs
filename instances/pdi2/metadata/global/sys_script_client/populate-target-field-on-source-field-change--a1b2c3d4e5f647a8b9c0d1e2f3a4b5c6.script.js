function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading)
        return;

    g_form.clearOptions('target_field');

    var bindingValue = g_form.getValue('interface_impl_binding');
    if (!bindingValue) {
        g_form.addOption('target_field', '', '-- Select a binding first --');
        return;
    }

    if (!newValue) {
        g_form.addOption('target_field', '', '-- Select an interface field first --');
        return;
    }

    var currentSource = newValue;
    var currentBinding = bindingValue;
    var ga = new GlideAjax('DataInterfaceAjax');
    ga.addParam('sysparm_name', 'getCompatibleImplementationFields');
    ga.addParam('sysparm_binding_id', bindingValue);
    ga.addParam('sysparm_field_name', newValue);
    ga.getXMLAnswer(function (answer) {
        if (g_form.getValue('source_field') !== currentSource)
            return;
        if (g_form.getValue('interface_impl_binding') !== currentBinding)
            return;

        g_form.clearOptions('target_field');

        var fields = JSON.parse(answer || '[]');
        if (fields.length === 0) {
            g_form.addOption('target_field', '', '-- No compatible fields --');
            return;
        }

        g_form.addOption('target_field', '', '-- Select --', 0);
        for (var i = 0; i < fields.length; i++) {
            g_form.addOption('target_field', fields[i].name, fields[i].label);
        }
    });
}
