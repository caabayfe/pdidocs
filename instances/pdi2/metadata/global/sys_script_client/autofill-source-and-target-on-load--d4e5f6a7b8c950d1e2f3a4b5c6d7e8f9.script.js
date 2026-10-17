function onLoad() {
    g_form.setReadOnly('source_table', true);
    g_form.setReadOnly('target_table', true);

    var bindingValue = g_form.getValue('interface_impl_binding');
    if (!bindingValue)
        return;

    // If already populated (existing record), no need to fetch
    if (g_form.getValue('source_table') && g_form.getValue('target_table'))
        return;

    var ga = new GlideAjax('DataInterfaceAjax');
    ga.addParam('sysparm_name', 'getBindingTableNames');
    ga.addParam('sysparm_binding_id', bindingValue);
    ga.getXMLAnswer(function (answer) {
        var result = JSON.parse(answer || '{}');
        g_form.setValue('source_table', result.interface_name || '');
        g_form.setValue('target_table', result.implementation_name || '');
    });
}
