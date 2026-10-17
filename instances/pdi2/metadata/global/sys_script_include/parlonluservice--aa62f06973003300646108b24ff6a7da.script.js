var ParloNLUService = Class.create();
ParloNLUService.prototype = {
	initialize: function() {
		this._adapter = new global.ParloNLUAdapter();
	},
	getModels: function () {
		var filteredVAModels = this.filterVAModels(NLUStudioService.getAllModels('virtual_agent'));
		return this._adapter.getModels(JSON.stringify(filteredVAModels));
	},
    filterVAModels: function(modelJSON) {
        modelJSON = modelJSON.filter(function (e) {return e != null;});
        return modelJSON;
    },
	getEntities: function(modelId, intentId) {
		if (gs.nil(modelId) && gs.nil(intentId)) {
			return;
		}
		var entities = NLUStudioService.getEntitiesByModel(modelId, true, { includeDraft: true });
		var systemEntities = NLUStudioService.getSystemEntitiesByModel(modelId);
		entities=entities.concat(systemEntities);
		if (!gs.nil(intentId)) {
			entities = NLUStudioService.getEntitiesByIntent(intentId,modelId).concat(entities);
		}
		return this._adapter.getEntities(modelId, JSON.stringify(entities));
	},
	getIntents: function(modelId) {
		return this._adapter.getIntents(modelId, JSON.stringify(NLUStudioService.getIntentsByModel(modelId, true, { includeDraft: true, includeDisabled: true })));
	},

	predict: function(modelId, utterance, previewModelId, preferredModel, preferredIntent, context, featuresRequested, conversationId) {
        if (gs.nil(utterance) && gs.nil(modelId)) {
            return;
        }

        var predictionResults = {};
        try {
            var inputJson = {
                "utterance": utterance
            };
            var labelOptions = modelId.match(/^ml_.*/) === null ? labelOptions = {
                'useLabel': true
            } : {};
            var currDate = (new Date()).toJSON();
            var options = {
                clientRequestTime: currDate.split('T')[0]
            };
            if (!gs.nil(featuresRequested)) {
                var featuresRequestedObj = JSON.parse(featuresRequested);
                inputJson['featuresRequested'] = featuresRequestedObj;
            }
            if (!gs.nil(preferredIntent) && !gs.nil(preferredIntent.length) &&  preferredIntent.length > 0) {
                options.preferredIntentCtx = preferredModel + "." + preferredIntent;
            }
			if (!gs.nil(context) && !gs.nil(context.name) && this._isNonEmptyArray(context.messages)) {
				inputJson[context.name] = {};
				if (this._isNonEmptyArray(context.messages)) {
					inputJson[context.name] = context;
				}
				if (!gs.nil(context.provider_context) && !gs.nil(context.provider_context.name) && !gs.nil(context.provider_context.properties)) {
					inputJson[context.name][context.provider_context.name] = context.provider_context.properties;
				}
			}
			if (!gs.nil(conversationId)) {
				inputJson['conversationId'] = conversationId;
			}

            var solutionVersion;
            if (modelId === previewModelId) {
                solutionVersion = NLUStudioService.getLastTrainedVersion(modelId);
            } else {
                solutionVersion = NLUStudioService.getPublishedVersion(modelId);
            }
            predictionResults = solutionVersion.predict(inputJson, options);


            return this._adapter.predict(modelId, JSON.stringify(predictionResults));
        } catch (e) {
            predictionResults.status = 'failure';
            predictionResults.message = e.message;
        }
        return predictionResults;
	},
	preparePredictRequestBody: function(utterance,modelId) {
		return JSON.stringify({"utterance": utterance, "modelId":modelId});
	},
	_isNonEmptyArray: function(obj) {
		return !gs.nil(obj) && !gs.nil(obj.length) && obj.length>0;
	},

	type: 'ParloNLUService'
};
