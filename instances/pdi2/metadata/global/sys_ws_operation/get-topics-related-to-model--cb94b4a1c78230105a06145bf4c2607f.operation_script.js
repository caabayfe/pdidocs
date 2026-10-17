(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var modelId = request.pathParams.modelId;
	var language = request.pathParams.language;
	response.setContentType('application/json');
	if (!modelId) {
		response.setStatus(400);
		response.setBody({ errorMessage: 'No input model id provided' });
		return;
	}
	if (!language) {
		response.setStatus(400);
		response.setBody({ errorMessage: 'No input language provided' });
		return;
	}
	
	try {
		var result = {};
		var i;
		var status = NLUStudioService.getModelStatusByName(modelId);	
		var modelStatus =  {
			'sysId': status.id || '',
			'name': status.displayName || '',
			'language': status.language || '',
			'scope': status.scope || '',
			'state': status.state || '',
			'type': status.type || '',
			'trainedVersion': status.trainedVersion || '',
			'publishedVersion': status.publishedVersion || '',
			'lastUpdatedOn': status.lastUpdatedOn || '',
			'lastTrainedOn': status.lastTrainedOn || '',
			'lastPublishedOn': status.lastPublishedOn || ''
		};
		var modelIdType = status.type || '';
		var modelIdsToSearch = [modelId];
		
		if (modelIdType !== 'ungrouped') {
			var primaryModelId = status.primaryName || '';
			modelIdsToSearch = primaryModelId ? modelIdsToSearch.concat(primaryModelId) : modelIdsToSearch;
			var allModels = NLUStudioService.getAllModels();
			for (i = 0; i < allModels.length; i++) {
				var model = allModels[i];
				if (model.name !== modelId && (model.primaryName === modelId || model.primaryName === primaryModelId)) {
					modelIdsToSearch.push(model.name);
				}
			}
		}
		
		var boundTopics = {};
		var boundTopicInfo = {};
		var cbTopicId;
		var csTopicId;
		var cbTopicLanguageGr = new GlideRecord('sys_cb_topic_language');
		cbTopicLanguageGr.addQuery('nlu_model', 'IN', modelIdsToSearch);
		cbTopicLanguageGr.query();
		while (cbTopicLanguageGr.next()) {
			cbTopicId = cbTopicLanguageGr.getValue('cb_topic_id');
			boundTopics[cbTopicId] = {
				id: cbTopicId,
				name: '',
				csTopicId: '',
				translationStatus: '',
				taskId: '',
				taskLink: '',
				modelId: '',
				modelLabel: '',
				intentId: '',
				intentLabel: ''
			};
		}
		
		var boundTopicIds = Object.keys(boundTopics);
		cbTopicLanguageGr = new GlideRecord('sys_cb_topic_language');
		cbTopicLanguageGr.addQuery('language_code', language);
		cbTopicLanguageGr.addQuery('cb_topic_id', 'IN', boundTopicIds);
		cbTopicLanguageGr.query();
		while (cbTopicLanguageGr.next()) {
			cbTopicId = cbTopicLanguageGr.getValue('cb_topic_id');
			boundTopicInfo = boundTopics[cbTopicId];
			boundTopicInfo.modelId = cbTopicLanguageGr.getValue('nlu_model');
			boundTopicInfo.modelLabel = cbTopicLanguageGr.getValue('nlu_model_label');
			boundTopicInfo.intentId = cbTopicLanguageGr.getValue('nlu_intent');
			boundTopicInfo.intentLabel = cbTopicLanguageGr.getValue('nlu_intent_label');
		}
		
		var boundTopicsSortedArray = [];
		var cbTopicGr = new GlideRecord('sys_cb_topic');
		cbTopicGr.addQuery('sys_id', 'IN', boundTopicIds);
		cbTopicGr.orderBy('name');
		cbTopicGr.query();
		while (cbTopicGr.next()) {
			cbTopicId = cbTopicGr.getValue('sys_id');
			boundTopicInfo = boundTopics[cbTopicId];
			boundTopicInfo.name = cbTopicGr.getValue('name');
			boundTopicsSortedArray.push(boundTopicInfo);
		}
		
		var csCbTopicIdMap = {};
		var cbCsTopicIdMap = {};
		var csTopicGr = new GlideRecord('sys_cs_topic');
		csTopicGr.addQuery('cb_topic_id', 'IN', boundTopicIds);
		csTopicGr.addQuery('published', true);
		csTopicGr.query();
		while (csTopicGr.next()) {
			cbTopicId = csTopicGr.getValue('cb_topic_id');
			csTopicId = csTopicGr.getValue('sys_id');
			csCbTopicIdMap[csTopicId] = cbTopicId;
			cbCsTopicIdMap[cbTopicId] = csTopicId;
		}
		
		var lfInstalled = new GlidePluginManager().isActive('com.glide.localization_framework');
		var canRequestTranslation = false;
		var requestTranslationResult = {};
		var translationStatusResult = {};
		var requestItemDetailsResult = {};
		if (lfInstalled) {
			var artifactName = "va_topic";
			var lfApi = new global.LocalizationFrameworkAPIV2();	
			var csTopicIds = Object.keys(csCbTopicIdMap);
			requestTranslationResult = lfApi.canRequestTranslations(artifactName, {"targetLanguages": [language]});
			canRequestTranslation = requestTranslationResult[language] ? requestTranslationResult[language].isEnabled : false;
			
			if (csTopicIds.length) {
				requestItemDetailsResult = lfApi.getRequestedItemDetails(csTopicIds, {"targetLanguages": [language]});
				translationStatusResult = lfApi.getArtifactsTranslationStatus(artifactName, csTopicIds, {"targetLanguages": [language]});
			}
		}
		
		var lfInsight = new global.LFGenerateLocalizationInsights();
		var taskExists;
		var taskIsClosed;
		var taskId;
		var taskLink;
		var translationStatus;
		var defaultTranslationStatus = lfInstalled ? 'not translated' : '';
		var insights_status = {
			'1': 'completely translated',
			'3': 'partially translated',
			'4': 'not translated'
		};

		for (i = 0; i < boundTopicsSortedArray.length; i++) {
			taskId = '';
			boundTopicInfo = boundTopicsSortedArray[i];
			cbTopicId = boundTopicInfo.id;
			csTopicId = cbCsTopicIdMap[cbTopicId] || '';
			boundTopicInfo.csTopicId = csTopicId;
			taskExists = requestItemDetailsResult[csTopicId] && requestItemDetailsResult[csTopicId][language] ? requestItemDetailsResult[csTopicId][language].exists : false;
			if (taskExists) {
				taskIsClosed = requestItemDetailsResult[csTopicId][language].details.isClosed || false;
				taskLink = taskIsClosed ? '' : requestItemDetailsResult[csTopicId][language].details.link;
				taskId = taskIsClosed ? '' : requestItemDetailsResult[csTopicId][language].details.sysId;
				boundTopicInfo.taskId = taskId;
				boundTopicInfo.taskLink = taskLink;
			}
			var statusKey = translationStatusResult[csTopicId] && translationStatusResult[csTopicId][language] ? lfInsight._calculateStatus(translationStatusResult[csTopicId][language].translationPercentage) : defaultTranslationStatus;
			translationStatus = insights_status[statusKey] || 'not translated';
			boundTopicInfo.translationStatus = taskId !== '' ? 'in progress' : translationStatus;
		}
		
		result.modelId = modelId;
		result.language = language;
		result.canRequestTranslation = canRequestTranslation;
		result.localizationFrameworkInstalled = lfInstalled;
		result.modelStatus = modelStatus;
		result.topics = boundTopicsSortedArray;
		
		response.setStatus(200);
		response.setBody(result);
		
	} catch (e) { 
		response.setStatus(500);
		response.setBody({ errorMessage: e.message });
	}

})(request, response);
