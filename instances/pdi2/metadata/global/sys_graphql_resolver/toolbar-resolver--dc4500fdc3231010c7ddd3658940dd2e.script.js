(function process(env) {
	
	var experienceSysId = env.getArguments().sysId;
		
	function getToolbarRecords(id) {
		var gr = new GlideRecordSecure('sys_ux_page_property');
		gr.addQuery('name', 'chrome_toolbar');
		gr.addQuery('page', id);
		gr.addEncodedQuery('routeISEMPTY');
		gr.query();
		var result = [];
		while (gr.next()) { 
			result.push({sysId: gr.getValue('sys_id'), value: gr.getValue('value'), description: gr.getValue('description')});
		}		
		if (result.length > 0) {		
			return result;
		}		
		return false;
	}
	
	function getPanelIdFromExperienceId(id) {
		var gr = new GlideRecordSecure('sys_ux_page_registry');
		if (gr.get(id)) {
			return gr.getValue('admin_panel');
		}
		return false;		
	}
		
	function getRoutes(id) {
		var gr = new GlideRecordSecure('sys_ux_app_route');
		gr.addQuery('app_config', id);
		gr.query();
		var result = [];
		while (gr.next()) { 
			result.push({id: gr.getValue('route_type'), label: gr.getValue('name')});
		}		
		return result;	
	}
	
	
	function getButtonsFromRecord(sysId, value) {
		var buttons = JSON.parse(value);
		var result = [];
		var button;
		for (var x in buttons) {
			button = buttons[x];
			result.push({sysId: sysId, order: button.order, label: (button.label.message) ? button.label.message : button.label, icon: button.icon, route: button.routeInfo.route, viewportRoute: button.viewportInfo.route, group: button.group});
		}
		
		return result.sort(function(a, b) {
				return (a.order > b.order) ? 1 : -1;
		});		
	}
	
	function getButtons(toolbarRecords) {
		var record, buttons;
		var result = [];
		for (var rcount in toolbarRecords) {
			record = toolbarRecords[rcount];
			buttons = getButtonsFromRecord(record.sysId, record.value);
			for (var bcount in buttons) {
				result.push(buttons[bcount]);
			}
		}
		
		var sorted = result.sort(function(a, b) {
			return a.order - b.order;
		});
		
		return sorted;
	}
	
	var toolbarRecords = getToolbarRecords(experienceSysId);	
	var panelSysId = getPanelIdFromExperienceId(experienceSysId);
		
	return {
		sysId: (toolbarRecords) ? toolbarRecords[0].sysId : '', 
		routes: getRoutes(panelSysId), 
		buttons: (toolbarRecords) ? getButtons(toolbarRecords) : []
	};

})(env);
