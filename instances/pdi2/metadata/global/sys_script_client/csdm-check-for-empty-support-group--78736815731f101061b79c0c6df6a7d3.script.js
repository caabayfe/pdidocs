function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	
	if (isLoading || oldValue == newValue)
		return;
	
	if (newValue === '') {
		var c = confirm(getMessage('Clearing the Support group value will also clear it on CIs within its related dynamic CI groups. Do you wish to continue?'));
		if(!c) {
			g_form.setValue('support_group', oldValue);
		}
   } else {
		var confirmation = true;
		var ga = new GlideAjax('CSDMCMDBUtilClient');
		ga.addParam('sysparm_name', 'isTSOSharingCI');
		ga.addParam('sysparm_tso_sys_id', g_form.getUniqueValue());
		ga.getXMLWait();

		var answer = JSON.parse(ga.getAnswer());
		if (answer.value)
			confirmation = confirm(getMessage('This might change values on CIs within its related dynamic CI groups, which are related to some other Service Offerings. Do you wish to continue?'));

		if (!confirmation)
			g_form.setValue('support_group', oldValue);
	}
}
