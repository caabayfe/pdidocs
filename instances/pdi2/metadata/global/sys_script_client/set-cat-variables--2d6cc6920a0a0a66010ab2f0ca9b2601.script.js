function onChange(control, oldValue, newValue) {
    g_form.clearOptions('cat_variable');
    var current_item = g_form.getValue('cat_item');    
    if (current_item != '') {
        var send = 'xmlhttp.do?sysparm_processor=SysMeta&sysparm_type=column&sysparm_sys_id=' + current_item;
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
	var is_valid_value = false;
    var items = request.responseXML.getElementsByTagName("item");
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var value = item.getAttribute("value");
        var label = item.getAttribute("label");
        jslog('value = ' + value + ' label = ' + label);
        g_form.addOption('cat_variable', value, label);
		if (current_val === value)
			is_valid_value = true;
    }
    g_form.addOption('cat_variable', '', '-- None --');
    g_form.setValue('cat_variable', is_valid_value ? current_val : '');
}
