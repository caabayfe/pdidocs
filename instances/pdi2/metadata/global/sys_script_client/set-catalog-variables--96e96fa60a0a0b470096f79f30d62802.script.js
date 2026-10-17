function onChange(control, oldValue, newValue) {
    g_form.clearOptions('catalog_variable');
    var current_item = g_form.getValue('catalog_item');
    if (current_item != '') {
        var send = 'xmlhttp.do?sysparm_processor=SysMeta&sysparm_type=column&sysparm_sys_id=' + current_item;
        send += '&sysparm_value=catalog_client_script&get_variable_sets_labels=true';
        serverRequest(send, catResponse);
    }
}

function catResponse(request, args) {
    var current_val = g_form.getValue('catalog_variable');
    if (current_val == '' || current_val == 'undefined') {
        var widgetName = 'sys_original.catalog_ui_policy_action.catalog_variable';
        var widget = gel(widgetName);
        if (widget)
             current_val = widget.value;
    }
	localStorage.triggerOnChange = false;
    var items = request.responseXML.getElementsByTagName("item");
    g_form.addOption('catalog_variable', '', '-- None --');
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var value = item.getAttribute("value");
        var label = item.getAttribute("label");
        jslog('value = ' + value + ' label = ' + label);
        g_form.addOption('catalog_variable', value, label);
    }
    g_form.setValue('catalog_variable', current_val);
	localStorage.triggerOnChange = true;
}
