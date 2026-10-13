var MAX_NAME_SIZE = 40;
var recommendationUtil = new sn_topic_recommend.RecommendationUtil();
var nluEnabled = recommendationUtil.isServiceNowNLUEnabled();

var recommendedCategoryId = getCategoryId('Recommended');
var flowNeededCategoryId = getCategoryId('Topic Flow Needed');
var serviceNowNLUId = getProviderId('ServiceNow NLU');

function getTopics() {
	var gr = new GlideRecord('sys_cb_topic');
	gr.query();
	var allTopics = {};
	while (gr.next()) {
		allTopics[gr.getValue('sys_id')] = {
			name: gr.getValue('name'),
			scope: gr.getValue('sys_scope')
		};
	}
	return allTopics;
}

function getTopicNames(topics) {
	var allNames = {};
	var key;
	var topic;
	for (key in topics) {
		topic = topics[key];
		allNames[toLowerCase(topic.name)] = true;
	}
	return allNames;
}

function toLowerCase(value) {
	return value ? value.toLowerCase() : value;
}

function truncateEnding(name, ending) {
	var newName = name;
	if (name.endsWith(ending)) {
		newName = name.substring(0, name.lastIndexOf(ending));
	}
	return newName.trim();
}

function normalizeName(name) {
	var newName = name.trim();
	newName = truncateEnding(newName, '(Template)');
	return newName;
}

function buildSuffix(index, forTopic) {
	if (index === 1) {
		return forTopic ? ' (Recommendation)' : '';
	}
	return forTopic ? ' (Recommendation ' + index + ')' : ' ' + index;
}

function buildShortSuffix(index, forTopic) {
	if (index === 1) {
		return '';
	}
	return forTopic ? ' (v' + index + ')' : ' ' + index;
}

function createName(originalName, allNames, forTopic) {
	var normalizedName = normalizeName(originalName);
	var newName = normalizedName;
	var index = 1;
	var difference;
	do {
		suffix = buildSuffix(index++, forTopic);
		newName = normalizedName + suffix;
		if (newName.length > MAX_NAME_SIZE) {
			suffix = buildShortSuffix(index - 1, forTopic);
			newName = normalizedName + suffix;
		}
		if (newName.length > MAX_NAME_SIZE) {
			newName = normalizedName.substring(0, MAX_NAME_SIZE - suffix.length) + suffix;
		}
	} while (allNames[toLowerCase(newName)]);
	allNames[toLowerCase(newName)] = true;
	return newName;
}

function insertLanguage(topicId, intentName, modelId, modelName, language, scope) {
	var gr = new GlideRecord('sys_cb_topic_language');
	gr.setValue('cb_topic_id', topicId);
	gr.setValue('nlu_intent', intentName);
	gr.setValue('nlu_intent_label', intentName);
	gr.setValue('nlu_model', modelId);
	gr.setValue('nlu_model_label', modelName);
	gr.setValue('nlu_provider', serviceNowNLUId);
	gr.setValue('language_code', language);
	gr.setValue('sys_scope', scope);
	gr.insert();
}

function updateClonedLanguages(topicId, modelId, modelName, language, topicEncountered) {
	var gr = new GlideRecord('sys_cb_topic_language');
	gr.addQuery('cb_topic_id', topicId);
	if (!nluEnabled) {
		if (topicEncountered) {
			return true;
		}
		gr.query();
		gr.deleteMultiple();
		return true;
	}
	gr.addQuery('language_code', language);
	gr.query();
	if (!gr.hasNext()) {
		return false;
	}
	gr.setValue('nlu_model', modelId);
	gr.setValue('nlu_model_label', modelName);
	gr.updateMultiple();
	return true;
}

function updateTopicMetadata(topicId, name, emptyTopic) {
	var gr = new GlideRecord('sys_cb_topic');
	gr.get('sys_id', topicId);
	if (emptyTopic) {
		gr.setValue('key_phrases', name);
		gr.setValue('category', recommendedCategoryId + ',' + flowNeededCategoryId);
	} else {
		gr.setValue('category', recommendedCategoryId);
	}
	gr.update();
}
	
function getCategoryId(name) {
	var categoryGr = new GlideRecord('sys_cb_topic_category');
	categoryGr.get('name', name);
	return categoryGr.getUniqueValue();
}

function getProviderId(name) {
	var providerGr = new GlideRecord('open_nlu_driver');
	providerGr.get('name', name);
	return providerGr.getUniqueValue();
}

var designerUtils = new sn_cs.VADesignerUtils();
var generationId = event.parm1;

var initialGr = new GlideRecord('sn_topic_recommend_topic_staging');
var queryCondition = initialGr.addQuery('status', 'training_complete'); // For NLU enabled
queryCondition.addOrCondition('status', 'training_error'); // Handling training failures allowing draft models
queryCondition.addOrCondition('status', 'staged'); // For NLU disabled
initialGr.addQuery('generation_id', generationId);
initialGr.query();
initialGr.setValue('status', 'topic_clone_started');
initialGr.updateMultiple();

