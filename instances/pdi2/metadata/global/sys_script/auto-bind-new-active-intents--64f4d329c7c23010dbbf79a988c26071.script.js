(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord('sys_cs_general_settings');
	gr.addQuery("nlu_driver.name", "ServiceNow NLU");
	gr.addQuery("nlu_enabled", "true");
	gr.query();
	if (!gr.next()) {
		return;
	}

	var serviceNowProviderId = gr.getValue("nlu_driver");
	var model = current.model.getRefRecord();
	if (!model.getValue("primary_model")) {
		return;
	}
	var modelName = model.getValue("name");
	var modelLabel = model.getValue("display_name");
	var newAddedLanguage = model.getValue("language");
	var intent = current.name.toString();

	var nluLanguageGr = new GlideRecord('sys_cs_nlu_language');
	nluLanguageGr.addQuery("language.driver", serviceNowProviderId);
	nluLanguageGr.addQuery("language.code", newAddedLanguage);
	nluLanguageGr.addQuery("enabled", "true");
	nluLanguageGr.query();
	if (!nluLanguageGr.next()) {
		return;
	}

	var sysCbTopicDictionary = [];
	var cbTopicLanguageGr = new GlideRecord("sys_cb_topic_language");
	cbTopicLanguageGr.addQuery("nlu_provider", serviceNowProviderId);
	cbTopicLanguageGr.query();
	while (cbTopicLanguageGr.next()) {
		var topic = {
			sys_id : cbTopicLanguageGr.getValue("sys_id"),
			cb_topic_id : cbTopicLanguageGr.getValue("cb_topic_id"),
			nlu_model : cbTopicLanguageGr.getValue("nlu_model"),
			nlu_model_label : cbTopicLanguageGr.getValue("nlu_model_label"),
			nlu_intent : cbTopicLanguageGr.getValue("nlu_intent"),
			nlu_intent_label : cbTopicLanguageGr.getValue("nlu_intent_label"),
			nlu_entities : cbTopicLanguageGr.getValue("nlu_entities"),
			language_code : cbTopicLanguageGr.getValue("language_code"),
			nlu_provider : cbTopicLanguageGr.getValue("nlu_provider"),
			sys_domain : cbTopicLanguageGr.getValue("sys_domain"),
			sys_package : cbTopicLanguageGr.getValue("sys_package"),
			sys_scope : cbTopicLanguageGr.getValue("sys_scope"),
			sys_policy : cbTopicLanguageGr.getValue("sys_policy")
		};
		sysCbTopicDictionary.push(topic);
	}

	var boundTopics = [];
	var boundTopicsInEnabledLanguage = {};
	var boundTopicsInEnabledLanguageWithEmptyModelIntent = {};

	for (var itr = 0; itr < sysCbTopicDictionary.length; ++itr) {
		var cbTopicRecord = sysCbTopicDictionary[itr];
		var intentMatched = cbTopicRecord.nlu_intent === intent;
		var modelMatched = cbTopicRecord.nlu_model_label === model.getDisplayValue("primary_model");
		if (intentMatched && modelMatched) {
			boundTopics.push(cbTopicRecord);
		}
		if (cbTopicRecord.language_code === newAddedLanguage) {
			boundTopicsInEnabledLanguage[cbTopicRecord.cb_topic_id] = true;
			if (cbTopicRecord.nlu_model === null || cbTopicRecord.nlu_intent === null) {
				boundTopicsInEnabledLanguageWithEmptyModelIntent[cbTopicRecord.cb_topic_id] = cbTopicRecord.sys_id;
			}
		}
	}

	boundTopics.forEach(function(topic) {
			if (!boundTopicsInEnabledLanguage[topic.cb_topic_id]) {
				var cbTopicLanguageGr = new GlideRecord("sys_cb_topic_language");
				cbTopicLanguageGr.initialize();
				cbTopicLanguageGr.setValue('cb_topic_id', topic.cb_topic_id);
				cbTopicLanguageGr.setValue('language_code', newAddedLanguage);
				cbTopicLanguageGr.setValue('nlu_intent', topic.nlu_intent);
				cbTopicLanguageGr.setValue('nlu_intent_label', topic.nlu_intent_label);
				cbTopicLanguageGr.setValue('nlu_model', modelName);
				cbTopicLanguageGr.setValue('nlu_model_label', modelLabel);
				cbTopicLanguageGr.setValue('nlu_entities', topic.nlu_entities);
				cbTopicLanguageGr.setValue('nlu_provider', topic.nlu_provider);
				cbTopicLanguageGr.setValue('sys_domain', topic.sys_domain);
				cbTopicLanguageGr.setValue('sys_package', topic.sys_package);
				cbTopicLanguageGr.setValue('sys_scope', topic.sys_scope);
				cbTopicLanguageGr.setValue('sys_policy', topic.sys_policy);
				cbTopicLanguageGr.insert();
			}
			var sysId = boundTopicsInEnabledLanguageWithEmptyModelIntent[topic.cb_topic_id];
			if (sysId) {
				var gr = new GlideRecord("sys_cb_topic_language");
				gr.get(sysId);
				gr.setValue('nlu_intent', topic.nlu_intent);
				gr.setValue('nlu_intent_label', topic.nlu_intent_label);
				gr.setValue('nlu_model', modelName);
				gr.setValue('nlu_model_label', modelLabel);
				gr.setValue('nlu_entities', topic.nlu_entities);
				gr.update();
			}
		});
})(current, previous);
