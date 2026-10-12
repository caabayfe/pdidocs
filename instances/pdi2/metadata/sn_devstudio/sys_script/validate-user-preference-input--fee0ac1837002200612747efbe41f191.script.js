(function executeRule(current, previous) {
	var gr = new GlideRecord('sn_devstudio_studio_preferences');
	gr.addQuery('sys_id', current.getValue('preference'));
	gr.query();
	
	var value = current.getValue('value'),
		type,
		allowedValues;
	
	if (gr.next()) {
		type = gr.getValue('type');
		allowedValues = _.pluck(JSON.parse(gr.getValue('allowed_values')), 'value');
	}
	
	if (!_.contains(allowedValues, value)) {		
		gs.addErrorMessage('Invalid input: ' + value + '. Valid values are: ' + allowedValues.toString() + '.');
		current.setAbortAction(true);
	}
})(current, previous);
