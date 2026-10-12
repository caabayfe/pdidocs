function transform(input) {
    var provider = input.provider;
    var languages = input.languages;
    languages = languages.join(',');

    try {
        var nativeTranslationLangGr = new GlideRecord('sys_generative_ai_native_translation_langs');
        nativeTranslationLangGr.addQuery('model.provider.gen_ai_provider', provider);
        nativeTranslationLangGr.query();
        var count = nativeTranslationLangGr.getRowCount();
        if (count > 0) {
            while (nativeTranslationLangGr.next()) {
              var aiModelConfigGr = new GlideRecord('sys_generative_ai_model_config');
              aiModelConfigGr.addQuery('provider.gen_ai_provider', provider);
              aiModelConfigGr.addQuery('model', nativeTranslationLangGr.getDisplayValue('model'));
              aiModelConfigGr.query();
              if (aiModelConfigGr.next()){
                var supported_languages = aiModelConfigGr.getValue('supported_languages');
                _languages = languages.split(',').filter(lang=>supported_languages.includes(lang)); 
              }
                nativeTranslationLangGr.setValue('allowed_languages', (_languages || []));
                nativeTranslationLangGr.update();
            }
        } else {
            var modelConfigGr = new GlideRecord('sys_generative_ai_model_config');
            modelConfigGr.addQuery('provider.gen_ai_provider', provider);
            modelConfigGr.query();
            while (modelConfigGr.next()) {
                var model = modelConfigGr.getUniqueValue();
            
				if (!gs.nil(model)) {
						supported_languages = modelConfigGr.getValue('supported_languages');
						_languages = languages.split(',').filter(lang=>supported_languages.includes(lang)); 
						nativeTranslationLangGr.setValue('allowed_languages',(_languages || []));
						nativeTranslationLangGr.setValue('model', model);
						nativeTranslationLangGr.insert();
				}
			}
        }
		return 'success';
    } catch (error) {
        gs.error("Failed to get Now LLM supported languages" + error.toString());
		return 'error';
    }

}
