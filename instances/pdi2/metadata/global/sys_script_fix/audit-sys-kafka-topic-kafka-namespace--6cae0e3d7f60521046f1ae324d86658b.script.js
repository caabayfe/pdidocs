const enableAuditForTable = function (tableName) {
	var gr = new GlideRecord('sys_dictionary');
	gr.addQuery('name', tableName);
	gr.addNullQuery('element');
	gr.setLimit(1);
	gr.query();

	if (gr.next()) {
		var isAudit = gr.getValue('audit');
		if (isAudit == 0) {
			gs.log(tableName + ': update to enable auditing.');
			gr.setValue('audit', 1);
			gr.update();
		} else {
			gs.log(tableName + ': already audit enabled.');
		}
	} else {
		gs.log('Error: enable audit for: ' + tableName + ' did not find table.');
	}
};

const enableAuditSysKafkaTopicNamespace = function () {
	enableAuditForTable('sys_kafka_topic');
	enableAuditForTable('sys_kafka_namespace');
};

enableAuditSysKafkaTopicNamespace();
