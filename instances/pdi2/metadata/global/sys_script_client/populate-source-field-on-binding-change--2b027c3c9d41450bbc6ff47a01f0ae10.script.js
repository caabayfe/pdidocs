function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading)
        return;

    g_form.clearOptions('source_field');
    g_form.clearOptions('target_field');

    if (!newValue) {
        g_form.addOption('source_field', '', '-- Select a binding first --');
        g_form.addOption('target_field', '', '-- Select a binding first --');
        return;
    }

    g_form.addOption('target_field', '', '-- Select an interface field first --');

    var currentBinding = newValue;
    var ga = new GlideAjax('DataInterfaceAjax');
    ga.addParam('sysparm_name', 'getInterfaceFields');
    ga.addParam('sysparm_binding_id', newValue);
    ga.getXMLAnswer(function (answer) {
        if (g_form.getValue('interface_impl_binding') !== currentBinding)
            return;

        g_form.clearOptions('source_field');
        g_form.addOption('source_field', '', '-- Select --', 0);

        var fields = JSON.parse(answer || '[]');
        for (var i = 0; i < fields.length; i++) {
            g_form.addOption('source_field', fields[i].name, fields[i].label);
        }
    });
}
