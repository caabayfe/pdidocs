(function process(env) {

    var experienceSysId = env.getArguments().sysId;
	var buttons = env.getArguments().buttons;
	
	function isObject(value) {
		return typeof value === 'object' && value !== null;
	}
		
	function update(oldValue, newValue) {		
		var buttons = JSON.parse(oldValue);			
		var button;
		for (var x in buttons) {						
			button = buttons[x];
			if (isObject(button.label)) {
				button.label.message = newValue[x].label;
			} else {
				button.label = {message: newValue[x].label, translatable: true};
			}			
			button.icon = newValue[x].icon;
			button.group = newValue[x].group;
			button.order = newValue[x].order;
			
			if (newValue[x].deleted) {
				button.deleted = true;
			}
			
			if (newValue[x].viewportRoute) {
				button.viewportInfo.route = newValue[x].viewportRoute;
			} else if (newValue[x].route) {
				button.routeInfo.route = newValue[x].route;
			}		
		}
		
		return buttons;	
	}
	
	function sort(result) {
		return result.sort(function(a, b) {
				return (a.order > b.order) ? 1 : -1;
		});	
	}
	
	function getButtonsFromRecord(sysId, value) {
		var buttons = JSON.parse(value);
		var result = [];
		var button, item;
		for (var x in buttons) {
			button = buttons[x];
			item = {
				sysId: sysId, 
				order: button.order, 
				label: (button.label.message) ? button.label.message : button.label, 
				icon: button.icon, 
				route: button.routeInfo.route, 
				viewportRoute: button.viewportInfo.route, 
				group: button.group
			};
			result.push(item);
		}		
		return sort(result);	
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
		return sort(result);
	}
	
	function exclude(buttons, key) {
		return buttons.filter(function(button){ if (!button[key]) return button;});
	}
	function include(buttons, key) {
		return buttons.filter(function(button){ if (button[key] === true) return button;});
	}
	
	function prepareNew(buttons) {
		return buttons.map(function(button) {
			return {
				id: button.route,
				label: {translatable: true, message: button.label},
				order: button.order,
				icon: button.icon,
				routeInfo: {
					route: button.route
				},
				group: button.group,
				badge: {},
				presence: {},
				availability: {}
			};
		});
	}
		
	function getToolbarRecord(sysId, experienceSysId) {
		var gr = new GlideRecordSecure('sys_ux_page_property');
		if (gr.get(sysId)) {
			return gr;
		}		
		return false;	
	}
	
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
		
	function groupByRecord(buttons) {
		var result = {};
		var sysId;
		for (var count in buttons) {
			sysId = buttons[count].sysId;
			result[sysId] = result[sysId] || [];
			result[sysId].push(buttons[count]);		
		}		
		return result;
	}
	
	function updateToolbarRecord(sysId, experienceSysId, buttons) {
		var gr = getToolbarRecord(sysId, experienceSysId);
		var updated = update(gr.getValue('value'), buttons);
		gr.value = JSON.stringify(exclude(updated, 'deleted'));
		gr.update();    
	}
	
	function addNewButtons(sysId, experienceSysId, buttons) {
		var gr = getToolbarRecord(sysId, experienceSysId);
		var oldValue = JSON.parse(gr.getValue('value'));
		var newValue = [].concat(oldValue, prepareNew(buttons));
		gr.value = JSON.stringify(newValue);
		gr.update();
	}
	
	function getMainToolbarRecord(experienceSysId) {		
		var toolbarRecords = getToolbarRecords(experienceSysId);
		var buttons = getButtons(toolbarRecords);				
				
		if (buttons) {			
			return sort(buttons)[0].sysId;
		} else {
			var gr = new GlideRecordSecure('sys_ux_page_property');
			gr.initialize();
			gr.name = 'chrome_toolbar';
			gr.page = experienceSysId;
			gr.value = '[]';
			gr.type = 'json';
			return gr.insert();		
		}	
	}
	
	function updateToolbarRecords(experienceSysId, buttons) {			
		var buttonsByRecord = groupByRecord(buttons);
		var id = getMainToolbarRecord(experienceSysId);
		for (var sysId in buttonsByRecord) {
			if (sysId == -1) {
				addNewButtons(id, experienceSysId, buttonsByRecord[sysId]);
			} else {
				updateToolbarRecord(sysId, experienceSysId, buttonsByRecord[sysId]);
			}					
		}
		
		var toolbarRecords = getToolbarRecords(experienceSysId);

		return {
			id: id,
			buttons: (toolbarRecords) ? getButtons(toolbarRecords) : []
		};				
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
	
	var toolbarRecord = updateToolbarRecords(experienceSysId, buttons);
	var panelSysId = getPanelIdFromExperienceId(experienceSysId);
	
	return {
		sysId: toolbarRecord.id, 
		routes: getRoutes(panelSysId), 
		buttons: toolbarRecord.buttons
	};

})(env);
