(function executeRule(current, previous /*null when async*/ ) {

    var selectedLanguageMappings = current.getValue('language_code_mappings');
    var languageCodeMappings = getLanguageCodeMappings(selectedLanguageMappings);
    var duplicateLanguages = [];
    selectedLanguageMappings = selectedLanguageMappings.split(",");
    var languageOccurenceFlag = {};
    for (var languageMappingIdx = 0; languageMappingIdx < selectedLanguageMappings.length; languageMappingIdx++) {
        var selectedLanguageMapping = selectedLanguageMappings[languageMappingIdx];
        var language = languageCodeMappings[selectedLanguageMapping];
        if (!language) {
            gs.addErrorMessage(gs.getMessage("One or more language code mapping record(s) do not exist."));
            current.setAbortAction(true);
            return;
        }
        if (languageOccurenceFlag[language]) {
            duplicateLanguages.push(language);
        }
        languageOccurenceFlag[language] = true;
    }

    if (duplicateLanguages.length > 0) {
        gs.addErrorMessage(gs.getMessage("Multiple language code mappings cannot be selected for the same language code(s): {0}.", duplicateLanguages.join(", ")));
        current.setAbortAction(true);
    }

    function getLanguageCodeMappings(selectedLanguageMappings) {
        var languageCodeMappings = {};
        var gr = new GlideRecord('sn_trans_commons_language_code_mapping');
        gr.addQuery('sys_id', 'IN', selectedLanguageMappings);
        gr.query();
        while (gr.next()) {
            languageCodeMappings[gr.getUniqueValue()] = gr.getDisplayValue('language_code');
        }
        return languageCodeMappings;
    }

})(current, previous);
