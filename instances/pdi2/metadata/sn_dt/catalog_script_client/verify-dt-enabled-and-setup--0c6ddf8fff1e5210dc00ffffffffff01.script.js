function onLoad() {

    var languageDTGA = new GlideAjax('sn_dt.TestExclusionRuleUtilsAjax');
    languageDTGA.addParam('sysparm_name', 'hasDTEnabledLanguages');
    languageDTGA.getXMLAnswer(_setDTForm);

    function _setDTForm(response) {
        g_form.setValue('dynamic_translation_enabled', response);
        if (response === 'false') {
            g_form.setDisplay('do_you_want_to_test_an_existing_or_new_exclusion_rule', true);
        }
    }

    var languageProviderGA = new GlideAjax('sn_dt.TestExclusionRuleUtilsAjax');
    languageProviderGA.addParam('sysparm_name', 'isDTAndExclusionFrameworkEnabled');
    languageProviderGA.getXMLAnswer(_setLanguageServiceEnabled);

    function _setLanguageServiceEnabled(response) {
        g_form.setValue('translation_service_enabled', response);
        if (response === 'false') {
            g_form.setDisplay('do_you_want_to_test_an_existing_or_new_exclusion_rule', true);
        }
    }
    var availableProvidersGA = new GlideAjax('sn_dt.TestExclusionRuleUtilsAjax');
    availableProvidersGA.addParam('sysparm_name', 'getAvailableProviderMap');
    availableProvidersGA.getXMLAnswer(_setTranslationProviderData);

    var availableProviderMap = {};

    function _setTranslationProviderData(response) {
        availableProviderMap = JSON.parse(response);
        Object.keys(availableProviderMap).forEach(function(id) {
            g_form.addOption('translation_provider', id, availableProviderMap[id]);
        });

        var languagesByProviderGA = new GlideAjax('sn_dt.TestExclusionRuleUtilsAjax');
        languagesByProviderGA.addParam('sysparm_name', 'getLanguagesByProvider');
        languagesByProviderGA.addParam('sysparm_availableProviders', JSON.stringify(availableProviderMap));

        languagesByProviderGA.getXMLAnswer(_populateAndSetProviderLangs);
    }

    function _populateAndSetProviderLangs(response) {
        var res = JSON.parse(response);
        var langMap = res.availableLangsForProvider;
        var errorsByProvider = res.errors;

        //remove translator option if error occured
        Object.keys(errorsByProvider).forEach(function(providerId) {
            g_form.removeOption('translation_provider', providerId);
            delete availableProviderMap[providerId];
        });

        g_form.setValue('languages_by_provider', JSON.stringify(langMap)); //save response to hidden string var to be used on provider change
        var providerOnLoadId = Object.keys(availableProviderMap)[0];
        var onLoadLangs = langMap[providerOnLoadId];

        for (var i = 0; i < onLoadLangs.length; i++) {
            var lang = onLoadLangs[i];
            g_form.addOption('target_language', lang.code, lang.name);
            g_form.addOption('target_language_selected', lang.code, lang.name);

            if (i === 0) {
                g_form.setValue('target_language', lang.code);
            }
        }
    }
}
