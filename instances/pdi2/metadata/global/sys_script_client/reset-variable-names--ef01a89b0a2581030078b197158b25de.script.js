function onChange(control, oldValue, newValue, isLoading) {
    g_form.clearOptions('cat_variable');

    var selectedOption = "";
    var sysParam = "";
    if (g_form.getValue('applies_to') === "set") {
        selectedOption = g_form.getValue('variable_set');
        g_form.clearValue('cat_item');
        sysParam = "sysparm_set_id";
    } else {
        selectedOption = g_form.getValue('cat_item');
        g_form.clearValue('variable_set');
        sysParam = "sysparm_sys_id";
    }

    if (isLoading)
        return;

    if (selectedOption) {
        var send = 'xmlhttp.do?sysparm_processor=SysMeta&sysparm_type=column&sysparm_value=catalog_client_script&' + sysParam + '=' + selectedOption;
        serverRequest(send, catResponse);
    }
}

function catResponse(request, args) {
    var items = request.responseXML.getElementsByTagName("item");
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var value = item.getAttribute("value");
        var label = item.getAttribute("label");
        g_form.addOption('cat_variable', value, label);
    }
    g_form.addOption('cat_variable', '', '-- None --');
}
