function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (newValue === '') {
	   g_form.setValue('escalation_level', '');
	   return;
   }
   function populateEscalationLevel() {
	   var gr = new GlideRecord('cmn_rota_esc_step_def');
	   gr.addQuery('escalation_set', g_form.getValue('escalation_set'));
	   gr.orderByDesc('escalation_level');
	   gr.setLimit(1);
	   gr.query(function(resultGr) {
		   var nextEscalationLevel = 1;
		   if (resultGr.next()) {
			   nextEscalationLevel = parseInt(resultGr.getValue('escalation_level')) + 1;
		   }
		   g_form.setValue('escalation_level', nextEscalationLevel);
	   });
   }
	if (g_form.isNewRecord()) {
		if (!g_scratchpad.escalationLevel)
			populateEscalationLevel();
	}
}
