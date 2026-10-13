function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }

	var modelRecord = new GlideRecord('mb_model');
	modelRecord.addQuery('sys_id', newValue);
	modelRecord.query();
	if (modelRecord.next()) {
		g_form.setValue('metric', modelRecord.metric);
	}
   
}
