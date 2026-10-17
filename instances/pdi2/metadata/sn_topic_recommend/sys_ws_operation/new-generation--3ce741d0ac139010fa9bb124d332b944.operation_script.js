(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var util = new sn_topic_recommend.RecommendationUtil();
	var nluEnabled = util.isServiceNowNLUEnabled();
	var generatedModels = util.getAvailableModels();
	
	function validate(generation) {
		if (!generation.generationId) {
			return false;
		}
		if (!generation.taxonomy) {
			return false;
		}
		if (nluEnabled && (!generation.models || !generation.models.length)) {
			return false;
		}
		if (!generation.intents || !generation.intents.length) {
			return false;
		}
		return true;
	}
	
	function createModels(models, taxonomy) {
		var index;
		var model;
		for (index = 0; index < models.length; index++) {
			model = models[index];
			if (!model.id) {
				var modelName = 'VA_' + taxonomy;
				var uniqueNumber = 0;
				var modelsCount = generatedModels.length;
				var i = 0;
				while (i < modelsCount) {
					var generateModelName = generatedModels[i].displayName;
					var modelNamePattern = new RegExp(modelName + "\\d*$");
					if (generateModelName.match(modelNamePattern)) {
						var generatedModelNumber = parseInt(generateModelName.substring(modelName.length));
						generatedModelNumber = isNaN(generatedModelNumber) ? 0 : generatedModelNumber;
						if (generatedModelNumber >= uniqueNumber) {
							uniqueNumber = generatedModelNumber + 1;
						}
					}
					i++;
				}
				if (uniqueNumber > 0) {
					modelName += uniqueNumber;
				}
				model.id = util.createModel(modelName, model.language);				
			}
		}
	}
	
	function createIntent(intent, model, secondaryLanguages) {
		var gr = new GlideRecord('sn_topic_recommend_topic_staging');
		gr.setValue('generation_id', intent.generationId);
		gr.setValue('report', intent.reportId);
		gr.setValue('request_type', intent.requestTypeId);
		gr.setValue('taxonomy', intent.taxonomy);
		gr.setValue('publish', intent.publish);
		gr.setValue('scope', intent.scope);
		if (nluEnabled) {
			gr.setValue('model', model.id);
			gr.setValue('model_name', model.name);
			gr.setValue('language', model.language);
			gr.setValue('secondary_languages', secondaryLanguages.join(','));
		}
		gr.setValue('intent', intent.intent);
		if (intent.topicId) {
			gr.setValue('topic', intent.topicId);			
		}
		gr.setValue('status', 'new');
		gr.insert();
	}
	
	function createIntents(generationId, taxonomy, intents, models, secondaryLanguages, autopublish, scope) {
		var intentIndex;
		var modelIndex;
		var intent;
		for (intentIndex = 0; intentIndex < intents.length; intentIndex++) {
			intent = intents[intentIndex];
			intent.generationId = generationId;
			intent.taxonomy = taxonomy;
			intent.publish = autopublish;
			intent.scope = scope;
			for (modelIndex = 0; modelIndex < models.length; modelIndex++) {
				createIntent(intent, models[modelIndex] || {}, secondaryLanguages);
			}
		}
	}
	
	function updateState(generationId) {
		var gr = new GlideRecord('sn_topic_recommend_topic_staging');
		gr.addQuery('generation_id', generationId);
		gr.query();
		
		gr.setValue('status', 'staged');
		gr.updateMultiple();
	}
	
	var generation = request.body.data;
	
	var valid = validate(generation);
	if (!valid) {
		response.setStatus(400);
		response.setError("Invalid request, missing required fields.");
		return;
	}
	
	var autopublish = !!generation.publish;
	var targetScope = gs.getSession().getCurrentApplicationId();
	
	if (nluEnabled) {
		createModels(generation.models || [], generation.taxonomy);
		createIntents(generation.generationId, generation.taxonomy, generation.intents, generation.models, generation.secondaryLanguages, autopublish, targetScope);
	} else {
		createIntents(generation.generationId, generation.taxonomy, generation.intents, [{}], generation.secondaryLanguages, autopublish, targetScope);
	}

	updateState(generation.generationId);
	
	response.setStatus(200);
	response.setContentType('application/json');
	response.setBody({
		status: 'SUCCESS'
	});
	
	if (nluEnabled) {
		gs.eventQueue('sn_topic_recommend.generation_staged', null, generation.generationId);
	} else {
		gs.eventQueue('sn_topic_recommend.clone_topics', null, generation.generationId);
	}

})(request, response);
