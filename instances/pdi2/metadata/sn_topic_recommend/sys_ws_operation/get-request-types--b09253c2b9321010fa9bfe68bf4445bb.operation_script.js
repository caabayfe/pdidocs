(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	
	var gr = new GlideRecord('sn_topic_recommend_default_setting');
	gr.orderBy('sys_created_on');
	gr.query();
	var defaultSettings = [];
	var tables = [];
	var setting;
	while (gr.next()) {
		setting = {
			id: gr.getValue('sys_id'),
			table: gr.getValue('data_source'),
			field: gr.getValue('field_to_analyze'),
			taxonomy: gr.getValue('taxonomy'),
			filter: gr.getValue('filter_by'),
			displayFilter: gr.getDisplayValue('filter_by'),
			createdDate: gr.getValue('sys_created_on'),
			updatedDate: gr.getValue('sys_updated_on')
		};
		defaultSettings.push(setting);
		tables.push(setting.table);
	}
	
	var language = gs.getSession().getLanguage();
	
	var labels = new GlideRecord('sys_documentation');
	labels.addQuery('name', 'IN', tables.join(','));
	labels.addNullQuery('element');
	labels.addQuery('language', language);
	labels.query();
	tables = {};
	while (labels.next()) {
		tables[labels.getValue('name')] = labels.getValue('plural');
	}
	
	var index;
	for (index = 0; index < defaultSettings.length; index++) {
		setting = defaultSettings[index];
		setting.tableName = tables[setting.table] || setting.table;
	}
	
	response.setContentType('application/json');
	response.setStatus(200);
	response.setBody(defaultSettings);

})(request, response);
