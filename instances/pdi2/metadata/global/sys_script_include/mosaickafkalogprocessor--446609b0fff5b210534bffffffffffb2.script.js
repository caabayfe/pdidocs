// MosaicKafkaLogProcessor — batch-level idempotent dedup variant.
//
// DEPLOY TARGET: script include `MosaicKafkaLogProcessor`
//   repo dev/glide-services, com.glide.one_extend,
//   sys_script_include sys_id 446609b0fff5b210534bffffffffffb2
//   (invoked by sys_kafka_script_consumer cf387220ff757210534bffffffffff39,
//    delivery_guarantee = at_least_once → redelivery/duplicates are expected).
//
// WHY: the ETL ScriptConsumer delivers a BATCH (messages = List<Message>) and the
// consumer is at-least-once, so a redelivered batch (crash/rebalance/commit failure)
// — or a second consumer group — reprocesses messages and re-inserts the same logs.
// We dedup on `mosaic_llm_invocation_id` (UUID per LLM invocation) with ONE query per
// batch (chunked), plus an in-batch guard. Messages without an invocation id are
// processed as before (no reliable key to dedup on).

var MosaicKafkaLogProcessor = Class.create();
MosaicKafkaLogProcessor.prototype = {
    initialize: function() {},

    process: function(messages) {
        if (typeof messages === 'string')
            messages = JSON.parse(messages);

        // sample message [ { 'key' : 'message_key' , 'message' : '{"records":{"sys_generative_ai_log":{"status":"success","source":"now-assist","caller":"caller-id","started_at":1702300000870,"completed_at":1702300000020,"conversation":"conversation-id","domain":"global","derivedScope":"scope","skill_config_id":"skill-config-id","definition":"026665929c6be110f877ad1e637d1030","prompt_config_id":"prompt-config-id","model_name":"gpt-4","model_version":"1.0","external":false,"prompt":"User prompt text...","response":"LLM response text...","prompt_token_count":150,"response_token_count":500,"output_metadata":{"perf_traces":[{"stage":"PREPROCESSOR","duration":20,"startedAt":1702300000000,"completedAt":1702300000020},{"stage":"HTTP_CALL","duration":850,"startedAt":1702300000020,"completedAt":1702300000870},{"stage":"POSTPROCESSOR","duration":30,"startedAt":1702300000870,"completedAt":1702300000900}]},"time_taken":900,"error":"","error_code":""},"sys_generative_ai_metric":[{"name":"toxicity","score":0.02,"threshold":0.5,"source":"content-filter","type":"safety"}]},"executionRequest":{"payload":{"input":"original request payload"},"meta":{"user":"user-id","source":"source","skillConfigId":"50c32f0893001210172d0525748918f3"},"capability":"capability-id"},"userId":"6816f79cc0a8016401c5a33be04be441"}' , 'headers' : [ { 'key' : 'header_key' , 'value' : 'header_value' } ] } ]

        // Phase 1 — External provider usage messages are handled INLINE here, byte-for-byte identical to the original
        // implementation (detect → process → continue); they never touch the dedup machinery.
        // Mosaic messages are decoded and collected so the duplicate check can run as a single
        // (chunked) query instead of one query per message. Failures stay isolated per message.
        var prepared = [];
        var invocationIds = [];
        for (let i = 0; i < messages.length; i++) {
            try {
                var message = messages[i].message;
                // If detected as an external provider usage message, route to createGenAIUsageExternal and skip Mosaic processing entirely.
                let externalProviderMsg = this._tryParseExternalProviderUsageMessage(message);
                if (externalProviderMsg !== null) {
                    this._processExternalProviderUsageMessage(externalProviderMsg);
                    continue;
                }

                // Decrypt the message and send for insertion
                var decryptedMessage = sn_one_extend.GenerativeAIUtility.decryptMosaicKafkaMessage(message);
                if (gs.nil(decryptedMessage)) {
                    gs.error('MosaicKafkaLogProcessor - could not decrypt Kafka message');
                    continue;
                }

                let msgObj = JSON.parse(decryptedMessage);
                if (!this._validateMessage(msgObj)) {
                    gs.warn('MosaicKafkaLogProcessor - Skipping invalid Kafka message: ' + JSON.stringify(msgObj));
                    continue;
                }

                var invocationId = msgObj.records && msgObj.records.sys_generative_ai_log
                    ? msgObj.records.sys_generative_ai_log.mosaic_llm_invocation_id
                    : null;
                if (!gs.nil(invocationId) && invocationIds.indexOf(invocationId + '') === -1)
                    invocationIds.push(invocationId + '');

                prepared.push({ msgObj: msgObj, invocationId: gs.nil(invocationId) ? null : invocationId + '' });
            } catch (ex) {
                gs.error('MosaicKafkaLogProcessor - could not process a message within a Kafka message', ex);
            }
        }

        // Phase 2 — one lookup (chunked) for invocation ids already persisted. The lookup runs
        // in the global domain so it sees rows regardless of which domain they were inserted
        // into (a single batch can carry messages for several domains).
        var alreadyPersisted = this._fetchExistingInvocationIds(invocationIds);
        var processedInBatch = {};

        // Phase 3 — insert the Mosaic logs, skipping anything already persisted or already handled in this batch.
        for (let j = 0; j < prepared.length; j++) {
           let originalUserId;
           let originalDomain;
            try {
                var msgObj = prepared[j].msgObj;
                var invocationId = prepared[j].invocationId;

                if (invocationId && (alreadyPersisted[invocationId] || processedInBatch[invocationId])) {
                    continue;
                }

                // Impersonate the original caller
                msgObj.userId = gs.nil(msgObj.userId) ? gs.getUserID() : msgObj.userId;
                 originalUserId = this._impersonate(msgObj.userId);

                // Set the session domain from the message so all inserted records inherit the correct domain
                 originalDomain = this._setDomain(msgObj.domainId);

                if (msgObj.records?.sys_generative_ai_log) {
                    let genAILogSysId = this._createGenAILogEntry(msgObj.records.sys_generative_ai_log) + '';
                    let genAILogMetadataSysId = '';
                    if (!gs.nil(genAILogSysId)) {
                        genAILogMetadataSysId = this._createGenAILogMetadataEntry(msgObj.records.sys_generative_ai_log, genAILogSysId);
                        // Guard against the same id appearing twice within this batch.
                        if (invocationId)
                            processedInBatch[invocationId] = true;
                    }

                    // Process staged feedback AFTER metadata record exists so the
                    // "Update Gen AI Log Metadata" business rule can find it.
                    if (!gs.nil(genAILogSysId)) {
                        this._applyStagedFeedback(genAILogSysId, msgObj.records.sys_generative_ai_log.mosaic_llm_invocation_id);
                    }

                    if (msgObj.executionRequest) {
                        let genAIUsageLogSysId = this._createGenAIUsageLog(msgObj.executionRequest.capability, msgObj.executionRequest.meta, genAILogSysId);
                        if (gs.nil(genAIUsageLogSysId))
                            gs.warn('MosaicKafkaLogProcessor - unable to create generative AI usage log for genAILog: ' + genAILogSysId);
                    }

                    if (!gs.nil(genAILogSysId)) {
                        this._createGenerativeAIMetric(msgObj.records?.sys_generative_ai_metric, genAILogSysId, genAILogMetadataSysId);
                    }
                }

                // Process OEM translation metrics if present
                if (msgObj.records && msgObj.records.oem_translation_metrics) {
                    new MosaicOEMMetricsProcessor().processOEMMetrics(msgObj);
                }

                // Restore the original domain and un-impersonate back to the original user
                this._setDomain(originalDomain);
                this._impersonate(originalUserId);
            } catch (ex) {
				try{
                    this._setDomain(originalDomain);
                    this._impersonate(originalUserId);
				}catch (e){
                gs.error('MosaicKafkaLogProcessor - could not set the domain and impersonate', e);
				}
                gs.error('MosaicKafkaLogProcessor - could not process a message within a Kafka message', ex);
            }
        }
    },

    // Single (chunked) batch lookup of invocation ids that already have a sys_generative_ai_log.
    // Returns a map { invocationId: true }. Chunked so a very large poll batch does not build
    // an oversized IN clause.
    //
    // sys_generative_ai_log is domain-separated and records are inserted under each message's
    // own domain, so the lookup is run in the global (root) domain — which has visibility across
    // all domains — to avoid missing a duplicate that lives in a different domain. The session
    // domain is restored afterwards so per-message impersonation/domain handling is unaffected.
    _fetchExistingInvocationIds: function(invocationIds) {
        var existing = {};
        if (!invocationIds || !invocationIds.length)
            return existing;

		var CHUNK = 100; //Keeping it less so that the query string do not exceed length.
		for (var start = 0; start < invocationIds.length; start += CHUNK) {
			var slice = invocationIds.slice(start, start + CHUNK);
			var gr = new GlideRecord('sys_generative_ai_log');
			gr.addQuery('mosaic_llm_invocation_id', 'IN', slice.join(','));
			gr.queryNoDomain();
			while (gr.next())
				existing[gr.getValue('mosaic_llm_invocation_id') + ''] = true;
		}

        return existing;
    },

    _createGenAIUsageLog: function(capability, meta, genAILogSysId) {
        try {
            return sn_one_extend.GenerativeAIUtility.createGenAIUsage(capability, meta, genAILogSysId);
        } catch (ex) {
            gs.error('MosaicKafkaLogProcessor - Cannot create a gen ai usage log for user: ' + userId + ' and capability ' + capability, ex);
        }
    },

    _createGenAILogEntry: function(generativeAILogObj) {
        let genAIMandatoryFields = ['status', 'completed_at', 'started_at', 'time_taken'];

        let genAILogFields = ['prompt', 'response', 'untranslated_prompt', 'error', 'error_code', 'status', 'caller', 'prompt_config_id', 'definition', 'conversation', 'skill_config_id', 'completed_at', 'started_at', 'time_taken', 'prompt_token_count', 'response_token_count', 'reasoning_token_count', 'model_name', 'model_version', 'target_language', 'output', 'external', 'edited_response', 'source', 'sys_domain', 'metadata_document', 'metadata_table', 'additional_data', 'output_metadata', 'metadata_documents', 'derived_scope', 'gen_ai_usage_log', 'query_evaluation_execution_id', 'query_evaluation_applied_parameter_values', 'mosaic_llm_invocation_id', 'mosaic_context'];

        let hasAllMandatoryFields = genAIMandatoryFields.every((i) => generativeAILogObj.hasOwnProperty(i));
        if (!hasAllMandatoryFields) {
            gs.error('MosaicKafkaLogProcessor - Not creating sys_generative_ai_log due to missing mandatory fields in the Mosaic Kafka message');
            return "";
        }

        // Convert date times, output_metadata and genAIUsageLogId
        if (!gs.nil(generativeAILogObj.completed_at)) {
            generativeAILogObj.completed_at = this._convertMillisIntoDateTime(generativeAILogObj.completed_at);
        }
        if (!gs.nil(generativeAILogObj.started_at)) {
            generativeAILogObj.started_at = this._convertMillisIntoDateTime(generativeAILogObj.started_at);
        }
        if (!gs.nil(generativeAILogObj.output_metadata))
            generativeAILogObj.output_metadata = JSON.stringify(generativeAILogObj.output_metadata);

        let fieldsToPersist = this._getFieldsToPersist(generativeAILogObj, genAILogFields);
        var insertedLogId = this._insertRecord('sys_generative_ai_log', fieldsToPersist);
        return insertedLogId;
    },

    _getFieldsToPersist: function(obj, eligibleFields) {
        return Object.keys(obj).
        filter((key) => eligibleFields.includes(key)).
        reduce((cur, key) => {
            return Object.assign(cur, {
                [key]: obj[key]
            });
        }, {});
    },

    _createGenAILogMetadataEntry: function(generativeAILogMetaObj, genAILogSysId) {
        let genAILogMetadataFields = ['error', 'error_code', 'status', 'caller', 'prompt_config_id', 'definition', 'conversation', 'skill_config_id', 'completed_at', 'started_at', 'time_taken', 'prompt_token_count', 'response_token_count', 'reasoning_token_count', 'model_name', 'model_version', 'target_language', 'output_metadata', 'gen_ai_log_id', 'mosaic_llm_invocation_id'];

        // Set genAILogSysId and update output_metadata with perf_traces
        generativeAILogMetaObj.gen_ai_log_id = genAILogSysId + '';
        let perfTraces = JSON.parse(generativeAILogMetaObj.output_metadata)?.perf_traces;
        if (!gs.nil(perfTraces))
            generativeAILogMetaObj.output_metadata = JSON.stringify(perfTraces);
        else
            generativeAILogMetaObj.output_metadata = '';

        let fieldsToPersist = this._getFieldsToPersist(generativeAILogMetaObj, genAILogMetadataFields);
        return this._insertRecord('sys_gen_ai_log_metadata', fieldsToPersist);
    },

    _createGenerativeAIMetric: function(generativeAIMetrics, genAILogSysId, genAILogMetadataSysId) {
        let genAIMetricsMandatoryFields = ['name', 'type', 'value'];
        let genAIMetricFields = ['sys_generative_ai_log', 'sys_gen_ai_log_metadata', 'name', 'score', 'threshold', 'pattern_text', 'pattern_name', 'language', 'source', 'type', 'sys_domain', 'sys_generative_ai_log', 'sys_gen_ai_log_metadata', 'value'];

        // No Generative AI Metrics to add
        if (!generativeAIMetrics) {
            return;
        }

        // Save the Generative AI Metric Values
        for (var i = 0; i < generativeAIMetrics.length; i++) {
            let generativeAIMetricsObj = generativeAIMetrics[i];
            generativeAIMetricsObj.sys_generative_ai_log = genAILogSysId + '';
            generativeAIMetricsObj.sys_gen_ai_log_metadata = genAILogMetadataSysId + '';

            let hasAllMandatoryFields = genAIMetricsMandatoryFields.every((i) => generativeAIMetricsObj.hasOwnProperty(i));
            if (!hasAllMandatoryFields) {
                gs.error('MosaicKafkaLogProcessor - Not creating sys_generative_ai_metric due to not all mandatory fields existing in the Mosaic Kafka message: ' + JSON.stringify(generativeAIMetricsObj));
                return;
            }

            let fieldsToPersist = this._getFieldsToPersist(generativeAIMetricsObj, genAIMetricFields);
            this._insertRecord('sys_generative_ai_metric', fieldsToPersist);
        }
    },

    _applyStagedFeedback: function(genAILogSysId, mosaicLlmInvocationId) {
        if (gs.nil(mosaicLlmInvocationId))
            return;

        var stagingGr = new GlideRecord('mosaic_feedback_staging');
        if (stagingGr == null)
            return;

        stagingGr.addQuery('mosaic_llm_invocation_id', mosaicLlmInvocationId);
        stagingGr.query();
        if (stagingGr.next() && !gs.nil(stagingGr.getValue('feedback'))) {
            var payload = {
                logId: genAILogSysId,
                feedback: stagingGr.getValue('feedback'),
                editedResponse: stagingGr.getValue('edited_response'),
                isResponseEdited: stagingGr.getValue('is_response_edited'),
                additionalData: stagingGr.getValue('additional_data')
            };
            sn_one_extend.GenerativeAIUtility.sendFeedback(payload);
        }
    },

    _convertMillisIntoDateTime: function(milliSeconds) {
        if (gs.nil(milliSeconds))
            milliSeconds = 0;

        let dateTime = new GlideDateTime();
        dateTime.setNumericValue(milliSeconds);
        return dateTime;
    },

    _insertRecord: function(table, props) {
        try {
            let gr = new GlideRecord(table);
            gr.initialize();
            let result = false;
            for (var key in props) {
                if (!gs.nil(props[key]) && gr.isValidField(key))
                    gr.setValue(key, props[key]);
            }
            result = gr.insert();
            if (result) {
                return result;
            } else {
                gs.error("MosaicKafkaLogProcessor - Record insert failed on table " + table);
            }
        } catch (err) {
            gs.error("MosaicKafkaLogProcessor - Insertion of record failed to perform the operation" + JSON.stringify(err));
        }
    },

    _impersonate: function(userSysId) {
        if (gs.nil(userSysId) || !GlideImpersonate().canImpersonate(userSysId)) {
            gs.warn("MosaicKafkaLogProcessor - No access to impersonate " + userSysId);
            // Return current user's sys_id
            return gs.getUserID();
        } else {
            var impUser = new GlideImpersonate();
            return impUser.impersonate(userSysId);
        }
    },

    _setDomain: function(domainId) {
        let session = gs.getSession();
        let originalDomain = session.getDomainID();
        if (!gs.nil(domainId)) {
            session.setDomainID(domainId);
        }
        return originalDomain;
    },

    _validateMessage: function(msgObj) {
        if (msgObj?.executionRequest?.capability || msgObj?.executionRequest?.meta || msgObj?.records?.sys_generative_ai_log || msgObj?.records?.oem_translation_metrics) {
            return true;
        }

        return false;
    },

    // Returns the parsed message object if it is an external provider usage message, null otherwise.
    // External provider usage messages are unencrypted JSON: records is an array and records[0].source is non-null.
    // Encrypted Mosaic messages cannot be parsed as readable JSON so they always fall through.
    _tryParseExternalProviderUsageMessage: function(message) {
        try {
            var parsed = typeof message === 'string' ? JSON.parse(message) : message;
            if (Array.isArray(parsed.records) && parsed.records.length > 0 && !gs.nil(parsed.records[0].source)) {
                return parsed;
            }
        } catch (e) {
            /* encrypted Mosaic message - not parseable as plain JSON */
        }
        return null;
    },

    _processExternalProviderUsageMessage: function(msgObj) {
        var requestId = (msgObj.metadata && !gs.nil(msgObj.metadata.requestId)) ? msgObj.metadata.requestId : '';
        try {
            var records = msgObj.records;
            for (var j = 0; j < records.length; j++) {
                if (!gs.nil(requestId))
                    records[j].requestId = requestId;
                var result = sn_one_extend.GenerativeAIUtility.createGenAIUsageExternal(records[j]);
                // Success is logged once, by the licensing layer that writes the row — no duplicate here.
                if (gs.nil(result)) {
                    gs.warn('MosaicKafkaLogProcessor - createGenAIUsageExternal returned empty result for external provider usage record (requestId=' + requestId + '): ' + JSON.stringify(records[j]));
                }
            }
        } catch (ex) {
            gs.error('MosaicKafkaLogProcessor - Failed to process external provider usage message (requestId=' + requestId + ')', ex);
        }
    },

    type: 'MosaicKafkaLogProcessor'
};
