function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '' || !g_form.isNewRecord()) {
      return;
   }
	
    //Auto populate appropriate incremented value for contact_attempt when Escalation Set changes
	var ga = new GlideAjax('OCEscDesignerContactPrefUtilAjax');
	ga.addParam('sysparm_name', 'getHighestOrderContactAttemptAjax');
	ga.addParam('sysparm_type', g_form.getValue('type'));
	ga.addParam('sysparm_sysId', newValue);
	ga.getXMLAnswer(function(response){
		var maxAttempt = parseInt(response);
		if (maxAttempt == -1) {
			g_form.setValue('contact_attempt', '');
			return;
		}
		g_form.setValue('contact_attempt', parseInt(maxAttempt) + 1);
		g_form.setReadOnly('contact_attempt', true);
	});
   
}
