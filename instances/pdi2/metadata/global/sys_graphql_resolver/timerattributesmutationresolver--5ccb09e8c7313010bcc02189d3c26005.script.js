(function process(/*ResolverEnvironment*/ env) {

    var mappingFields = ['timer_duration', 'timer_relative_duration_datetime', 'timer_percentage', 'percentage_timer_input_datetime'];
    var normalFields = ['duration_type', 'timer_relative_duration_operator', 'timer_schedule'];

	var timerAttributesGr = new GlideRecordSecure('sys_pd_timer_attributes');
	if (!timerAttributesGr.canCreate())
		return;
	
    var input = env.getArguments().timerAttributes;
	
	if (!gs.nil(input.sys_id)) {
		// Get current record of Timer Attribute for mutation
		timerAttributesGr.get(input.sys_id);
	} else {
		// This is a new record, set up the reference fields
		timerAttributesGr.process_definition = input.process_definition;
		timerAttributesGr.source = input.laneOrActivity.source;
		timerAttributesGr.source_type = input.laneOrActivity.source_type;
	}

    normalFields.forEach(function(name){
		timerAttributesGr[name] = input[name] ? input[name] : "";
	});
	
	mappingFields.forEach(function(name){
		timerAttributesGr[name] = input[name] ? input[name].variableValue : "";
		var mappingValue = input[name] ? input[name].variableMapping : "";
		timerAttributesGr.getElement(name).setValueMapping(mappingValue);
	});

    var updatedRecordSysId = timerAttributesGr.update();
	
	var updatedRecordGr = new GlideRecordSecure('sys_pd_timer_attributes');
	updatedRecordGr.get(updatedRecordSysId);

	return updatedRecordGr;

})(env);
