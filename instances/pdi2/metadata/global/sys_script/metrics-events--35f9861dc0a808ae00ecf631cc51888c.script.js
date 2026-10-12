queueMetricUpdate();

function queueMetricUpdate() {    
	var gru =  new GlideScriptRecordUtil.get(current);
	var fieldsChanged = gru.getChangedFieldNames();
	var gr = getDefinitions(fieldsChanged);
	fields = '';
	while (gr.next())
		fields += gr.field + ',';
	
	if (fields.length > 0) {
		fields = '[' + fields.substring(0, fields.length - 1) + ']';
		gs.eventQueue('metric.update', current, fields, current.sys_mod_count, 'metric_update');
	}
}

function getDefinitions(fields) {
	var gr = new GlideAggregate('metric_definition');
	gr.addActiveQuery();
	var tables = GlideDBObjectManager.getTables(current.getTableName());
	gr.addQuery('table', tables);
	gr.addQuery('field', fields);
	gr.groupBy('field');
	gr.query();
	return gr;
}