var processGr = new GlideRecord('sn_topic_recommend_topic_staging');
processGr.addQuery('status', 'topic_clone_started');
processGr.addQuery('generation_id', generationId);
processGr.query();

var error = false;
var topicId;
var topicGr;
var allTopics = getTopics();
var allNames = getTopicNames(allTopics);
var topicCloneId;
var clonedTopics = {};
var topicCloneIds = [];
var intentName;
var published;
var globalScope = gs.getSession().getCurrentApplicationId();
while (processGr.next()) {
	topicId = processGr.getValue('topic');
	intentName = processGr.getValue('intent');
	var topic = allTopics[topicId];
	var clonedTopic = clonedTopics[topicId || intentName];
	var name = topic ? topic.name : intentName;
	name = clonedTopic || createName(name, allNames, !!topic);
	var modelId = processGr.model.name.toString();
	var modelName = processGr.model.display_name.toString();
	var language = processGr.getValue('language');
	var currentScope = processGr.getValue('scope') || globalScope;
	
	try {
		if (!clonedTopics[topicId || intentName]) {
			if (topic) {
				topicCloneId = designerUtils.cloneTopic(topicId, name, currentScope);
			} else {
				topicCloneId = designerUtils.createEmptyTopic(name, currentScope);
			}
			topicCloneIds.push(topicCloneId);
		}
		var updated = updateClonedLanguages(topicCloneId, modelId, modelName, language, clonedTopics[topicId]);
		if (!updated) {
			insertLanguage(topicCloneId, intentName, modelId, modelName, language, currentScope);
		}
		var secondaryLanguages = processGr.getValue('secondary_languages') ? processGr.getValue('secondary_languages').split(',') : [];
		var secondaryLanguageModels = recommendationUtil.getSecondaryLanguageModels(processGr.getValue('model'), secondaryLanguages);
		for (var i = 0; i < secondaryLanguageModels.length; i++) {
			var secondaryModelId = secondaryLanguageModels[i].name;
			var secondaryModelName = secondaryLanguageModels[i].display_name;
			var secondaryLanguage = secondaryLanguageModels[i].language;
			var updatedSecondaryLanguage = updateClonedLanguages(topicCloneId, secondaryModelId, secondaryModelName, secondaryLanguage, clonedTopics[topicId]);
			if (!updatedSecondaryLanguage) {
				insertLanguage(topicCloneId, intentName, secondaryModelId, secondaryModelName, secondaryLanguage, currentScope);
			}
		}
		updateTopicMetadata(topicCloneId, name, !topic);
		clonedTopics[topicId || intentName] = name;
		processGr.setValue('status', 'topic_clone_complete');
		processGr.setValue('topic_clone', topicCloneId);
	} catch (e) {
		gs.error('Unable to create a topic for [' + intentName + '] and generationId [' + generationId + ']', e);
		processGr.setValue('status', 'topic_clone_error');
		error = true;
		break;
	}
	
	processGr.update();
}

if (error) {
	var cleanupGr = new GlideRecord('sn_topic_recommend_topic_staging');
	cleanupGr.addQuery('generation_id', generationId);
	cleanupGr.query();
	cleanupGr.setValue('status', 'error');
	cleanupGr.updateMultiple();
	
	cleanupGr = new GlideRecord('sys_cb_topic_language');
	cleanupGr.addQuery('cb_topic_id', 'IN', topicCloneIds.join(','));
	cleanupGr.query();
	cleanupGr.deleteMultiple();
	
	cleanupGr = new GlideRecord('sys_cb_topic');
	cleanupGr.addQuery('sys_id', 'IN', topicCloneIds.join(','));
	cleanupGr.query();
	cleanupGr.deleteMultiple();

	gs.eventQueue('sn_topic_recommend.generation_complete', null, generationId);
} else {
	var finishGr = new GlideRecord('sn_topic_recommend_topic_staging');
	finishGr.addQuery('generation_id', generationId);
	finishGr.query();
	finishGr.setValue('status', 'complete');
	finishGr.updateMultiple();
	
	var stagingGr = new GlideRecord('sn_topic_recommend_topic_staging');
	stagingGr.addQuery('generation_id', generationId);
	stagingGr.addQuery('status', 'complete');
	stagingGr.query();
	while (stagingGr.next()) {
		var linkingGr = new GlideRecord('sn_topic_recommend_topic_linking');
		linkingGr.setValue('taxonomy', stagingGr.getValue('taxonomy'));
		linkingGr.setValue('intent', stagingGr.getValue('intent'));
		linkingGr.setValue('topic', stagingGr.getValue('topic_clone'));
		linkingGr.setValue('type', 'added');
		linkingGr.setValue('sys_scope', stagingGr.getValue('scope'));
		linkingGr.insert();
	}
	
	gs.eventQueue('sn_topic_recommend.generation_complete', null, generationId);
}
