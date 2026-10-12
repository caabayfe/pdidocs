(function(context, pageParams, blockcontext) {
    var modelId = blockcontext.modelToDuplicateSysId;
    var secondaryLanguages = blockcontext.selectedSecondaryLangsForCloning;
    var secondaryLanguagesValues = Array.isArray(secondaryLanguages) ?
        secondaryLanguages.map(function(lang) {
            return lang.id;
        }) :
        [];
    var payload = {
        model_props: {
            display_name: blockcontext.duplicateModelName,
            description: blockcontext.modelDescription,
            language: blockcontext.primaryLanguageOfCloneModel
        },
        secondary_languages: secondaryLanguagesValues
    };

    if (modelId) {
        var cloneModel = new global.NLUCloneModel(modelId);
        var result = cloneModel.clone(payload);
		return result;
    }
})(context, pageParams, blockcontext);
