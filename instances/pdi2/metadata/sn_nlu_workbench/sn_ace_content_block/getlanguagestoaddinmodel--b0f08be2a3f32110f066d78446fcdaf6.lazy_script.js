(function(context, pageParams, blockcontext) {

	var modelId = blockcontext.modelForTranslation;
    var languages = blockcontext.currentTab === 'virtual_agent' ? blockcontext.modelLanguages : blockcontext.aiSearchLanguages;
    var selectedRowsLangs = [];
	// This is the primary language of the model
	selectedRowsLangs.push(blockcontext.primaryLanguageOfTranslationModelValue);
    var modelGr = new GlideRecord('sys_nlu_model');
    modelGr.addQuery('primary_model', modelId);
    modelGr.query();

    while (modelGr.next()) {
        gs.info(typeof modelGr.getValue('language'));
        selectedRowsLangs.push(modelGr.getValue('language'));
    }
    var languagesAvlbForTranslation = languages.filter(function(lang) {
        return selectedRowsLangs.indexOf(lang.id) < 0;
    });
    return languagesAvlbForTranslation;
})(context, pageParams, blockcontext);
