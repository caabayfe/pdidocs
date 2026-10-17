(function executeRule(current, previous /*null when async*/) {
	try {
		if (current.language.driver.getDisplayValue() !== "ServiceNow NLU") {
			return;
		}
		var gr = new GlideRecord('sys_cs_general_settings');
		gr.addQuery("nlu_driver.name", "ServiceNow NLU");
		gr.addQuery("nlu_enabled", "true");
		gr.query();
		if (!gr.next()) {
			return;
		}

		var serviceNowProviderId = gr.getValue("nlu_driver");
		var enabledLanguageCode = current.language.code.toString();
		var allModels = NLUStudioService.getAllModels();
		var primarySecondaryMap = {};
		for (var i = 0; i < allModels.length; ++i) {
			var model = allModels[i];
			if (model.language === enabledLanguageCode) {
				var modelInfo = {
					id : model.id,
					displayName: model.displayName,
					name: model.name
				};
				if (model.type === "secondary") {
					primarySecondaryMap[model.primaryName] = modelInfo;
				} else if (model.type === "primary") {
					primarySecondaryMap[model.name] = modelInfo;
				}
			}
		}
		if (Object.keys(primarySecondaryMap).length == 0) {
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
			if (primarySecondaryMap[cbTopicRecord.nlu_model]) {
				boundTopics.push(cbTopicRecord);
			}
			if (cbTopicRecord.language_code === enabledLanguageCode) {
				boundTopicsInEnabledLanguage[cbTopicRecord.cb_topic_id] = true;
				if (cbTopicRecord.nlu_model === null || cbTopicRecord.nlu_intent === null) {
					boundTopicsInEnabledLanguageWithEmptyModelIntent[cbTopicRecord.cb_topic_id] = cbTopicRecord.sys_id;
				}
			}
		}

		var nluIntents = {};
		var nluIntentGr = new GlideRecord("sys_nlu_intent");
		nluIntentGr.addQuery("model.language", enabledLanguageCode);
		nluIntentGr.addQuery("enable", "true");
		nluIntentGr.query();
		while (nluIntentGr.next()) {
			var intentKey = nluIntentGr.getValue("name") + "||" + nluIntentGr.getValue("model");
			nluIntents[intentKey] = true;
		}

		boundTopics.forEach(function(topic) {
			var boundIntent = topic.nlu_intent;
			var model = primarySecondaryMap[topic.nlu_model];
			var newLangModel = model.id;
			var newLangModelLabel = model.displayName;
			var newLangModelName = model.name;
			var isIntentEnabled = nluIntents[boundIntent + "||" + newLangModel];
			if (!isIntentEnabled) {
				return;
			}
			if (!boundTopicsInEnabledLanguage[topic.cb_topic_id]) {
				var cbTopicLanguageGr = new GlideRecord("sys_cb_topic_language");
				cbTopicLanguageGr.initialize();
				cbTopicLanguageGr.setValue('cb_topic_id', topic.cb_topic_id);
				cbTopicLanguageGr.setValue('language_code', enabledLanguageCode);
				cbTopicLanguageGr.setValue('nlu_intent', topic.nlu_intent);
				cbTopicLanguageGr.setValue('nlu_intent_label', topic.nlu_intent_label);
				cbTopicLanguageGr.setValue('nlu_model', newLangModelName);
				cbTopicLanguageGr.setValue('nlu_model_label', newLangModelLabel);
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
				gr.setValue('nlu_model', newLangModelName);
				gr.setValue('nlu_model_label', newLangModelLabel);
				gr.setValue('nlu_entities', topic.nlu_entities);
				gr.update();
			}
		});
	} catch (e) {
		gs.log("Create Secondary NLU Language Binding (BR), with enabled language: " +
			current.language.code.toString() + " exception: " + e);
	}
})(current, previous);
