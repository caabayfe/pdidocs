(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var TOPIC_ID_VARIABLE = 'db7cbc6229220110fa9b4ca2fb4c9db9';

	var topicIds = [];
	var varGr = new GlideRecord('sys_variable_value');
	varGr.addQuery('document', 'sys_atf_step');
	varGr.addQuery('variable', TOPIC_ID_VARIABLE);
	varGr.query();
	var topicId;
	while (varGr.next())  {
		topicId = varGr.getValue('value');
		topicIds.push(topicId);
	}

	var topicGr = new GlideRecord('sys_cs_topic');
	topicGr.addQuery('sys_id', 'NOT IN', topicIds);
	topicGr.addQuery('name', 'DOES NOT CONTAIN', '_PRVW_');
	topicGr.addQuery('is_system_topic', false);
	topicGr.addNullQuery('cb_topic_id.sys_policy');
	topicGr.addQuery('type', 'STANDARD').addOrCondition('type', 'SMALL_TALK').addOrCondition('type', 'SETUP_TOPIC');
	topicGr.addQuery('model_type', '!=', 'llm');
	topicGr.orderByDesc('last_published_on');
	topicGr.query();
	var topics = [];
	while (topicGr.next()) {
		var topic = {};
		topic.topicName = topicGr.getDisplayValue('cb_topic_id');
		if (topic.topicName) {
			topic.cbTopicId = topicGr.getValue('cb_topic_id');
			topic.topicLastPublishedOn = topicGr.getValue('last_published_on');
			topics.push(topic);
		}
	}

	response.setStatus(200);
	response.setBody(topics);

})(request, response);
