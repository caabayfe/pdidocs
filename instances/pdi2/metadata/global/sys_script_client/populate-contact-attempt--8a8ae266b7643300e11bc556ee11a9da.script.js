function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '' || !g_form.isNewRecord()) {
      return;
   }
   //Auto populate appropriate incremented value for contact_attempt
	var map = {
		rota: 'cmn_rota',
		escalation_set: 'cmn_rota_escalation_set'
	};
	var ga = new GlideAjax('OCEscDesignerContactPrefUtilAjax');
	ga.addParam('sysparm_name', 'getHighestOrderContactAttemptAjax');
	ga.addParam('sysparm_type', newValue);
	ga.addParam('sysparm_sysId', g_form.getValue(map[newValue]));
	ga.getXMLAnswer(function(response){
		var maxAttempt = parseInt(response);
		if (maxAttempt == -1) {
			g_form.setValue('contact_attempt', '');
			return;
		}
		g_form.setValue('contact_attempt', parseInt(maxAttempt) + 1);
	});
}
