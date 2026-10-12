var LOG_ID = '[Remove OOB AISearch Fallback Option]';
var PROP_NAME ='remove_oob_ai_search_fallback_option_after_upgrade';
var OOB_CONTEXT_PROFILE_ID = '3a33973653211010a813ddeeff7b125a';

process();

function process() {
	
	if (!foundProperty(PROP_NAME)) {
		gs.info('{0}:The property {1} is not found. The process will be disregarded',[LOG_ID, PROP_NAME]);
		return;
	}
	
	if (shouldRemove(PROP_NAME)) {
		
		if(removeAISearchFallbackOption(OOB_CONTEXT_PROFILE_ID))
			gs.info('{0}:- AISearch Fallback Option for the profile:{1} got successfully removed',[LOG_ID, OOB_CONTEXT_PROFILE_ID]);
		
		if(removeProperty(PROP_NAME))
			gs.info('{0}:- Successfully removed the property -"{1}"', [LOG_ID, PROP_NAME]);
	}
}

function foundProperty(propertyName) {
	return !gs.nil(gs.getProperty(propertyName));
}

function shouldRemove(propertyName) {
	var val = gs.getProperty(propertyName);
	return !gs.nil(val) && val === 'true';
}

function removeAISearchFallbackOption(contextProfileId) {
	
	var gr = new GlideRecord('sys_cs_context_profile_topic');
	gr.addQuery('context_profile', contextProfileId);
	gr.addQuery('topic_type','ai_search_fallback');
	gr.query();
	
	if(gr.next()) {
		gr.setValue('topic','');
		return !gs.nil(gr.update());
	}
	gs.info('{0}:-Record is not found for contxt_profile:{1} , topic_type:{2}', [LOG_ID, contextProfileId, 'ai_search_fallback']);
	return false;
}

function removeProperty(PROP_NAME) {
	var gr = new GlideRecord('sys_properties');
	gr.addQuery('name', PROP_NAME);
	gr.query();
	
	if(gr.next())
		return gr.deleteRecord();
	
	return false;
}
