(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var language = request.queryParams.lang.toString();
	var sessionModelId = request.queryParams.modelId.toString();
	response.setContentType('application/json');
	
	// map: primaryModel -> secondaryLanguages
	var associatedLanguages = {};
	// map: primaryModel: language
	var primaryLanguages = {};
	
	function addLanguage(source, target) {
		if (source.type === 'secondary' && source.language) {
			target.primaryId = source.primaryName;
			var group = associatedLanguages[target.primaryId] || [];
			group.push(target.language);
			associatedLanguages[target.primaryId] = group;
		} else if (source.type === 'primary') {
			target.primaryId = source.name;
			primaryLanguages[target.primaryId] = target.language;
		}
	}
	
	try {
		var models = NLUStudioService.getAllModels('virtual_agent');
		if (sessionModelId) {
			var sessionModelStatus = NLUStudioService.getModelStatusByName(sessionModelId);
		}
		var modelsResponse = [];
		var i;
		for (i = 0; i < models.length; i++) {
			var model = models[i];
			var modelObject = {
				'name': model.displayName || model.name,
				'id': model.name,
				'language': model.language || '',
				'scope': model.scope || '',
				'lastPublishedOn': model.lastPublishedOn || '',
				'readOnly': model.readOnly || false
			};
			addLanguage(model, modelObject);
			if (sessionModelId === modelObject.id) {
				modelObject.lastUpdatedOn = sessionModelStatus.lastUpdatedOn;
			}
			modelsResponse.push(modelObject);
		}
		var result = [];
		if (language) {
			for (var j = 0; j < modelsResponse.length; j++) {
				var modelObj = modelsResponse[j];
				if (modelObj.language === language) {
					result.push(modelObj);
				}
			}
		} else {
			result = modelsResponse;
		}
		for (i = 0; i < result.length; i++) {
			result[i].secondaryLanguages = associatedLanguages[result[i].primaryId];
			result[i].primaryLanguage = primaryLanguages[result[i].primaryId];
		}

		response.setStatus(200);
		response.setBody({ models: result });

	} catch (e) {
		response.setStatus(500);
		response.setBody({ errorMessage: e.message });
	}

})(request, response);
