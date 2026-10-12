function onChange(control, oldValue, newValue) {
    g_form.clearOptions('expert_panel_variable');
    var current_item = g_form.getValue('expert_panel');    
    if (current_item != '') {
        var aj = new GlideAjax("ExpertPanelVariablesAjax");
	aj.addParam("sysparm_name", current_item);
	aj.getXML(expertResponse.bind(this));
    }
}

function expertResponse(response) {
    var current_val = g_form.getValue('expert_panel_variable');
    if (current_val == '' || current_val == 'undefined') {
        var widgetName = 'sys_original.expert_script_client.expert_panel_variable';
        var widget = gel(widgetName);
        if (widget)
             current_val = widget.value;
    }
    var items = response.responseXML.getElementsByTagName("item");
    g_form.addOption('expert_panel_variable','','');
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var value = item.getAttribute("value");
        var label = item.getAttribute("label");
        jslog('value = ' + value + ' label = ' + label);
        g_form.addOption('expert_panel_variable', value, label);
    }
    g_form.setValue('expert_panel_variable', current_val);
}
