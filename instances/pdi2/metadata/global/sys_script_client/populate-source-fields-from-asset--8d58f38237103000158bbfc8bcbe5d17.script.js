function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || (g_form.getValue('parent') != '' && g_form.isNewRecord())) {
      return;
   }

   if (g_scratchpad.active == undefined || g_scratchpad.active == 'false') {
      g_scratchpad.active = 'true';
	  g_form.getReference('asset', setValues);
   }
}

function setValues(asset) {
      g_form.setValue('ci', asset.ci);
      g_form.setValue('cost_center', asset.cost_center);
      g_form.setValue('user', asset.assigned_to);
      g_form.setValue('task', '');
      g_form.setValue('contract', '');
      g_form.setValue('source_id', '');

      g_scratchpad.active = 'false';
}
