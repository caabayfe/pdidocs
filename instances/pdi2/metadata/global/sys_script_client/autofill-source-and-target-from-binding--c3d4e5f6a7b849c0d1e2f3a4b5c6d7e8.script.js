function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading)
        return;

    g_form.setReadOnly('source_table', true);
    g_form.setReadOnly('target_table', true);

    if (!newValue) {
        g_form.setValue('source_table', '');
        g_form.setValue('target_table', '');
        return;
    }

    var currentBinding = newValue;
    var ga = new GlideAjax('DataInterfaceAjax');
    ga.addParam('sysparm_name', 'getBindingTableNames');
    ga.addParam('sysparm_binding_id', newValue);
    ga.getXMLAnswer(function (answer) {
        if (g_form.getValue('interface_impl_binding') !== currentBinding)
            return;

        var result = JSON.parse(answer || '{}');
        g_form.setValue('source_table', result.interface_name || '');
        g_form.setValue('target_table', result.implementation_name || '');
    });
}
