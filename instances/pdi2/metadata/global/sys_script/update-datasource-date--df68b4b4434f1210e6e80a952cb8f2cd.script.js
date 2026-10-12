(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord('ais_datasource');
	gr.get(current.getValue('datasource'));
	gr.setValue('sys_updated_on', new Date());
	gr.update();
})(current, previous);
