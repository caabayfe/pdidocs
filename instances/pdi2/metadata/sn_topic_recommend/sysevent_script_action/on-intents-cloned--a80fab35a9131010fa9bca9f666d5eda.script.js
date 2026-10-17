var generationId = event.parm1;
var util = new sn_topic_recommend.RecommendationUtil();

var initialGr = new GlideRecord('sn_topic_recommend_topic_staging');
initialGr.addQuery('status', 'intent_clone_complete');
initialGr.addQuery('generation_id', generationId);
initialGr.query();
initialGr.setValue('status', 'training_started');
initialGr.updateMultiple();

var processGr = new GlideRecord('sn_topic_recommend_topic_staging');
processGr.addQuery('status', 'training_started');
processGr.addQuery('generation_id', generationId);
processGr.query();

var error = false;
var models = {};
var result;

while (processGr.next()) {
	modelId = processGr.getValue('model');
	if (models[modelId]) {
		processGr.setValue('status', models[modelId]);
		processGr.update();
		continue;
	}
	
	try {
		result = util.trainModel(modelId);
		// Disabling NLUStudioTrainer version of trainModel and using customized version until messageKey and replacements are made available by NLU API team
		//result = global.NLUStudioTrainer.trainModel(modelId);
		if (result.status !== 'success') {
			if (result.messages) {
				var messageItems = result.messages;
				var errorMessages = [];
				for (var messageIdx = 0; messageIdx < messageItems.length; ++messageIdx) {
					errorMessages.push({
						messageKey: messageItems[messageIdx].messageKey,
						replacements: messageItems[messageIdx].replacements
					});
				}
				var errorString = JSON.stringify(errorMessages);
				processGr.setValue('staging_error', errorString);
			}
			throw new Error('Training failed');
		}
		var secondaryLanguages = processGr.getValue('secondary_languages') ? processGr.getValue('secondary_languages').split(',') : [];
		var secondaryLanguageModels = util.getSecondaryLanguageModels(modelId, secondaryLanguages);
		for (var i = 0; i < secondaryLanguageModels.length; i++) {
			var secondaryLanguageResult;
			secondaryLanguageResult = util.trainModel(secondaryLanguageModels[i].id);
			if (secondaryLanguageResult.status !== 'success') {
				throw new Error('Training failed');
			}
		}
		models[modelId] = 'training_started';
	} catch (e) {
		gs.error('Unable to initiate training for modelId [' + modelId + '] and generationId [' + generationId + ']', e);
		processGr.setValue('status', 'training_error');
		models[modelId] = 'training_error';
	}
	
	processGr.update();
}

gs.eventQueue('sn_topic_recommend.wait_for_training', null, generationId);
