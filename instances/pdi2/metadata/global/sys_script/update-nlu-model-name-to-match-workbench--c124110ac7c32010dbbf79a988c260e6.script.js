(function executeRule(current, previous /*null when async*/) {

	var sysCsTopicGr = new GlideRecord("sys_cs_topic");
	var sysCbTopicGr = new GlideRecord("sys_cb_topic");
	var sysCsTopicLanguageGr = new GlideRecord("sys_cs_topic_language");
	var sysCbTopicLanguageGr = new GlideRecord("sys_cb_topic_language");
	var tables = [sysCsTopicGr, sysCbTopicGr, sysCsTopicLanguageGr, sysCbTopicLanguageGr];

	var nlu_model_id = current.getValue("name");
	var nlu_model_label = current.getValue("display_name");

	tables.forEach(function (table) {
		updateNluModelLabel(table);
	});

	function updateNluModelLabel(table) {
		table.addQuery("nlu_model", nlu_model_id);
		table.query();
		while (table.next()) {
			table.setValue("nlu_model_label", nlu_model_label);
			table.update();
		}
	}

})(current, previous);
