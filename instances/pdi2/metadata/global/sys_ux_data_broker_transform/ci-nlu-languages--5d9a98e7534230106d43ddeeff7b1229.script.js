function transform(input) {
    var languageQueryParam = '';
    var languageParam = "^language.code=";
    var languageOrCondition = "^ORlanguage.code=";
    try {
        var glideLanguages = JSON.parse(new SNC.I18nPickerGenerator().getAvailableLanguages());
        glideLanguages.forEach(function(language) {
            languageQueryParam = languageQueryParam ? languageQueryParam + languageOrCondition + language.value : languageQueryParam + languageParam + language.value;
        });
    } catch (e) {
		
    }
    return languageQueryParam;
}
