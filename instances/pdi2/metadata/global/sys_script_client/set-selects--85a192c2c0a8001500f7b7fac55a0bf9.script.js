function onLoad() {
    g_form.clearOptions('variable');
    g_form.clearOptions('field');
    var template = g_form.getReference('template'); 
       
    if (template != '') {
        var send = 'xmlhttp.do?sysparm_processor=SysMeta&sysparm_type=column&sysparm_value=' + template.table;
        serverRequest(send, fieldResponse);
        // now for the variables
        send = 'xmlhttp.do?sysparm_processor=SysMeta&sysparm_type=column&sysparm_value=expert_panel';
        send += '&sysparm_sys_id=' + template.expert;
        serverRequest(send, variableResponse);
    }
}

function fieldResponse(request, args) {
    var current_val = g_form.getValue('field');
    if (current_val == '' || current_val == 'undefined') {
        var widgetName = 'sys_original.expert_panel_t_fields.field';
        var widget = gel(widgetName);
        if (widget)
             current_val = widget.value;
    }
    var items = request.responseXML.getElementsByTagName("item");
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var value = item.getAttribute("value");
        var label = item.getAttribute("label");
        var vals = value.split('.');
        jslog('value = ' + vals[1] + ' label = ' + label);
        g_form.addOption('field', vals[1], label);
    }
    g_form.setValue('field', current_val);
}

function variableResponse(request, args) {
    var current_val = g_form.getValue('variable');
    if (current_val == '' || current_val == 'undefined') {
        var widgetName = 'sys_original.expert_panel_t_fields.variable';
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
        g_form.addOption('variable', value, label);
    }
    g_form.setValue('variable', current_val);
}
