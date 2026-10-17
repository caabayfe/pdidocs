var RecommendationUtil = Class.create();
RecommendationUtil.prototype = {
    initialize: function() {
    },
	
	getTaxonomyIntentTopics: function() {
		var gr = new GlideRecord('sn_topic_recommend_taxonomy_topic');
		gr.addQuery('topic_sys_policy', 'read');
		gr.query();
		var models = {};
		var intents;
		var intent;
		var languages;
		var intentTopic;
		while (gr.next()) {
			intentTopic = {
				intent: gr.getValue('taxonomy_taxonomy_intent'),
				model: gr.getValue('taxonomy_taxonomy_model'),
				nluIntentId: gr.getValue('intent_sys_id'),
				nluIntentName: gr.getValue('intent_name'),
				nluModelId: gr.getValue('model_sys_id'),
				nluModelName: gr.getValue('model_name'),
				language: gr.getValue('taxonomy_language'),
				topicId: gr.getValue('topic_sys_id'),
				topicName: gr.getValue('topic_name'),
				topicDescription: gr.getValue('topic_description'),
				csTopicId: gr.getValue('cstopic_sys_id'),
				topicIsActive: gr.getValue('cstopic_active')				
			};
			intents = models[intentTopic.model] || {};
			intent = intents[intentTopic.intent] || {};
			languages = intent.languages || {};
			languages[intentTopic.language] = intentTopic;
			intent.languages = languages;
			intents[intentTopic.intent] = intent;
			models[intentTopic.model] = intents;
		}
		return models;
	},
	
	createModel: function(name, language) {
		var gr = new GlideRecord('sys_nlu_model');
		gr.setValue('display_name', name);
		gr.setValue('language', language);
		return gr.insert();
	},
	
	getUserTaxonomyIntentTopics: function() {
		var intentGr = new GlideRecord('sn_topic_recommend_taxonomy_topic');
		intentGr.addQuery('taxonomy_type', 'SYSTEM');
		intentGr.addQuery('topic_sys_policy', 'read');
		intentGr.orderBy('topic_created_on');
		intentGr.query();
		var taxa = {};
		var taxonomyName;
		var taxonomy;
		var taxonomyIntent;
		var intent;
		var languageCode;
		var language;
		while (intentGr.next()) {
			taxonomyName = intentGr.getValue('taxonomy_taxonomy_model');
			taxonomy = taxa[taxonomyName] || {};
			taxonomyIntent = intentGr.getValue('taxonomy_taxonomy_intent');
			intent = taxonomy[taxonomyIntent] || {};
			languageCode = intentGr.getValue('taxonomy_language');
			language = {
				nluIntent: intentGr.getValue('language_nlu_intent'),
				nluModel: intentGr.getValue('language_nlu_model'),
				nluProvider: intentGr.getValue('language_nlu_provider')
			};
			intent[languageCode] = language;
			taxonomy[taxonomyIntent] = intent;
			taxa[taxonomyName] = taxonomy;
		}

		var topicGr = new GlideRecord('sys_cb_topic_language');
		topicGr.addNullQuery('cb_topic_id.sys_policy');
		topicGr.orderBy('sys_updated_date');
		topicGr.query();
		var topics = {};
		var topicKey;
		while (topicGr.next()) {
			topicKey = topicGr.getValue('nlu_provider') + '|' + topicGr.getValue('nlu_model') + '|' + topicGr.getValue('nlu_intent');
			topics[topicKey] = {
				name: topicGr.cb_topic_id.name.toString(),
				createdDate: topicGr.cb_topic_id.sys_created_on.toString(),
				updatedDate: topicGr.cb_topic_id.sys_updated_on.toString(),
				sourceTopicId: topicGr.cb_topic_id.source_topic_id.toString()
			};
		}

		var topic;
		for (taxonomyName in taxa) {
			taxonomy = taxa[taxonomyName];
			for (taxonomyIntent in taxonomy) {
				intent = taxonomy[taxonomyIntent];
				for (languageCode in intent) {
					language = intent[languageCode];
					topicKey = language.nluProvider + '|' + language.nluModel + '|' + language.nluIntent;
					topic = topics[topicKey];
					intent[languageCode] = topic;
				}
			}
		}

		return taxa;
	},
	
	getInstalledTopics: function() {
		
		var topics = {};
		var topic;
		var installedTopics = {};
		
		// Get all topics installed through Topic Recommendation - linking table
		var installedGr = new GlideRecord('sn_topic_recommend_topic_linking');
		installedGr.addQuery('type', 'added');
		installedGr.query();
		while (installedGr.next()) {
			topic = {
				id: installedGr.getValue('topic'),
				taxonomy: installedGr.getValue('taxonomy'),
				intent: installedGr.getValue('intent'),
				installedDate: installedGr.topic.sys_created_on.toString(),
				name: installedGr.topic.name.toString(),
				csTopicId: null,
				topicIsActive: false
			};
			topics[topic.taxonomy] = topics[topic.taxonomy] || {};
			topics[topic.taxonomy][topic.intent] = topic;
			installedTopics[topic.id] = {
				taxonomy: topic.taxonomy,
				intent: topic.intent
			};   
		}
		
		// Get all topics installed through Topic Recommendation - staging table
		installedGr = new GlideRecord('sn_topic_recommend_topic_staging');
		installedGr.addNotNullQuery('topic_clone.sys_id');
		var statusCondition = installedGr.addQuery('status', 'complete');
		statusCondition.addOrCondition('status', 'warning');
		installedGr.orderByDesc('sys_updated_on');
		installedGr.query();
		while (installedGr.next()) {
			topic = {
				id: installedGr.getValue('topic_clone'),
				taxonomy: installedGr.getValue('taxonomy'),
				intent: installedGr.getValue('intent'),
				installedDate: installedGr.topic_clone.sys_created_on.toString(),
				name: installedGr.topic_clone.name.toString(),
				csTopicId: null,
				topicIsActive: false
			};
			topics[topic.taxonomy] = topics[topic.taxonomy] || {};
			if (!topics[topic.taxonomy][topic.intent]) {
				topics[topic.taxonomy][topic.intent] = topic;
				installedTopics[topic.id] = {
					taxonomy: topic.taxonomy,
					intent: topic.intent
				};
			}   
		}
    
        var installedTopicIds = Object.keys(installedTopics);
        var associatedCSTopicGr = new GlideRecord('sys_cs_topic');
        associatedCSTopicGr.addQuery('cb_topic_id', 'IN', installedTopicIds);
        associatedCSTopicGr.addQuery('published', true);
        associatedCSTopicGr.query();
        while (associatedCSTopicGr.next()) {

            var topicId = associatedCSTopicGr.getValue('cb_topic_id');
            var csTopicId = associatedCSTopicGr.getValue('sys_id');
            var isActive = associatedCSTopicGr.getValue('active') === '1';
			var installedTopic = installedTopics[topicId];

            topics[installedTopic.taxonomy][installedTopic.intent].csTopicId = csTopicId;
            topics[installedTopic.taxonomy][installedTopic.intent].topicIsActive = isActive;

        }

        
		// Get all other topics installed through Intent cloning
		installedGr = new GlideRecord('sn_topic_recommend_taxonomy_topic');
		installedGr.addQuery('taxonomy_type', 'CUSTOM');
		installedGr.addNullQuery('topic_sys_policy');
		installedGr.orderBy('topic_created_on');
		installedGr.query();
		while (installedGr.next()) {
			topic = {
				id: installedGr.getValue('topic_sys_id'),
				taxonomy: installedGr.getValue('taxonomy_taxonomy_model'),
				intent: installedGr.getValue('taxonomy_taxonomy_intent'),
				installedDate: installedGr.getValue('topic_sys_created_on'),
				name: installedGr.getValue('topic_name'),
				csTopicId: installedGr.getValue('cstopic_sys_id'),
				topicIsActive: installedGr.getValue('cstopic_active')	
			};
			topics[topic.taxonomy] = topics[topic.taxonomy] || {};
			topics[topic.taxonomy][topic.intent] = topics[topic.taxonomy][topic.intent] || topic;
		}
		return topics;
	},
	
	getNluProvider: function() {
		var nluProvider = null;
		var nluProviderName = null;
		var enabled = false;
		var gr = new GlideRecord('sys_cs_general_settings');
		gr.setLimit(1);
		gr.query();
		while (gr.next()) {
			enabled = gr.getValue('nlu_enabled') == 1;
			nluProvider = gr.getValue('nlu_driver');
			nluProviderName = gr.getDisplayValue('nlu_driver');
		}
		return { id: nluProvider, name: nluProviderName, enabled: enabled };
	},
	
	isServiceNowNLUEnabled: function() {
		var provider = this.getNluProvider();
		return provider.enabled && provider.name === 'ServiceNow NLU';
	},
	
	getAvailableModels: function() {
		var enabledLanguages = this.getEnabledLanguages();
		var allModels = global.NLUStudioService.getAllModels('virtual_agent');
		var gr = new GlideRecord('sys_nlu_model');
		gr.addQuery('sys_policy', 'read');
		gr.query();
		var readOnlyIds = {};
		while (gr.next()) {
			readOnlyIds[gr.getUniqueValue()] = true;
		}
		var results = [];
		var primaryModels = {};
		var secondaryLanguageEnabled = {};
		var secondaryLanguages = {};
		var primaryModelId;
		var index;
		var model;
		var existing;
		for (index = 0; index < allModels.length; index++) {
			model = allModels[index];
			if (!readOnlyIds[model.id]) {
				if (model.type === 'primary') {
					primaryModels[model.id] = model;
				} else if (model.type === 'secondary') {
					if (enabledLanguages[model.language]) {
						secondaryLanguageEnabled[model.primaryId] = true;	
					}
					existing = secondaryLanguages[model.primaryId];
					secondaryLanguages[model.primaryId] = existing ? existing.concat(model.language) : [model.language];
					
				} else if (enabledLanguages[model.language]) {
					results.push(model);
				}
			}
		}
		
		for (primaryModelId in primaryModels) {
			model = primaryModels[primaryModelId];
			model.secondaryLanguages = secondaryLanguages[primaryModelId] || [];
			if (enabledLanguages[model.language] || secondaryLanguageEnabled[primaryModelId]) {
				results.push(model);
			}
		}
		
		return results;
	},
	
	getEnabledLanguages: function() {
		var languages = this.getLanguages();
		var enabledLanguages = {};
		for (var i = 0; i < languages.length; i++) {
			var language = languages[i];
			if (language.nluEnabled == true){
				enabledLanguages[language.id] = true;
			}
		}
		return enabledLanguages;
	},

	getSupportedNluLanguages: function() {
		try {
			var mlServiceResult = sn_ml.MLServiceUtil.fetchGraphQL('query { NLU { supportedLanguages { name, language, intents { entities { isEnabled } } } } }');
			var result = JSON.parse(mlServiceResult);
			var supportedLanguages = [];
			if (result.data && result.data.NLU) {
				supportedLanguages = result.data.NLU.supportedLanguages;
			}
			return supportedLanguages;
		} catch(ex) {
			return [];
		}
	},

	getLanguages: function() {
		var nluLanguages = {};
		var nluProvider = this.getNluProvider();
		var languages = [];
		var languageId;
		var languageName;
		var sessionLanguage = gs.getSession().getLanguage();
		var languageTracker = {};

		var gr = new GlideRecord('sys_cs_nlu_language');		
		if (nluProvider.enabled) {
			gr.addQuery('enabled', true);
			gr.addQuery('language.driver', nluProvider.id);
			gr.query();
			while (gr.next()) {
				nluLanguages[gr.language.code] = true;
			}
		}
		
		gr = new GlideRecord('sys_choice');
		gr.addQuery('name', 'sys_user');
		gr.addQuery('element', 'preferred_language');
		gr.addNullQuery('inactive').addOrCondition('inactive', false);
		gr.addQuery('language', sessionLanguage);
		gr.addQuery('value', '!=', 'NULL_OVERRIDE');
		gr.query();
		while (gr.next()) {
			languageId = gr.getValue('value');
			languageLabel = gr.getValue('label');
			languages.push({ id: languageId, name: languageLabel, nluEnabled: !!nluLanguages[languageId] });
			languageTracker[languageId] = true;
		}
		
		gr.initialize();
		gr.addQuery('name', 'sys_user');
		gr.addQuery('element', 'preferred_language');
		gr.addNullQuery('inactive').addOrCondition('inactive', false);
		gr.addQuery('language', 'en');
		gr.addQuery('value', '!=', 'NULL_OVERRIDE');
		gr.query();
		while (gr.next()) {
			languageId = gr.getValue('value');
			languageLabel = gr.getValue('label');
			if (!languageTracker[languageId]) {
				languages.push({ id: languageId, name: languageLabel, nluEnabled: !!nluLanguages[languageId] });
				languageTracker[languageId] = true;
			}
		}

		var supportedLanguages = this.getSupportedNluLanguages();
		supportedLanguages.map(function(supportedLanguage) {
			languageId = supportedLanguage.language;
			languageLabel = supportedLanguage.name;
			if (!languageTracker[languageId]) {
				languages.push({ id: languageId, name: languageLabel, nluEnabled: !!nluLanguages[languageId] });
			}
		});

		return languages;
	},
	
	getLinkableTopics: function() {
		var gr = new GlideRecord('sys_cb_topic');
		gr.addNullQuery('sys_policy');
		gr.addQuery('type', 'STANDARD');
		gr.orderBy('name');
		gr.query();
		var results = [];
		while (gr.next()) {
			results.push({
				id: gr.getUniqueValue(),
				name: gr.getValue('name')
			});
		}
		return results;
	},
	
	getSecondaryLanguageModels: function(modelId, secondaryLanguages) {
		var gr = new GlideRecord('sys_nlu_model');
		gr.addQuery('primary_model', modelId);
        gr.addQuery('language', 'IN', secondaryLanguages);
		gr.query();
		var results = [];
		while (gr.next()) {
			var secondaryLanguageModel = {};
			secondaryLanguageModel.id = gr.getValue('sys_id');
			secondaryLanguageModel.name = gr.getValue('name');
			secondaryLanguageModel.display_name = gr.getValue('display_name');
			secondaryLanguageModel.language = gr.getValue('language');
			results.push(secondaryLanguageModel);
		}
		return results;
	},
	
	getLinkedTopics: function() {
		var gr = new GlideRecord('sn_topic_recommend_topic_linking');
		gr.addQuery('type', 'linked');
		gr.query();
		var topics = {};
		var linkedTopic;
		var topicLinks = {};
		while (gr.next()) {
			linkedTopic = {
				linkedId: gr.getUniqueValue(),
				linkedDate: gr.sys_created_on.toString(),
				taxonomy: gr.getValue('taxonomy'),
				intent: gr.getValue('intent'),
				topicId: gr.getValue('topic'),
				topicName: gr.topic.name.toString(),
				csTopicId: null,
				topicIsActive: false
			};
			topics[linkedTopic.taxonomy] = topics[linkedTopic.taxonomy] || {};
			topics[linkedTopic.taxonomy][linkedTopic.intent] = linkedTopic;
			var taxonomyIntent = {
				taxonomy: linkedTopic.taxonomy, 
				intent: linkedTopic.intent
			};
			topicLinks[linkedTopic.topicId] = topicLinks[linkedTopic.topicId] ? topicLinks[linkedTopic.topicId].concat(taxonomyIntent): [taxonomyIntent]; 
		}

		var linkedTopicIds = Object.keys(topicLinks);
		var associatedCSTopicGr = new GlideRecord('sys_cs_topic');
		associatedCSTopicGr.addQuery('cb_topic_id', 'IN', linkedTopicIds);
		associatedCSTopicGr.addQuery('published', true);
		associatedCSTopicGr.query();
		while (associatedCSTopicGr.next()) {
			var topicId = associatedCSTopicGr.getValue('cb_topic_id');
			var csTopicId = associatedCSTopicGr.getValue('sys_id');
			var isActive = associatedCSTopicGr.getValue('active') === '1';
			var links = topicLinks[topicId];
			for (index = 0; index < links.length; index++) {
				var link = links[index];
				topics[link.taxonomy][link.intent].csTopicId = csTopicId;
				topics[link.taxonomy][link.intent].topicIsActive = isActive;
			}
		}
		
		return topics;
	},
	
	getIgnoredIntents: function () {
		var gr = new GlideRecord('sn_topic_recommend_topic_linking');
		gr.addQuery('type', 'ignored');
		gr.query();
		var ignoredIntent = {};
		var ignoredIntents = {};
		while(gr.next()) {
			ignoredIntent = {
				ignoredId: gr.getUniqueValue(),
				ignoredDate: gr.sys_created_on.toString(),
				taxonomy: gr.getValue('taxonomy'),
				intent: gr.getValue('intent'),
			};
			ignoredIntents[ignoredIntent.taxonomy] = ignoredIntents[ignoredIntent.taxonomy] || {};
			ignoredIntents[ignoredIntent.taxonomy][ignoredIntent.intent] = ignoredIntent;
		}
		
		return ignoredIntents;
	},
	
	trainModel: function (modelId, options){
		var trainJson, output, modelGr;
		var parloIntegrator;
		var result = {};

		try {
			nluModel = new global.NLUModel(modelId);
			modelGr = nluModel.getGR();
			if (!modelGr) throw new Error(gs.getMessage('Model id does not exist'));

			parloIntegrator = new global.NLUParloIntegrator(modelGr);

			// Populate train json:
			trainJson = global.NLUStudioTrainer.getTrainJson(nluModel, parloIntegrator);

			// Invoke service:
			output = parloIntegrator.train(trainJson, options);
			result.status = output.status;
			if (output.status === 'training') {
				result.trainingVersion = output.response.solutionVersion;
				// Update nlu_model_status table to indicate it is being currently trained
				nluModel.updateStatus({
					state: 'training'
				});
				result.status = 'success';
			} else if (output.status == 'success') {
				result.trainedVersion = output.response.solutionVersion;

				// Update nlu_model_status table
				nluModel.updateStatus({
					state: 'trained',
					trained_version: result.trainedVersion,
					last_trained_on: (new GlideDateTime()),
					dirty: false
				});
			} else if (output.status == 'failure') {
				result.messages = output.response.messages;
				result.errors = global.NLUHelper.getErrorsFromResponse(output.response);
			}
		} catch (e) {
			result.status = 'failure';
			result.message = e.message;
		}
		return result;
	},

    type: 'RecommendationUtil'
};
