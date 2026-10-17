function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (newValue) {
		var gr = new GlideRecord('cmn_rota_esc_step_def');
		gr.addQuery('escalation_set', g_form.getValue('escalation_set'));
		gr.addQuery('escalation_level', '<', newValue);
		gr.orderByDesc('escalation_level');
		gr.setLimit(1);
		gr.query(function(resultGr) {
			if (resultGr.next()) {
				var timeToNextStepOfPreviousStep = resultGr.getValue('time_to_next_step');
				if (!timeToNextStepOfPreviousStep) {
					g_form.addInfoMessage(getMessage("'Time to next step' should be defined in the previous step"));
				}
			}
		}); 
	}
}
