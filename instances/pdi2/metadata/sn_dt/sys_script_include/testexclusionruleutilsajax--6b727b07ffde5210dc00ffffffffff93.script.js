var TestExclusionRuleUtilsAjax = Class.create();
TestExclusionRuleUtilsAjax.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
    OEM_CONFIG_ID: '91e2a7ed3b1dc6104747d22c95e45a9a',
    ERROR_GENERIC_TRANSLATION: gs.getMessage('Translation error occurred, please check connections and credentials'),

    // Determine if languages are enabled for DT
    hasDTEnabledLanguages: function() {
        var util = new TestExclusionRuleUtils();
        var languageDTGR = new GlideRecordSecure('sys_cs_dynamic_translation_virtual_agent');
        languageDTGR.addQuery('dt_enabled', true);
        languageDTGR.query();
        var enabledDTLanguage = languageDTGR.getRowCount() > 0;
        if (!enabledDTLanguage) {
            gs.addErrorMessage(util.ERROR_DT_LANGS_NOT_ENABLED);
        }
        return enabledDTLanguage;
    },

    // Determine if Exclusion Framework, a language service provider and language detector are enabled
    isDTAndExclusionFrameworkEnabled: function() {
        var util = new TestExclusionRuleUtils();
        var errorMsgs = [];

        if (!util.isExclusionFrameworkEnabled()) {
            errorMsgs.push(util.ERROR_EXCLUSION_FRAMEWORK_NOT_ENABLED);
        }

        if (!util.isNowAssistDTEnabled() && (!util.isNLUDTEnabled() || !util.getDefaultLanguageProviderId() || !util.getDefaultLanguageDetectorId())) {
            errorMsgs.push(util.ERROR_DT_LD_NOT_ENABLED);
        }

        errorMsgs.forEach(function(msg) {
            gs.addErrorMessage(msg);
        });

        return errorMsgs.length === 0;
    },

    getAvailableProviderMap: function() {
        var util = new TestExclusionRuleUtils();
        var availableProviders = {};
        var gr = new GlideRecordSecure('sn_dt_translator_configuration');
        gr.addActiveQuery();
        gr.query();

        while (gr.next()) {
            var providerId = gr.getUniqueValue();
            if (util.SUPPORTED_CONFIGS.hasOwnProperty(providerId)) {
                if ((gr.getValue('default_provider') === '1' && util.isNLUDTEnabled()) ||
                    (util.SUPPORTED_CONFIGS[providerId] === 'Microsoft Azure OEM' && util.isNowAssistDTEnabled())) {
                    availableProviders[providerId] = gr.getValue('name');
                }
            }
        }
        return JSON.stringify(availableProviders);
    },

    insertExclusionRule: function() {
        var ruleType = this.getParameter('sysparm_rule_type');
        var exclusionTerm = this.getParameter('sysparm_exclusion_term');
        var gr = new GlideRecordSecure('sn_dt_exclusion_rule');
        gr.initialize();
        gr.setValue('name', exclusionTerm);
        gr.setValue('rule_type', ruleType);
        gr.setValue('exclusion_term', exclusionTerm);
        var recordSysId = gr.insert();
        if (recordSysId) {
            return recordSysId;
        }

        return 'duplicate';
    },

    getLanguagesByProvider: function() {
        var providerMap = JSON.parse(this.getParameter('sysparm_availableProviders'));
        var util = new TestExclusionRuleUtils();

        // check cache for lang map
        if (GlidePluginManager.isActive('com.glide.scopedcache')) {
            var cachedStr = sn_scoped_cache.ScopedCacheManager.get('sn_dt_exclusion_rule_test', 'providerLangMap');

            if (cachedStr) {
                var cachedMap = JSON.parse(cachedStr);
                var cacheCleared = false;
                var providerIds = Object.keys(providerMap);
                var now = new GlideDateTime();
                var flushDate = new GlideDateTime(cachedMap['timeStamp']);

                if (now.after(flushDate)) {
                    sn_scoped_cache.ScopedCacheManager.flushScopedCache('sn_dt_exclusion_rule_test', 'providerLangMap');
                } else {
                    //ensure the supplied list of providers matches what is stored in cache
                    for (var i = 0; i < providerIds.length; i++) {
                        if (!cachedMap.hasOwnProperty(providerIds[i])) {
                            sn_scoped_cache.ScopedCacheManager.flushScopedCache('sn_dt_exclusion_rule_test', 'providerLangMap');
                            cacheCleared = true;
                            break;
                        }
                    }
                    if (!cacheCleared) {
                        delete cachedMap['timeStamp'];
                        return JSON.stringify(cachedMap);
                    }
                }
            }
        }

        // else do manual lookup
        var dtEnabledLangCodes = [];
        var dtEnabledLangGr = new GlideRecordSecure('sys_cs_dynamic_translation_virtual_agent');
        dtEnabledLangGr.addQuery('dt_enabled', true);
        dtEnabledLangGr.query();

        // populate DT enabled Language codes to compare with supported lang codes of the provider
        while (dtEnabledLangGr.next()) {
            var languageGr = dtEnabledLangGr.language.getRefRecord();
            dtEnabledLangCodes.push(languageGr.getValue('id'));
        }

        var providerSupportedLangs = {};
        var errors = {};

        // call subflows/sysprop to get supported langs
        Object.keys(providerMap).forEach(function(id) {
            util.getSupportedLangsForProvider(id, errors, providerSupportedLangs);
        });

        var availableLangsForProvider = {};
        // Filter out non-shared language codes of provider and DT enabled language packs
        Object.keys(providerSupportedLangs).forEach(function(providerId) {
            availableLangsForProvider[providerId] = providerSupportedLangs[providerId].filter(function(code) {
                return dtEnabledLangCodes.includes(code);
            });
        });

        Object.keys(availableLangsForProvider).forEach(function(providerId) {
            availableLangsForProvider[providerId] = availableLangsForProvider[providerId].map(function(code) {
                var langData = {
                    'code': code
                };

                var langName = util.getLanguageNameByCode(code);

                if (langName) {
                    langData['name'] = langName;
                }

                return langData;
            }).sort(function(a, b) {
                return a.name.localeCompare(b.name);
            });
        });

        var availableLangsForProviderAndErrors = {
            'availableLangsForProvider': availableLangsForProvider,
            'errors': errors
        };

        // only insert into cache if no errors occured
        if (GlidePluginManager.isActive('com.glide.scopedcache') && Object.keys(errors).length === 0) {
            var gdt = new GlideDateTime();
            var numDaysToFlush = gs.getProperty('sn_dt.test_exclusion_rule.flush_cache_after_days', '10');
            gdt.addDaysLocalTime(numDaysToFlush);
            availableLangsForProviderAndErrors['timeStamp'] = gdt.getValue();

            sn_scoped_cache.ScopedCacheManager.put('sn_dt_exclusion_rule_test', 'providerLangMap', JSON.stringify(availableLangsForProviderAndErrors));
        }
        return JSON.stringify(availableLangsForProviderAndErrors);
    },

    // get the translation
    translateTextAndBold: function() {
        var outputs = {};
        try {
            var util = new TestExclusionRuleUtils();
            var exclusionId = this.getParameter('sysparm_exclusionRuleId');

            var provider = this.getParameter('sysparm_translationProvider');
            var translatorName = util.getTranslatorName(provider);
            var inputText = this.getParameter('sysparm_inputText');
            var ruleType = this.getParameter('sysparm_ruleType');
            var exclusionTerm = this.getParameter('sysparm_exclusionTerm');
            var targetLanguageCode = this.getParameter('sysparm_languageSelected');

            var params = {
                'targetLanguages': [targetLanguageCode],
                'translator': translatorName,
                'additionalParameters': [{
                        'parameterName': 'exclusionRuleId',
                        'parameterValue': exclusionId
                    },
                    {
                        'parameterName': 'exclusionRuleType',
                        'parameterValue': ruleType
                    },
                    {
                        'parameterName': 'exclusionTerm',
                        'parameterValue': exclusionTerm
                    }
                ],
            };

            if (provider === this.OEM_CONFIG_ID) {
                // one_api_service_plan_feature_invocation record is required for OEM translation.
                params['additionalParameters'].push({
                    'parameterName': 'transaction_id',
                    'parameterValue': util.insertDummyInvocation()
                });
            }

            var translatedResponse = sn_dt_api.DynamicTranslation.getTranslation(inputText, params);

            if (!translatedResponse || !translatedResponse.translations[0]) {
                gs.addErrorMessage(this.ERROR_GENERIC_TRANSLATION);
                return outputs;
            }

            outputs.targetLanguage = translatedResponse.translations[0].targetLanguage;
            outputs.translatedResponse = translatedResponse.translations[0].translatedText;
            outputs.targetLanguageName = util.getLanguageNameByCode(outputs.targetLanguage);
            outputs.detectedLanguage = translatedResponse.detectedLanguage.code;
            outputs.detectedLanguageName = util.getLanguageNameByCode(outputs.detectedLanguage);

            // send the text to be bolded
            outputs.boldedTranslatedText = util.transformAndBoldText(provider, outputs.translatedResponse, exclusionId, exclusionTerm, ruleType);

            return JSON.stringify(outputs);
        } catch (error) {
            gs.addErrorMessage(gs.getMessage('Translation error occurred, please check connections and credentials: {0}', [error.message]));
            return outputs;
        }
    },

    boldInputText: function() {
        var util = new TestExclusionRuleUtils();
        var output = '';
        try {
            var exclusionId = this.getParameter('sysparm_exclusionRuleId');
            var provider = this.getParameter('sysparm_translationProvider');
            var inputText = this.getParameter('sysparm_inputText');
            var ruleType = this.getParameter('sysparm_ruleType');
            var exclusionTerm = this.getParameter('sysparm_exclusionTerm');

            output = util.transformAndBoldText(provider, inputText, exclusionId, exclusionTerm, ruleType);
            return output;
        } catch (error) {
            gs.addErrorMessage(gs.getMessage('Transform error occurred: {0}', [error.message]));
            return output;
        }
    },

    type: 'TestExclusionRuleUtilsAjax'
});
