(function executeRule(current, previous /*null when async*/) {

	var mapScreen = new GlideRecord('sys_sg_screen');
	mapScreen.addQuery('parent_table', 'sys_sg_map_screen');
	mapScreen.addQuery('parent', current.getUniqueValue());
	mapScreen.addQuery('available_offline', '!=', current.getValue('available_offline'));
	mapScreen.query();
	
	while (mapScreen.next()) {
		mapScreen.setValue('available_offline', current.getValue('available_offline'));
		mapScreen.update();
	}

})(current, previous);
