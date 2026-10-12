(function executeRule(current, previous /*null when async*/) {
	
	var componentActions = new GlideRecord('sys_ux_lib_component_action');
	componentActions.addQuery('publisher', current.component.sys_id);
	componentActions.query();
	while (componentActions.next()) {
		registerAction(current.page, componentActions.name, current.sys_id);
	}
	
	function registerAction(page, action, elementId) {
		var publishers, actionReg = new GlideRecord('sys_ux_page_action');
		actionReg.addQuery('page', page);
		actionReg.addQuery('name', action);
		actionReg.query();
		if (actionReg.next()) {
			publishers = actionReg.publishers + '';
			publishers += gs.nil(publishers) ? '' : ',';
			publishers += elementId;
			actionReg.publishers = publishers;
			actionReg.update();
		} else {
			actionReg.newRecord();
			actionReg.page = page;
			actionReg.name = action;
			actionReg.publishers = elementId;
			actionReg.insert();
		}
	}
})(current, previous);
