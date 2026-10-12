function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }

	if (g_form.getValue('form_position') == 'action_bar') {
		g_form.removeOption('declarative_action_type', 'action_component');
		g_form.removeOption('declarative_action_type', 'dispatch_action');
	} else {
		var ajax = new GlideAjax('PickList');
		ajax.addParam('sysparm_chars', '*');
		ajax.addParam('sysparm_nomax', 'true');
		ajax.addParam('sysparm_name', 'sys_declarative_action_assignment.declarative_action_type');
		ajax.getXML(function(response) {
			if (!response.responseXML) 
				return;
			var xml = response.responseXML.documentElement;
			var items = xml.getElementsByTagName('item');
			for (var i = 0; i < items.length; i++) {
				var item = items[i];
				if (item.getAttribute("value") == "action_component") {
					g_form.addOption('declarative_action_type', 'action_component', item.getAttribute('label'), 0);
				} else if (item.getAttribute("value") == "dispatch_action") {
					g_form.addOption('declarative_action_type', 'dispatch_action', item.getAttribute('label'), 1);
				}
			}
		});		
	}   
}
