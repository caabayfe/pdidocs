(function () {
	if (pm.isZboot())
		return;

	var gr = new GlideRecord('sys_dictionary');
	gr.addQuery('name', 'cmdb_health_metric');
	gr.addQuery('element', 'friendly_name');
	gr.addQuery('internal_type', 'string');
	gr.query();
	
	if(gr.next()) {
		new TranslationUtils().convert("cmdb_health_metric",["friendly_name"]);
		gs.info('cmdb_health_metric.friendly_name internal type changed to "translated_text"');
	}
})();
