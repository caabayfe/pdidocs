var TestExclusionRuleUtils = Class.create();
TestExclusionRuleUtils.prototype = {
    initialize: function() {
        //sn_dt_translator_configuration IDs -> Translator Name
        this.SUPPORTED_CONFIGS = {
            '91e2a7ed3b1dc6104747d22c95e45a9a': 'Microsoft Azure OEM',
            '7ecc98c0b7603300d1ca8c28ee11a9e6': 'Microsoft',
            '49d1152853473300ad65ddeeff7b12fb': 'Google'
        };
        this.MICROSOFT_VERSION_CON_ATTR_ID = '44f9042ab720330030e88c28ee11a954';
        this.GOOGLE_VERSION_CON_ATTR_ID = '8be64bc673e23300395108b24ff6a72e';
        this.GOOGLE_LOCATION_CON_ATTR_ID = '90574fc673e23300395108b24ff6a767';
        this.GOOGLE_PROJECT_ID_CON_ATRR_ID = '7927cbc673e23300395108b24ff6a77f';
        this.CS_GENERAL_SETTINGS_ID = '586237553b1323009cbbcea234efc42f';

        this.ERROR_DETECTED_LANGUAGE_NOT_FOUND = gs.getMessage('Detected language was not found');
        this.ERROR_DT_LANGS_NOT_ENABLED = gs.getMessage('Please enable Dynamic Translation for one or more languages');
        this.ERROR_DT_LD_NOT_ENABLED = gs.getMessage('Please ensure Dynamic translation and Language detection are configured and/or a default language provider and detector are established');
        this.ERROR_EXCLUSION_FRAMEWORK_NOT_ENABLED = gs.getMessage('Please enable the Exclusion Framework');
        this.ERROR_UNSUPPORTED_PROVIDER = gs.getMessage('Unsupported provider found');
        this.ERROR_GENERIC_TRANSFORM = gs.getMessage('Transform error occurred');
    },

    isNowAssistDTEnabled: function() {
        return gs.getProperty('sn_generative_ai.disable_dynamic_translation', 'true') === 'false' &&
            new sn_nowassist_admin.NowAssistConfig().isNowAssistEnabled();
    },

    isNLUDTEnabled: function() {
        var gr = new GlideRecordSecure('sys_cs_general_settings');
        if (gr.get(this.CS_GENERAL_SETTINGS_ID)) {
            return gr.getValue('nlu_enabled') === '1' && gr.getValue('dynamic_translation_virtual_agent') === '1' && gr.getValue('language_detection_for_topic_discovery') === '1';
        }
        return false;
    },

    // gets default language translator provider
    getDefaultLanguageProviderId: function() {
        var languageTranslatorGR = new GlideRecordSecure('sn_dt_translator_configuration');
        languageTranslatorGR.addActiveQuery();
        languageTranslatorGR.addQuery('default_provider', true);
        languageTranslatorGR.query();
        if (languageTranslatorGR.next()) {
            return languageTranslatorGR.getUniqueValue();
        }
        return null;
    },

    // gets default language detector provider
    getDefaultLanguageDetectorId: function() {
        var languageDetectionGR = new GlideRecordSecure('sn_dt_translator_configuration');
        languageDetectionGR.addActiveQuery();
        languageDetectionGR.addQuery('default_detection', true);
        languageDetectionGR.query();
        if (languageDetectionGR.next()) {
            return languageDetectionGR.getUniqueValue();
        }
        return null;
    },

    // Determine if exclusion framework is enabled
    isExclusionFrameworkEnabled: function() {
        return gs.getProperty('sn_dt.dynamic_framework.enable_exclusion_framework', 'true').toLowerCase() === 'true';
    },

    getTranslatorName: function(configId) {
        var configGr = new GlideRecordSecure('sn_dt_translator_configuration');
        if (configGr.get(configId)) {
            return configGr.getValue('name');
        }
        return null;
    },

    insertDummyInvocation: function() {
        var servicePlanGr = new GlideRecord('one_api_service_plan_invocation');
        servicePlanGr.initialize();

        var gr = new GlideRecord('one_api_service_plan_feature_invocation');
        gr.initialize();
        gr.setValue('capability_id', '9070ace2530a1110c271ddeeff7b120c'); //DT capability
        gr.setValue('feature_provider', '40ad8b92530201103296ddeeff7b12b4'); //DT of Utterance feature provider
        gr.setValue('service_plan_invocation', servicePlanGr.insert());
        gr.setValue('execution_mode', 'sync');
        gr.setValue('status', 'processing');
        return gr.insert();
    },

    getLanguageNameByCode: function(targetLanguage) {
        var languageName = '';
        var languageGR = new GlideRecordSecure('sys_language');
        languageGR.addQuery('id', targetLanguage);
        languageGR.query();
        if (languageGR.next()) {
            languageName = languageGR.getValue('name');
        } else {
            gs.addErrorMessage(this.ERROR_DETECTED_LANGUAGE_NOT_FOUND);
        }

        return languageName;
    },

    transformAndBoldText: function(provider, text, exclusionId, exclusionTerm, ruleType) {
        var transformedText = '';

        // transform the text
        var transformedTextsObj = sn_dt_api.DynamicTranslation.transformTextsToTranslateTestExclusionRule(
            provider,
            [text],
            exclusionId,
            exclusionTerm,
            ruleType);

        transformedText = transformedTextsObj.transformedTexts[0];

        if (!transformedText) {
            gs.addErrorMessage(this.ERROR_GENERIC_TRANSFORM);
            return transformedText;
        }

        // send the text to be bolded
        var boldText = new sn_dt_spoke.TransformTextAPI().boldTransformedText(provider, transformedText);
        return boldText;
    },

    getSupportedLangsForProvider: function(providerId, errors, providerSupportedLangs) {
        var providerResponse = {};
        var providerName = this.SUPPORTED_CONFIGS[providerId];

        switch (providerName) {
            case 'Microsoft Azure OEM':
                providerSupportedLangs[providerId] = this._getOEMSupportedLangs();
                break;

            case 'Microsoft':
                this._handleLanguageResponse(this._getMicrosoftSupportedLangs(), providerId, errors, providerSupportedLangs);
                break;

            case 'Google':
                this._handleLanguageResponse(this._getGoogleSupportedLangs(), providerId, errors, providerSupportedLangs);
                break;

            default:
                gs.addErrorMessage(this.ERROR_UNSUPPORTED_PROVIDER);
                break;
        }
    },

    _handleLanguageResponse: function(response, providerId, errors, providerSupportedLangs) {
        if (!response['errorCode'] && !response['errorMessage']) {
            providerSupportedLangs[providerId] = response.supportedLanguages;
        } else {
            errors[providerId] = true;
            gs.addErrorMessage(gs.getMessage('Error occurred while retrieving {0} supported languages: {1}', [this.SUPPORTED_CONFIGS[providerId], response['errorMessage']]));
        }
    },

    _getMicrosoftSupportedLangs: function() {
        try {
            var inputs = {
                'version': '3.0',
                'scope': 'translation'
            };

            var versionValue = this._getSysVariableValue(this.MICROSOFT_VERSION_CON_ATTR_ID);
            if (versionValue) {
                inputs['version'] = versionValue;
            }

            var outputs = this._invokeFlowAction('sn_ms_trans_spoke.get_supported_languages', inputs);

            var response = {
                'errorCode': outputs['error_code'],
                'errorMessage': outputs['error_message']
            };

            if (!outputs['error_code'] || !outputs['error_message']) {
                response['supportedLanguages'] = this._parseMicrosoftLangs(outputs['supported_languages']);
            }
            return response;
        } catch (error) {
            gs.addErrorMessage(gs.getMessage('Error while invoking Get supported languages flow action: {0}', [error.message]));
            return {
                'errorMessage': error.message
            };
        }
    },

    _getGoogleSupportedLangs: function() {
        try {
            var inputs = {
                'version': 'v3',
                'locations': 'global',
                'project_id': ''
            };

            var versionVal = this._getSysVariableValue(this.GOOGLE_VERSION_CON_ATTR_ID);
            var locationVal = this._getSysVariableValue(this.GOOGLE_LOCATION_CON_ATTR_ID);
            var projectIdVal = this._getSysVariableValue(this.GOOGLE_PROJECT_ID_CON_ATRR_ID);

            if (versionVal) {
                inputs['version'] = versionVal;
            }
            if (locationVal) {
                inputs['locations'] = locationVal;
            }
            if (projectIdVal) {
                inputs['project_id'] = projectIdVal;
            }

            var outputs = this._invokeFlowAction('sn_google_trans.get_supported_languages', inputs);

            var response = {
                'errorCode': outputs['error_code'],
                'errorMessage': outputs['error_message']
            };

            if (!outputs['error_code'] || !outputs['error_message']) {
                response['supportedLanguages'] = this._parseGoogleLangs(outputs['supported_languages']);
            }
            return response;
        } catch (error) {
            gs.addErrorMessage(gs.getMessage('Error while invoking Get supported languages flow action: {0}', [error.message]));
            return {
                'errorMessage': error.message
            };
        }
    },

    _getOEMSupportedLangs: function() {
        return gs.getProperty('sn_ms_oem.active_languages', '').split(',');
    },

    _invokeFlowAction(actionName, inputs) {
        var result = sn_fd.FlowAPI.getRunner().action(actionName).inForeground().withInputs(inputs).run();
        return result.getOutputs();
    },

    _parseMicrosoftLangs: function(langObj) {
        var codes = [];
        if (langObj.hasOwnProperty('translation')) {
            Object.keys(langObj['translation']).forEach(function(code) {
                codes.push(code);
            });
        }
        return codes;
    },

    _parseGoogleLangs: function(langObj) {
        var codes = [];
        if (langObj.hasOwnProperty('languages')) {
            langObj['languages'].forEach(function(obj) {
                codes.push(obj['languageCode']);
            });
        }
        return codes;
    },

    _getSysVariableValue: function(sysAttrId) {
        var gr = new GlideRecordSecure('sys_variable_value');
        gr.addQuery('document', 'http_connection');
        gr.addQuery('variable', sysAttrId);
        gr.query();

        if (gr.next()) {
            return gr.getValue('value');
        }
        return '';
    },

    type: 'TestExclusionRuleUtils'
};
