(function executeRule(current, previous /*null when async*/) {

	var grAttribute = new GlideRecord('sys_aw_list');
	grAttribute.get(current.list);
	
	var attributes = grAttribute.getValue('list_attributes');
	
	var attributeArray = attributes ? attributes.split(',') : [];
	
	if (!attributeArray.length)
		return;
	
	for (var i = 0; i < attributeArray.length; i++) {
			if (attributeArray[i] == current.getValue('attribute'))
				attributeArray.splice(i,1);
		}

	if (!attributeArray || !attributeArray.length)
		grAttribute.setValue('list_attributes', 'NULL');
	else
		grAttribute.setValue('list_attributes', attributeArray.join(','));
	
	grAttribute.setWorkflow(false);
	grAttribute.update();
})(current, previous);
