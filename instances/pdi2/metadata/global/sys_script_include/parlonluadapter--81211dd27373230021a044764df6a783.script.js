var ParloNLUAdapter = Class.create();
ParloNLUAdapter.prototype = {
    initialize: function() {
    },

    getModels: function (parloModelsJSON) {
		if (gs.nil(parloModelsJSON))
			return {
            'models': []
        };
        var modelsArray = JSON.parse(parloModelsJSON);
        var modelsArrayFormatted = [];
        for (var i = 0; i < modelsArray.length; i++) {
			if (modelsArray[i] && modelsArray[i].id && modelsArray[i].name) {
				modelsArrayFormatted.push(this._toModel(modelsArray[i]));
			}
        }
        return {
            'models': modelsArrayFormatted
        };
    },
    getEntities: function (modelId, parloEntitiesJSON) {
		if (gs.nil(parloEntitiesJSON))
			return {
            'model_id': modelId,
            'entities': []
        };

        var entitiesByModelIdArray = JSON.parse(parloEntitiesJSON);

        var entitiesArrayFormatted = [];
        for (var i = 0; i < entitiesByModelIdArray.length; i++) {
            entitiesArrayFormatted.push(this._toEntity(entitiesByModelIdArray[i]));
        }
        return {
            'model_id': modelId,
            'entities': entitiesArrayFormatted
        };
    },
    getIntents: function (modelId,parloIntentsJSON) {
        if (gs.nil(parloIntentsJSON))
			return {
            'model_id': modelId,
            'intents': []
        };

        var intentsArray = JSON.parse(parloIntentsJSON);
        var intentsArrayFormatted = [];
        for (var i = 0; i < intentsArray.length; i++) {
            intentsArrayFormatted.push(this._toIntent(intentsArray[i]));
        }
        return {
            'model_id': modelId,
            'intents': intentsArrayFormatted
        };
    },
    predict: function (modelId,parloPredictionResultJSON) {
		if (gs.nil(parloPredictionResultJSON))
			return {
            "model_id": modelId,
            "scored_intents": [],
            "scored_entities": [],
			"scored_dialog_acts": []
        };

        var parloPredictionResult = JSON.parse(JSON.parse(parloPredictionResultJSON));
        if (parloPredictionResult.status == "failure")
            return this._toError(parloPredictionResult.response);
        var scoredIntents = [];
        var scoredEntities = [];
        var scoredDialogActs = [];

        for (var i = 0; i < parloPredictionResult.response.intents.length; i++) {
            var intent = parloPredictionResult.response.intents[i];
            var predictionQuality = !gs.nil(intent.confidence) ? intent.confidence : null;
            scoredIntents.push({
                "name": intent.intentName,
                "id": intent.intentName,
                "confidence": intent.score,
                "prediction_quality": intent.confidence
            });
            this._fillScoredEntities(intent.entities, scoredEntities, predictionQuality);
        }
        this._fillScoredEntities(parloPredictionResult.entities, scoredEntities, null);
        this._fillScoredDialogActs(parloPredictionResult.response.dialogActInfo, scoredDialogActs, modelId);

        return {
            "model_id": modelId,
            "scored_intents": scoredIntents,
            "scored_entities": scoredEntities,
			"scored_dialog_acts": scoredDialogActs,
			"raw_provider_result": JSON.stringify(parloPredictionResult)
        };
    },

    _toError: function (errorMessage) {
        return {
            'message': errorMessage
        };
    },
     _toModel: function (modelObj) {
        if (gs.nil(modelObj)) return;
		var name=modelObj.name;
		if(modelObj.hasOwnProperty('displayName'))
			name=modelObj.displayName;
        return {
            'name': name,
            'id': modelObj.name,
 			'language': modelObj.language,
			'scope': modelObj.scope
        };
    },
    _toIntent: function (intentObj) {
        if (gs.nil(intentObj)) return;
        return {
            'name': intentObj.name,
            'id': intentObj.name,
            'sys_id': intentObj.id,
            'enabled': gs.nil(intentObj.enabled) ? true : intentObj.enabled
        };
    },
    _toEntity: function (entityObj) {
        if (gs.nil(entityObj)) return;
        return {
            'name': entityObj.name,
            'id': entityObj.name
        };
    },
    _fillScoredEntities: function (entities, scoredEntities, predictionQuality) {
		if (!this._isNonEmtpyArray(entities)) return;
        for (i = 0; i < entities.length; i++) {
            var entity = entities[i];
            var entityName = entity.name.split('.').pop();
            scoredEntities.push({
                "name": entityName,
                "id": entityName,
                "value": entity.normalization && entity.normalization.value ? entity.normalization.value :  entity.value,
                "confidence": entity.score,
                "prediction_quality": predictionQuality
            });
        }
    },
	_fillScoredDialogActs: function (dialogActs, scoredDialogActs, modelId) {
		if (gs.nil(dialogActs) || !this._isNonEmtpyArray(dialogActs.dialogActs)) return;
		for (var i = 0; i < dialogActs.dialogActs.length; i++) {
			var dialogActValues = [];
			var dialogAct = dialogActs.dialogActs[i];
			this._fillDialogActValues(dialogAct, dialogActValues, modelId);

			if (!this._isNonEmtpyArray(dialogActValues)) continue;
			var dialogActName = this._asDialogActName(dialogAct.dialogActName);
			var asDialogAct = {
				"label": {"label":dialogActName, "type":dialogActName},
				"model_id":  modelId,
				"values": dialogActValues
			};
			scoredDialogActs.push(asDialogAct);
		}
	},
	_fillDialogActValues: function(dialogAct, dialogActValues, modelId) {
		if (gs.nil(dialogAct)) return;

		var label = this._asDialogActName(dialogAct.dialogActName);
		if (this._isNonEmtpyArray(dialogAct.entities)) {
			for (var i = 0; i < dialogAct.entities.length; i++) {
				var variable = !gs.nil(dialogAct.entities[i].name) ? this._asDialogActName(dialogAct.entities[i].name) : null;
				var value = !gs.nil(dialogAct.entities[i].value) ? dialogAct.entities[i].value : null;
				var confidence = !gs.nil(dialogAct.entities[i].score) ? dialogAct.entities[i].score : dialogAct.score;
				var prediction_quality = dialogAct.entities[i].confidence;
				var normalization = dialogAct.entities[i].normalization && dialogAct.entities[i].normalization.value ? dialogAct.entities[i].normalization.value :  null;
				var dialogActValue = {"variable": variable, "value": value, "confidence": confidence, "prediction_quality": prediction_quality, "model_id": modelId, "normalization": normalization};
				dialogActValues.push(dialogActValue);
			}
		} else {
			dialogActValues.push({"confidence": dialogAct.score});
		}
	},
	_asDialogActName: function(dialogActName) {
		if (gs.nil(dialogActName)) return;
		var split = dialogActName.split('.');
        return split.length > 0 ? split[split.length-1] : dialogActName;
	},
	_isNonEmtpyArray: function(obj) {
		return !gs.nil(obj) && !gs.nil(obj.length) && obj.length>0;
	},

    type: 'ParloNLUAdapter'
};
