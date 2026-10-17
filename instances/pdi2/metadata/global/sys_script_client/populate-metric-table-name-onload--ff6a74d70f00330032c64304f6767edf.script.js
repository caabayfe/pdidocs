function onLoad() {
	var modelRecord = new GlideRecord('mb_model');
	modelRecord.addQuery('sys_id', g_form.getValue("model"));
	modelRecord.query();
	if (modelRecord.next()) {
		g_form.setValue('metric', modelRecord.metric);
	}
   
}
