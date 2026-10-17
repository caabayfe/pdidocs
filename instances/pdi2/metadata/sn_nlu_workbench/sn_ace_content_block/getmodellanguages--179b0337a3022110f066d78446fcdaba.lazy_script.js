(function(context, pageParams, blockcontext) {
    var languages = global.NLUParloIntegrator.getSupportedLanguages().map(function(language) {
        return {
            "label": language.label,
            "value": language.value,
            "id": language.value,
            "hasSupportForSearch": language.hasSupportForSearch,
            "intentOnly": language.intentOnly
        };
    });

    var aiSearchLanguages = languages.filter(function(lang) {
        if (lang.hasSupportForSearch)
            return true;
    });

    var allLanguageOption = [{
        "id": "all",
        "label": gs.getMessage("All languages")
    }];

    return {
        modelLanguages: (!blockcontext || blockcontext.currentTab === 'virtual_agent') ? languages : aiSearchLanguages,
        VALanguages: languages,
        aiSearchLanguages: aiSearchLanguages,
        vaModelLanguages: allLanguageOption.concat(languages),
        aisModelLanguages: allLanguageOption.concat(aiSearchLanguages),
        showPredictionServerNotification: languages.length > 0 ? false : true,
        isVaPluginInstalled: GlidePluginManager.isActive('com.glide.cs.chatbot')
    };
})(context, pageParams, blockcontext);
