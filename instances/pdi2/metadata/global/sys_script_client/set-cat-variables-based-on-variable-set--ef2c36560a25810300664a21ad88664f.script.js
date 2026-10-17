function onChange(control, oldValue, newValue) {
    g_form.clearOptions('cat_variable');
    var current_set = g_form.getValue('variable_set');    
    if (current_set != '') {
        var send = 'xmlhttp.do?sysparm_processor=SysMeta&sysparm_type=column&sysparm_set_id=' + current_set;
        send += '&sysparm_value=catalog_client_script';
        serverRequest(send, catResponse);
    }
}

function catResponse(request, args) {
    var current_val = g_form.getValue('cat_variable');
    if (current_val == '' || current_val == 'undefined') {
        var widgetName = 'sys_original.catalog_script_client.cat_variable';
        var widget = gel(widgetName);
        if (widget)
             current_val = widget.value;
    }
    var items = request.responseXML.getElementsByTagName("item");
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var value = item.getAttribute("value");
        var label = item.getAttribute("label");
        jslog('value = ' + value + ' label = ' + label);
        g_form.addOption('cat_variable', value, label);
    }
    g_form.addOption('cat_variable', '', '-- None --');
    g_form.setValue('cat_variable', current_val);
}
