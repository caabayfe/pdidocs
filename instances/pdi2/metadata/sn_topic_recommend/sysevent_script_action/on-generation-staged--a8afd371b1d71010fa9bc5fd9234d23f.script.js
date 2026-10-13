var intentUtil = new sn_nlu_discovery.IntentDiscoveryUtil();

var generationId = event.parm1;

var initialGr = new GlideRecord('sn_topic_recommend_topic_staging');
initialGr.addQuery('status', 'staged');
initialGr.addQuery('generation_id', generationId);
initialGr.query();
initialGr.setValue('status', 'intent_clone_started');
initialGr.updateMultiple();

var cloneGr = new GlideRecord('sn_topic_recommend_topic_staging');
cloneGr.addQuery('status', 'intent_clone_started');
cloneGr.addQuery('generation_id', generationId);
cloneGr.query();

var reportId;
var taxonomy;
var taxonomyIntent;
var model;
var modelName;
var language;
var secondaryLanguages;
var error = false;
while (cloneGr.next()) {
	reportId = cloneGr.getValue('report');
	taxonomy = cloneGr.getValue('taxonomy');
	taxonomyIntent = cloneGr.getValue('intent');
	modelId = cloneGr.getValue('model');
	language = cloneGr.getValue('language');
	modelName = cloneGr.getValue('model_name');
	secondaryLanguages = cloneGr.getValue('secondary_languages') ? cloneGr.getValue('secondary_languages').split(',') : [];
	try {
		intentUtil.cloneIntent(reportId, taxonomy, taxonomyIntent, modelId, {lang: language, display_name: modelName}, secondaryLanguages);		
		cloneGr.setValue('status', 'intent_clone_complete');
	} catch (e) {
		gs.error('Unable to create an NLU intent for [' + taxonomyIntent + '] and generationId [' + generationId + ']', e);
		cloneGr.setValue('status', 'intent_clone_error');
		error = true;
	}
	
	cloneGr.update();
}

if (error) {
	var cleanupGr = new GlideRecord('sn_topic_recommend_topic_staging');
	cleanupGr.addQuery('generation_id', generationId);
	cleanupGr.query();
	cleanupGr.setValue('status', 'error');
	cleanupGr.updateMultiple();
	gs.eventQueue('sn_topic_recommend.generation_complete', null, generationId);
} else {
	gs.eventQueue('sn_topic_recommend.intents_cloned', null, generationId);
}
