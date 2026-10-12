function transform(input) {
   
	var providerSupportedLanguagesMapping = {};
    var languages = [];
	var res = [];
    try {
        var languagesGr = new GlideRecord('sys_language');
        languagesGr.addActiveQuery();
        languagesGr.query();
        while (languagesGr.next()) {
            languages.push(languagesGr.getUniqueValue());
        }

        var modelConfigGr = new GlideRecord('sys_generative_ai_model_config');

		var allowed_providers = NAAManageLLMAPI.getAllowedProviders().providers;
		var allowed_providers_ids = allowed_providers.map(provider => provider.id);
        modelConfigGr.addQuery('provider.gen_ai_provider', 'IN', allowed_providers_ids);

        modelConfigGr.query();
        while (modelConfigGr.next()) {
            var languageId = modelConfigGr.getValue('supported_languages') || '';
            var languageLabel = modelConfigGr.getDisplayValue('supported_languages') || '';
			var provider =  modelConfigGr.provider.gen_ai_provider.getValue();
			var providerName = allowed_providers.filter(provider => provider.id == modelConfigGr.provider.gen_ai_provider)[0]['label'];

			

            var languageIds = languageId.split(',');
            var languageLabels = languageLabel.split(',');
            languageIds.forEach(function(id, index) {
				var providerMapping = providerSupportedLanguagesMapping[provider];
                var label = languageLabels[index];
                if (languages.includes(id)) {
                    if (providerMapping){
                        if(!providerMapping.supportedLanguages.map(i=> i.id).includes(id)) {
                            providerMapping.supportedLanguages.push({
                                id: id,
                                label: label
                            });
                        }
                    }
                    else{
                        providerSupportedLanguagesMapping[provider] = {
                            providerName: providerName,
                            supportedLanguages: [{
                            id: id,
                            label: label
                        }]
                        };
                    }
                }
            });
        }
    } catch (error) {
        gs.error("Failed to get Now LLM supported languages: " + error.toString());
    }
    for (key in providerSupportedLanguagesMapping){
			res.push({
				provider: key,
				providerName: providerSupportedLanguagesMapping[key].providerName,
				supportedLanguages: providerSupportedLanguagesMapping[key].supportedLanguages
			});
	}
    return res;

}
