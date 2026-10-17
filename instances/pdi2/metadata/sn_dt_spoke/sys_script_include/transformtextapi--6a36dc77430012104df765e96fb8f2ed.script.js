var TransformTextAPI = Class.create();
TransformTextAPI.prototype = {

    EXCLUSION_FRAMEWORK_SYSTEM_PROPERTY: 'sn_dt.dynamic_framework.enable_exclusion_framework',
    EXCLUSION_FRAMEWORK_DEFAULT_PROPERTY_VALUE: false,
    PATTERN_MATCH_COUNT: 'pattern_match_count',
    EXACT_MATCH_COUNT: 'exact_match_count',
    TARGET_LANGUAGE: 'target_language',
    SOURCE_LANGUAGE: 'source_language',
    TRANSLATION_SERVICE: 'translation_service',
    CLIENT_SOURCE: 'client_source',
    EVENT_NAME: 'eventName',
    NAME: 'name',
    UNKNOWN: 'Unknown',
    EXCLUSION_RULE_USAGE_TABLE: 'sn_dt_exclusion_rule_usage',
    TRANSLATOR_CONFIG_TABLE: 'sn_dt_translator_configuration',
    LOG_PREFIX: 'Dynamic Translation Exclusion Framework',

    initialize: function() {},

    transformTextsToTranslate: function(translatorId, textsToTranslate, usageData) {
        var isExclusionFrameworkEnabled = gs.getProperty(this.EXCLUSION_FRAMEWORK_SYSTEM_PROPERTY, this.EXCLUSION_FRAMEWORK_DEFAULT_PROPERTY_VALUE).toLowerCase() === "true";
        if (!isExclusionFrameworkEnabled) {
            gs.warn("{0}: {1}", this.LOG_PREFIX, "Exclusion Framework is disabled");
            return {
                "patternMatchesCount": 0,
                "exactMatchesCount": 0,
                "transformedTexts": textsToTranslate
            };
        }
        if (!usageData) {
            usageData = {
                "sourceLanguage": "",
                "targetLanguages": [],
                "additionalParameters": []
            };
        }
        var exclusionRuleId = "";
        var exclusionRuleType = "";
        var exclusionTerm = "";

        if (usageData.additionalParameters != null) {
            for (var i = 0; i < usageData.additionalParameters.length; i++) {
                if (usageData.additionalParameters[i].parameter_name === "exclusionRuleId") {
                    exclusionRuleId = usageData.additionalParameters[i].parameter_value;
                }
                if (usageData.additionalParameters[i].parameter_name === "exclusionRuleType") {
                    exclusionRuleType = usageData.additionalParameters[i].parameter_value;
                }
                if (usageData.additionalParameters[i].parameter_name === "exclusionTerm") {
                    exclusionTerm = usageData.additionalParameters[i].parameter_value;
                }
            }
        }

        var transformedTextsObj = {};
        if (!exclusionRuleId && !exclusionRuleType && !exclusionTerm) {
            transformedTextsObj = sn_dt_api.DynamicTranslation.transformTextsToTranslate(translatorId, textsToTranslate);

            usageData["translatorId"] = translatorId;
            usageData["matchCounts"] = {
                pattern: transformedTextsObj.patternMatchesCount,
                exact: transformedTextsObj.exactMatchesCount
            };
            this._trackExclusionUsage(usageData);
        } else {
            transformedTextsObj = sn_dt_api.DynamicTranslation.transformTextsToTranslateTestExclusionRule(translatorId, textsToTranslate, exclusionRuleId, exclusionTerm, exclusionRuleType);
        }

        return {
            "patternMatch": transformedTextsObj.patternMatchesCount,
            "exactMatch": transformedTextsObj.exactMatchesCount,
            "transformedTexts": transformedTextsObj.transformedTexts
        };
    },

    transformTranslatedTexts: function(translatorId, textsToTransform) {
        var patterns = this._getExclusionPattern(translatorId);
        if (patterns == null) {
            gs.warn("{0}: {1}", this.LOG_PREFIX, "Exclusion patterns not found for given translator configuration ID");
            return {
                "transformedTexts": textsToTransform
            };
        }

        for (var t = 0; t < textsToTransform.length; t++) {
            for (var j = 0; j < textsToTransform[t].length; j++) {
                var text = textsToTransform[t][j];
                textsToTransform[t][j] = this._removePrefixSuffix(text, patterns.prefix_pattern, patterns.suffix_pattern);
            }
        }

        return {
            "transformedTexts": textsToTransform
        };
    },

    boldTransformedText: function(translatorId, textToBold) {
        var patterns = this._getExclusionPattern(translatorId);
        if (patterns == null) {
            gs.warn("{0}: {1}", this.LOG_PREFIX, "Exclusion patterns not found for given translator configuration ID");
            return '';
        }
        if (textToBold == null) {
            gs.warn("Error transformed text to bold was empty");
            return '';
        }
        return this._boldPrefixSuffix(textToBold, patterns.prefix_pattern, patterns.suffix_pattern);
    },

    _getExclusionPattern: function(translatorId) {
        var pattern = sn_dt_api.DynamicTranslation.getExclusionPattern(translatorId);
        return pattern;
    },

    _removePrefixSuffix: function(text, prefix, suffix) {
        var regex = new RegExp(prefix + '(.*?)' + suffix, 'gi');
        while (regex.test(text)) {
            text = text.replace(regex, function(match, innerContent) {
                return innerContent;
            });
        }

        // Does text contain HTML tags other than `<br/>`?
        if (text.match(/<(?!br[ ]*\/)[^>]+>/gi)) {
            return text;
        }
        return this._unescapeHtml(text);
    },

    _unescapeHtml: function(text) {
        text = text.replaceAll(/<br[ ]*\/>/gi, '\n');
        return GlideStringUtil.unEscapeHTML(text);
    },

    _boldPrefixSuffix: function(text, prefix, suffix) {
        var regex = new RegExp(prefix + '(.*?)' + suffix, 'gi');
        while (regex.test(text)) {
            text = text.replace(regex, function(match, innerContent) {
                return '<b>' + innerContent + '</b>';
            });
        }
        return text;
    },

    _trackExclusionUsage: function(data) {
        var patternCount = data.matchCounts.pattern;
        var exactCount = data.matchCounts.exact;

        if (patternCount === 0 && exactCount === 0) {
            return;
        }

        var gr = new GlideRecord(this.EXCLUSION_RULE_USAGE_TABLE);
        gr.initialize();
        gr.setValue(this.PATTERN_MATCH_COUNT, patternCount);
        gr.setValue(this.EXACT_MATCH_COUNT, exactCount);
        gr.setValue(this.TRANSLATION_SERVICE, this._getTranslatorName(data.translatorId));
        gr.setValue(this.SOURCE_LANGUAGE, data.sourceLanguage);
        gr.setValue(this.TARGET_LANGUAGE, this._formatLanguageCodes(data.targetLanguages));
        gr.setValue(this.CLIENT_SOURCE, this._getEventName(data.additionalParameters));
        gr.insert();
    },

    _getTranslatorName: function(id) {
        var gr = new GlideRecord(this.TRANSLATOR_CONFIG_TABLE);
        if (gr.get(id)) {
            return gr.getValue(this.NAME);
        }
        return this.UNKNOWN;
    },

    _formatLanguageCodes: function(codes) {
        if (Array.isArray(codes)) {
            return codes.join(", ");
        } else if (typeof codes === "string") {
            return codes;
        }
        return this.UNKNOWN;
    },

    _getEventName: function(parms) {
        for (let i = 0; i < parms.length; i++) {
            if (parms[i].parameter_name === this.EVENT_NAME) {
                let val = parms[i].parameter_value;
                if (val) {
                    return val;
                }
                break;
            }
        }
        return this.UNKNOWN;
    },

    type: 'TransformTextAPI'
};
