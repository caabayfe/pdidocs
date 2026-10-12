(function process(/*ResolverEnvironment*/ env) {

	var sysId = env.getArguments().sysId;
		
	var timerAttributesGr = new GlideRecordSecure('sys_pd_timer_attributes');
	
	if (!timerAttributesGr.canDelete())
		return;

	if (timerAttributesGr.get(sysId)) {
		var sys_id = timerAttributesGr.getElement('sys_id').getValue();
		var source = timerAttributesGr.getElement('source').getValue();
		var source_type = timerAttributesGr.getElement('source_type').getValue();
		timerAttributesGr.deleteRecord();
	}

	var elementMappingGr = new GlideRecord('sys_element_mapping');
	elementMappingGr.addQuery('id', sysId);
	elementMappingGr.query();
	elementMappingGr.deleteMultiple();

	return {
		sys_id: sys_id,
		source: source,
		source_type: source_type
	};

})(env);
