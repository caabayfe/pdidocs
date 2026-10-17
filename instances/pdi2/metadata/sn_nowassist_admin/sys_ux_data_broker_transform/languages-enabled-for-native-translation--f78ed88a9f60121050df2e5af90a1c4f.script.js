function transform(input) {
    var providerLanguagesMapping = {};
	var res = [];
    var installedLanguages = [];
	var enabledLanguagesId = [];
    var enabledLanguagesLabel = [];
    try {
        var languagesGr = new GlideRecord('sys_language');
        languagesGr.addActiveQuery();
        languagesGr.query();
        while (languagesGr.next()) {
            installedLanguages.push(languagesGr.getUniqueValue());
        }
        var nativeTranslationLangGr = new GlideRecord('sys_generative_ai_native_translation_langs');
        nativeTranslationLangGr.query();

        while (nativeTranslationLangGr.next()) {
			enabledLanguagesId = [];
            enabledLanguagesLabel = [];
            var languageId = (nativeTranslationLangGr.getValue('allowed_languages') || '').split(',');
            var languageLabel = (nativeTranslationLangGr.getDisplayValue('allowed_languages') || '').split(',');
			var provider = nativeTranslationLangGr.model.provider.gen_ai_provider.getValue();
			var providerName = nativeTranslationLangGr.model.provider.getDisplayValue();
			var providerMapping = providerLanguagesMapping[provider];
            languageId.forEach(function(id, index) {
                var label = languageLabel[index];
                if (installedLanguages.includes(id)) {
                    enabledLanguagesId.push(id);
                    enabledLanguagesLabel.push(label);
                }

            });

            if (!gs.nil(languageId)) {
				if (providerMapping){
                providerMapping.languages = {
                    id: Array.from(new Set(providerMapping.languages.id.concat(enabledLanguagesId))),
                    label: Array.from(new Set(providerMapping.languages.label.concat(enabledLanguagesLabel)))
                };
				}
				else{
					providerLanguagesMapping[provider] = {
						languages:{
							id: enabledLanguagesId,
							label: enabledLanguagesLabel
						}
					};
				}
            }

        }
    } catch (error) {
        gs.error("Failed to get languages enabled for native translation" + error.toString());
    }
	return providerLanguagesMapping

}
