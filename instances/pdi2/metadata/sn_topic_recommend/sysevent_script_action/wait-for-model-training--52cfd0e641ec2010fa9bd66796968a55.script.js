var generationId = event.parm1;
var util = new sn_topic_recommend.RecommendationUtil();

var stateTypes = global.NLUConstants.MODEL_STATE_TYPES;

var processGr = new GlideRecord('sn_topic_recommend_topic_staging');
processGr.addQuery('status', 'training_started');
processGr.addQuery('generation_id', generationId);
processGr.query();

var models = {};
var statusGr;
var training = false;
var modelTraining;
while (processGr.next()) {
	modelId = processGr.getValue('model');
	if (models[modelId]) {
		processGr.setValue('status', models[modelId]);
		processGr.update();
		continue;
	}
	statusGr = new global.NLUModel(modelId).getStatus();
	modelTraining = statusGr.getValue('state') === stateTypes.training;
	if (modelTraining) {
		training = true;
		break;
	}
	var secondaryLanguages = processGr.getValue('secondary_languages') ? processGr.getValue('secondary_languages').split(',') : [];
	var secondaryLanguageModels = util.getSecondaryLanguageModels(modelId, secondaryLanguages);
	for (var i = 0; i < secondaryLanguageModels.length; i++) {
		var secondaryModelTraining;
		statusGr = new global.NLUModel(secondaryLanguageModels[i].id).getStatus();
		secondaryModelTraining = statusGr.getValue('state') === stateTypes.training;
		if (secondaryModelTraining) {
			training = true;
			break;
		}
	}
	if (training) {
		break;
	}
	models[modelId] = 'training_complete';
	processGr.setValue('status', models[modelId]);
	processGr.update();
}

if (training) {
	gs.eventQueue('sn_topic_recommend.wait_for_training', null, generationId);
} else {
	gs.eventQueue('sn_topic_recommend.clone_topics', null, generationId);
}
