(function executeRule(current, previous /*null when async*/) {
	
	var masterItemIds = [];
	
	var masterItem = new GlideRecord('sys_sg_master_item');
	masterItem.addQuery('screen', current.getUniqueValue());
	masterItem.query();
	
	while (masterItem.next())
		masterItemIds.push(masterItem.getUniqueValue());
	
	var screen = new GlideRecord('sys_sg_screen');
	screen.addQuery('parent', 'IN', masterItemIds);
	screen.addQuery('avilable_offline', '!=', current.getValue('available_offline'));
	screen.query();
	screen.setValue('available_offline', current.getValue('available_offline'));
	screen.updateMultiple();
		
})(current, previous);
