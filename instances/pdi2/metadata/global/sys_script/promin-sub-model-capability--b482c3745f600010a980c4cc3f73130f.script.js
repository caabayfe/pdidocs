(function executeRule(current, previous /*null when async*/) {
	/*
		activate/deactivate link_submodel dictionary based on the property value change (promin.sub_model.capability)
	*/
	var grDictionary = new GlideRecord('sys_dictionary');
	grDictionary.addQuery('name', 'promin_activity_def');
	grDictionary.addQuery('element', 'link_submodel');
	grDictionary.query();
	
	if(grDictionary.next()){
		grDictionary.active = current.value;
		grDictionary.update();
	}
	
})(current, previous);
