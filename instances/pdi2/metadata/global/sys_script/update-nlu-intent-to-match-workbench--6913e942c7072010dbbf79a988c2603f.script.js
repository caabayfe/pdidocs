(function executeRule(current, previous /*null when async*/) {

	var sysCsTopicGr = new GlideRecord("sys_cs_topic");
	var sysCbTopicGr = new GlideRecord("sys_cb_topic");
	var sysCsTopicLanguageGr = new GlideRecord("sys_cs_topic_language");
	var sysCbTopicLanguageGr = new GlideRecord("sys_cb_topic_language");
	var tables = [sysCsTopicGr, sysCbTopicGr, sysCsTopicLanguageGr, sysCbTopicLanguageGr];

	var previous_nlu_intent_label = current.getValue("sys_name");
	var nlu_intent_label = current.getValue("name");

	tables.forEach(function (table) {
		updateNluIntentLabel(table);
	});

	function updateNluIntentLabel(table) {
		table.addQuery("nlu_intent", previous_nlu_intent_label);
		table.query();
		while (table.next()) {
			table.setValue("nlu_intent", nlu_intent_label);
			table.setValue("nlu_intent_label", nlu_intent_label);
			table.update();
		}
	}

})(current, previous);
