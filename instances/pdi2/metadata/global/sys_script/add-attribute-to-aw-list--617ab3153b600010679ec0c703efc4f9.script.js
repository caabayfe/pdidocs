(function executeRule(current, previous /*null when async*/) {

	var grList = new GlideRecord('sys_aw_list');
	grList.get(current.list);
	
	var attributes = grList.getValue('list_attributes');
	var attributeArray = attributes ? attributes.split(',') : [];
	
	var grListAttribute = new GlideRecord('sys_aw_list_attribute');
	grListAttribute.addQuery('list', current.list);
	grListAttribute.addQuery('attribute', current.attribute);
	grListAttribute.query();
	
	for (var i = 0; i < attributeArray.length; i++) {
		if (attributeArray[i] == current.attribute || grListAttribute.next()) {
			current.setAbortAction(true);
			return;
		}
	}
	
	attributeArray.push(current.attribute);
	grList.setValue('list_attributes', attributeArray.join(','));
	grList.setWorkflow(false);
	grList.update();

})(current, previous);
