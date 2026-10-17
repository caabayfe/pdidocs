function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || (g_form.getValue('inherited') == true && g_form.isNewRecord())) {
      return;
   }
   
   if (g_scratchpad.active == undefined || g_scratchpad.active == 'false') {
      g_scratchpad.active = 'true';
      g_form.getReference('ci', setValues);
   }
}

function setValues(ci){
	g_form.setValue('asset', ci.asset);
	g_form.setValue('cost_center', ci.cost_center);
	g_form.setValue('user', ci.assigned_to);
	g_form.setValue('task', '');
	g_form.setValue('contract', '');
	g_form.setValue('source_id', '');

	g_scratchpad.active = 'false';
}
