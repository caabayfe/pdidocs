var MosaicOEMMetricsProcessor = Class.create();
MosaicOEMMetricsProcessor.prototype = {

    // Table names
    TRANSLATOR_USAGE_METRICS_TABLE: 'sn_ms_oem_translator_usage_metrics',
    EXCLUSION_RULE_USAGE_TABLE: 'sn_dt_exclusion_rule_usage',
    TRANSLATOR_CONFIG_TABLE: 'sn_dt_translator_configuration',

    // LUA event constants
    METRIC_TYPE: 'custom_metric',
    STREAM_ID: 'sn_dt_api',
    TRANSLATION_EVENT_ID: 'gettranslations_event',
    DETECTION_EVENT_ID: 'getdetectedlanguages_event',

    // API name values
    TRANSLATE: 'Translate',
    DETECT: 'Detect',

    // Column names for sn_ms_oem_translator_usage_metrics
    COL_API_NAME: 'api_name',
    COL_SUCCESS: 'success',
    COL_ERROR_CODE: 'error_code',
    COL_REQUEST_LENGTH: 'request_length',
    COL_BATCH_ID: 'batch_id',
    COL_REQUEST_INPUTS: 'request_inputs',
    COL_CAPABILITY_NAME: 'capability_name',
    COL_CAPABILITY_DEFINITION_NAME: 'capability_definition_name',
    COL_DEFINITION_ID: 'definition_id',
    COL_TOTAL_TIME: 'total_time',
    COL_PREPROCESSING_TIME: 'preprocessing_time',
    COL_TARGET_LANGUAGES: 'target_languages',
    COL_SOURCE_LANGUAGE: 'source_language',
    COL_TEXT_TYPE: 'text_type',
    COL_HTML_PARSER: 'html_parser',
    COL_RESPONSE_LENGTH: 'response_length',
    COL_CHARACTERS_DETECTED: 'characters_detected',
    COL_DETECTION_TIME: 'detection_time',
    COL_DETECTED_LANGUAGES: 'detected_languages',
    COL_LANGUAGE_DETECTION_BATCHES: 'language_detection_batches',
    COL_NOW_LDS_USED: 'now_lds_used',
    COL_NOW_LDS_DETECTED_TIME: 'now_lds_detected_time',
    COL_UNSUPPORTED_LANGUAGE_CODE: 'unsupported_language_code',
    COL_CHARACTERS_TRANSLATED: 'characters_translated',
    COL_TRANSLATION_TIME: 'translation_time',
    COL_SENTENCE_TRANSLATION_BATCHES: 'sentence_translation_batches',
    COL_SENTENCE_BREAKING_TIME: 'sentence_breaking_time',
    COL_SENTENCE_BREAKING_BATCHES: 'sentence_breaking_batches',
    COL_SENTENCE_BREAKING_CALLS: 'sentence_breaking_calls',

    // Column names for sn_dt_exclusion_rule_usage
    COL_PATTERN_MATCH_COUNT: 'pattern_match_count',
    COL_EXACT_MATCH_COUNT: 'exact_match_count',
    COL_TRANSLATION_SERVICE: 'translation_service',
    COL_TARGET_LANGUAGE: 'target_language',
    COL_CLIENT_SOURCE: 'client_source',

    // Misc
    UNKNOWN: 'Unknown',

    initialize: function() {
    },

    processOEMMetrics: function(msgObj) {
        var oemMetrics = msgObj.records.oem_translation_metrics;
        if (!oemMetrics) {
            return;
        }

        if (oemMetrics.lua_translation_event) {
            try {
                this._sendTranslationEvent(oemMetrics.lua_translation_event);
            } catch (ex) {
                gs.error('MosaicOEMMetricsProcessor - Error processing LUA translation event: ' + ex);
            }
        }

        if (oemMetrics.lua_detection_event) {
            try {
                this._sendDetectionEvent(oemMetrics.lua_detection_event);
            } catch (ex) {
                gs.error('MosaicOEMMetricsProcessor - Error processing LUA detection event: ' + ex);
            }
        }

        if (oemMetrics.translation_stats) {
            try {
                this._saveTranslatorUsageMetric(oemMetrics.translation_stats);
            } catch (ex) {
                gs.error('MosaicOEMMetricsProcessor - Error saving translator usage metric: ' + ex);
            }
        }

        if (oemMetrics.detection_stats) {
            try {
                this._saveDetectUsageMetric(oemMetrics.detection_stats);
            } catch (ex) {
                gs.error('MosaicOEMMetricsProcessor - Error saving detect usage metric: ' + ex);
            }
        }

        if (oemMetrics.exclusion_usage) {
            try {
                this._trackExclusionUsage(oemMetrics.exclusion_usage);
            } catch (ex) {
                gs.error('MosaicOEMMetricsProcessor - Error tracking exclusion usage: ' + ex);
            }
        }
    },

    _sendTranslationEvent: function(data) {
        var source = this._getSource(data.additional_parameters);
        var errorCodes = [];
        var detectedLanguages = [];
        if (data.translations) {
            for (var idx = 0; idx < data.translations.length; idx++) {
                var eachTranslation = data.translations[idx];
                var eachErrorCode = eachTranslation.error_code;
                if (eachErrorCode && errorCodes.indexOf(eachErrorCode) == -1) {
                    errorCodes.push(eachErrorCode);
                }
                var eachDetectedLanguage = eachTranslation.detected_language;
                if (eachDetectedLanguage && detectedLanguages.indexOf(eachDetectedLanguage) == -1) {
                    detectedLanguages.push(eachDetectedLanguage);
                }
            }
        }

        var textsToTranslate = data.texts_to_translate || [];
        var numOfTextsBucket = Math.floor(textsToTranslate.length / 5);
        var analytic = this._populateLuaCommonParams(data.subflow_id, numOfTextsBucket, source, data.status, errorCodes, detectedLanguages);
        var targetLanguages = data.target_languages || [];
        analytic.put("targetLanguages", targetLanguages.join());
        GCFCollector.recordUsageEvent(this.METRIC_TYPE, this.STREAM_ID, this.TRANSLATION_EVENT_ID, analytic);
    },

    _sendDetectionEvent: function(data) {
        var source = this._getSource(data.additional_parameters);
        var errorCodes = [];
        var detectedLanguages = [];
        if (data.detections) {
            for (var idx = 0; idx < data.detections.length; idx++) {
                var eachDetection = data.detections[idx];
                var eachErrorCode = eachDetection.error_code;
                if (eachErrorCode && errorCodes.indexOf(eachErrorCode) == -1) {
                    errorCodes.push(eachErrorCode);
                }
                var eachDetectedLanguage = eachDetection.detected_language ? eachDetection.detected_language.code : null;
                if (eachDetectedLanguage && detectedLanguages.indexOf(eachDetectedLanguage) == -1) {
                    detectedLanguages.push(eachDetectedLanguage);
                }
            }
        }

        var textsToDetect = data.texts_to_detect || [];
        var numOfTextsBucket = Math.floor(textsToDetect.length / 5);
        var analytic = this._populateLuaCommonParams(data.subflow_id, numOfTextsBucket, source, data.status, errorCodes, detectedLanguages);
        analytic.put("noOfRESTCalls", "1");
        GCFCollector.recordUsageEvent(this.METRIC_TYPE, this.STREAM_ID, this.DETECTION_EVENT_ID, analytic);
    },

    _saveTranslatorUsageMetric: function(data) {
        var inputMetrics = data.input_metrics;
        if (inputMetrics == null || typeof inputMetrics !== "object") {
            return;
        }
        var metricsRecord = new GlideRecord(this.TRANSLATOR_USAGE_METRICS_TABLE);
        metricsRecord.initialize();
        metricsRecord.setValue(this.COL_API_NAME, this.TRANSLATE);
        metricsRecord.setValue(this.COL_SUCCESS, true);
        if (data.error_code) {
            metricsRecord.setValue(this.COL_ERROR_CODE, data.error_code);
            metricsRecord.setValue(this.COL_SUCCESS, false);
        }
        var stats_extended_data = inputMetrics.stats_extended_data || {};
        var language_detection_metrics = stats_extended_data.language_detection_metrics || {};
        var sentence_breaking_metrics = stats_extended_data.sentence_breaking_metrics || {};
        if (inputMetrics !== null && Object.keys(inputMetrics).length !== 0) {
            this._populateCommonMetrics(metricsRecord, inputMetrics);
            this._populateStandardMetrics(metricsRecord, inputMetrics);
            this._populateTranslationMetrics(metricsRecord, inputMetrics);
        }
        if (language_detection_metrics !== null && Object.keys(language_detection_metrics).length !== 0) {
            this._populateDetectionMetrics(metricsRecord, language_detection_metrics);
        }
        if (sentence_breaking_metrics !== null && Object.keys(sentence_breaking_metrics).length !== 0) {
            this._populateSentenceBreakingMetrics(metricsRecord, sentence_breaking_metrics);
        }
        metricsRecord.insert();
    },

    _saveDetectUsageMetric: function(data) {
        var inputMetrics = data.input_metrics;
        if (inputMetrics == null || typeof inputMetrics !== "object") {
            return;
        }
        var metricsRecord = new GlideRecord(this.TRANSLATOR_USAGE_METRICS_TABLE);
        metricsRecord.initialize();
        metricsRecord.setValue(this.COL_API_NAME, this.DETECT);
        metricsRecord.setValue(this.COL_SUCCESS, true);
        if (data.error_code) {
            metricsRecord.setValue(this.COL_ERROR_CODE, data.error_code);
            metricsRecord.setValue(this.COL_SUCCESS, false);
        }
        metricsRecord.setValue(this.COL_PREPROCESSING_TIME, inputMetrics.preprocessing_time);
        if (inputMetrics !== null && Object.keys(inputMetrics).length !== 0) {
            this._populateCommonMetrics(metricsRecord, inputMetrics);
            this._populateDetectionMetrics(metricsRecord, inputMetrics);
        }
        metricsRecord.insert();
    },

    _trackExclusionUsage: function(data) {
        var matchCounts = data.match_counts || {};
        var patternCount = matchCounts.pattern || 0;
        var exactCount = matchCounts.exact || 0;

        if (patternCount === 0 && exactCount === 0) {
            return;
        }

        var gr = new GlideRecord(this.EXCLUSION_RULE_USAGE_TABLE);
        gr.initialize();
        gr.setValue(this.COL_PATTERN_MATCH_COUNT, patternCount);
        gr.setValue(this.COL_EXACT_MATCH_COUNT, exactCount);
        gr.setValue(this.COL_TRANSLATION_SERVICE, this._getTranslatorName(data.translator_id));
        gr.setValue(this.COL_SOURCE_LANGUAGE, data.source_language);
        gr.setValue(this.COL_TARGET_LANGUAGE, this._formatLanguageCodes(data.target_languages));
        gr.setValue(this.COL_CLIENT_SOURCE, this._getEventName(data.additional_parameters));
        gr.insert();
    },

    _populateCommonMetrics: function(glideRecord, inputMetrics) {
        glideRecord.setValue(this.COL_REQUEST_LENGTH, inputMetrics.request_input_character_length);
        glideRecord.setValue(this.COL_BATCH_ID, inputMetrics.batch_id);
        glideRecord.setValue(this.COL_REQUEST_INPUTS, inputMetrics.request_inputs_count);
        glideRecord.setValue(this.COL_CAPABILITY_NAME, inputMetrics.capability_name);
        glideRecord.setValue(this.COL_CAPABILITY_DEFINITION_NAME, inputMetrics.capability_definition_name);
        glideRecord.setValue(this.COL_DEFINITION_ID, inputMetrics.definition_id);
    },

    _populateStandardMetrics: function(glideRecord, inputMetrics) {
        glideRecord.setValue(this.COL_TOTAL_TIME, inputMetrics.translation_generation_time);
        if (inputMetrics.stats_extended_data && inputMetrics.stats_extended_data.sentence_breaking_metrics) {
            glideRecord.setValue(this.COL_PREPROCESSING_TIME, inputMetrics.preprocessing_time - inputMetrics.stats_extended_data.sentence_breaking_metrics.sentence_breaking_time);
        }
        glideRecord.setValue(this.COL_TARGET_LANGUAGES, inputMetrics.output_target_language);
        glideRecord.setValue(this.COL_SOURCE_LANGUAGE, inputMetrics.input_source_language);
        glideRecord.setValue(this.COL_TEXT_TYPE, inputMetrics.request_input_text_type);
        glideRecord.setValue(this.COL_HTML_PARSER, inputMetrics.html_parser_used);
        glideRecord.setValue(this.COL_RESPONSE_LENGTH, inputMetrics.response_output_character_length);
    },

    _populateTranslationMetrics: function(glideRecord, inputMetrics) {
        if (inputMetrics.stats_extended_data && inputMetrics.stats_extended_data.translation_metrics) {
            glideRecord.setValue(this.COL_SENTENCE_TRANSLATION_BATCHES, inputMetrics.stats_extended_data.translation_metrics.length);
        }
        glideRecord.setValue(this.COL_CHARACTERS_TRANSLATED, inputMetrics.translation_input_character_length);
        glideRecord.setValue(this.COL_TRANSLATION_TIME, inputMetrics.translation_time);
    },

    _populateDetectionMetrics: function(glideRecord, detectionMetrics) {
        glideRecord.setValue(this.COL_CHARACTERS_DETECTED, detectionMetrics.input_character_length);
        glideRecord.setValue(this.COL_DETECTION_TIME, detectionMetrics.language_detection_time);
        glideRecord.setValue(this.COL_DETECTED_LANGUAGES, detectionMetrics.language_code);
        glideRecord.setValue(this.COL_LANGUAGE_DETECTION_BATCHES, detectionMetrics.total_batches);
        glideRecord.setValue(this.COL_NOW_LDS_USED, detectionMetrics.now_lds_used);
        glideRecord.setValue(this.COL_UNSUPPORTED_LANGUAGE_CODE, detectionMetrics.unsupported_language_code);
        if (detectionMetrics.now_lds_used && detectionMetrics.now_lds_used == true) {
            glideRecord.setValue(this.COL_NOW_LDS_DETECTED_TIME, detectionMetrics.now_lds_time);
        } else {
            glideRecord.setValue(this.COL_NOW_LDS_DETECTED_TIME, 0);
        }
    },

    _populateSentenceBreakingMetrics: function(glideRecord, sentenceBreakingMetrics) {
        glideRecord.setValue(this.COL_SENTENCE_BREAKING_TIME, sentenceBreakingMetrics.sentence_breaking_time);
        glideRecord.setValue(this.COL_SENTENCE_BREAKING_BATCHES, sentenceBreakingMetrics.total_batches);
        glideRecord.setValue(this.COL_SENTENCE_BREAKING_CALLS, sentenceBreakingMetrics.num_api_calls);
    },

    _populateLuaCommonParams: function(subFlowId, numOfTextsBucket, source, status, errorCodes, detectedLanguages) {
        var analytic = new GCFSampleMap();
        analytic.put("translator", subFlowId);
        analytic.put("noOfTextsBucket", numOfTextsBucket.toString());
        analytic.put("source", source);
        analytic.put("status", status);
        analytic.put("cacheHitBucket", "0");
        analytic.put("errorCodes", (errorCodes.length > 0 ? errorCodes.join() : ""));
        analytic.put("detectedLanguages", (detectedLanguages.length > 0 ? detectedLanguages.join() : ""));
        return analytic;
    },

    _getSource: function(additionalParameters) {
        var source = "MS OEM";
        if (additionalParameters) {
            if (Array.isArray(additionalParameters)) {
                for (var index = 0; index < additionalParameters.length; index++) {
                    var eachParameter = additionalParameters[index];
                    if (eachParameter['parameter_name']) {
                        if (eachParameter['parameter_name'].toUpperCase() === 'EVENT_NAME') {
                            source += ": " + eachParameter['parameter_value'];
                        }
                        if (eachParameter['parameter_name'].toUpperCase() === 'CAPABILITY_NAME') {
                            source += ": " + eachParameter['parameter_value'];
                        }
                    }
                }
            }
        }
        return source;
    },

    _getTranslatorName: function(id) {
        var gr = new GlideRecord(this.TRANSLATOR_CONFIG_TABLE);
        if (gr.get(id)) {
            return gr.getValue('name');
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

    _getEventName: function(params) {
        if (!params || !Array.isArray(params)) {
            return this.UNKNOWN;
        }
        for (var i = 0; i < params.length; i++) {
            if (params[i].parameter_name === 'eventName') {
                var val = params[i].parameter_value;
                if (val) {
                    return val;
                }
                break;
            }
        }
        return this.UNKNOWN;
    },

    type: 'MosaicOEMMetricsProcessor'
};
