var NLUImprovementAnalaysisReport = Class.create();

(function() {
    var tables = NLUWorkbenchConstants.tables;

    NLUImprovementAnalaysisReport.prototype = {
        initialize: function() {},

        createIntent: function(intentName, modelGr, language) {
            var modelId = modelGr.getUniqueValue();
            var priModelId = modelGr.getValue('primary_model') ? modelGr.getValue('primary_model') : modelId;
            var gr = new GlideRecord(tables.SYS_NLU_INTENT);
            gr.initialize();
            gr.setValue('name', intentName);
            gr.setValue('model', priModelId);
            var intentId = gr.insert();
            if (priModelId == modelId) return intentId;
            return this.getIntentId(modelId, intentName);
        },

        addUtteranceToIntent: function(utterance, intentId) {
            var gr = new GlideRecord(tables.SYS_NLU_UTTERANCE);
            gr.initialize();
            gr.setValue('utterance', utterance);
            gr.setValue('intent', intentId);
            return gr.insert();
        },

        addUtteranceTraceRecord: function(utteranceId, clusterDetailId) {
            var gr = new GlideRecord(tables.NLU_PERFORMANCE_UTTERANCE_TRACE);
            gr.initialize();
            gr.setValue('utterance_id', utteranceId);
            gr.setValue('cluster_detail_id', clusterDetailId);
            return gr.insert();
        },

        getIntentId: function(modelId, intentName) {
            var gr = new GlideRecord(tables.SYS_NLU_INTENT);
            gr.addQuery('model', modelId);
            gr.addQuery('name', intentName);
            gr.query();
            return gr.next() ? gr.getUniqueValue() : null;
        },

        getModelGr: function(modelId, language) {
            var gr = new GlideRecord(tables.SYS_NLU_MODEL);
            var query = 'sys_id=' + modelId + '^ORprimary_model.sys_id=' + modelId + '^language=' + language;
            if (language == 'en') query += '^ORlanguageISEMPTY';
            gr.addEncodedQuery(query);
            gr.query();
            return gr.next() ? gr : null;
        },

        addUtterancesToIntent: function(modelId, intentName, language, dataMap) {
            var intentUtterances = [],
                addedUtterancesCount = 0,
                skippedUtterancesCount = 0;
            var clusterDetailIds = [];
            var utterances = [];
            var intentId = null;
            for (var key in dataMap) {
                clusterDetailIds.push(key);
                utterances.push(dataMap[key]);
            }
            try {
                var utterancesPerIntentLimit = parseInt(gs.getProperty('glide.nlu.utterances_per_intent.value_limit', 200), 10);
                var modelGr = this.getModelGr(modelId, language);
                if (!modelGr) throw new Error(gs.getMessage('Model does not exist'));
                modelId = modelGr.getUniqueValue();
                intentId = this.getIntentId(modelId, intentName);
                if (!intentId)
                    intentId = this.createIntent(intentName, modelGr, language);
                else {
                    var utteranceData = global.NLUStudioTrainer.getUtterancesDataFromGR((new global.NLUIntent(intentId)).getUtterances());
                    if (utteranceData) intentUtterances = (utteranceData.utteranceArray || []).map(function(obj) {
                        return obj['utterance'];
                    });
                }
                if (utterancesPerIntentLimit <= intentUtterances.length + utterances.length)
                    throw new Error(gs.getMessage('Maximum number of utterances allowed per intent is {0}', utterancesPerIntentLimit));
                for (var i = 0; i < utterances.length; i++) {
                    if (intentUtterances.indexOf(utterances[i]) > -1 || utterances[i].trim().length === 0)
                        skippedUtterancesCount++;
                    else {
                        var utteranceId = this.addUtteranceToIntent(utterances[i], intentId);
                        if (utteranceId) {
                            this.addUtteranceTraceRecord(utteranceId, clusterDetailIds[i]);
                            addedUtterancesCount++;
                            intentUtterances.push(utterances[i]);
                        }
                    }

                }
                return {
                    status: 'success',
                    addedCount: addedUtterancesCount,
                    skippedCount: skippedUtterancesCount,
                };
            } catch (e) {
                return {
                    status: 'failure',
                    message: e.message
                };
            }
        },

        ignoreCluster: function(clusterSummaryId) {
            try {
                var gr = new GlideRecord(tables.NLU_PERFORMANCE_IGNORED_CLUSTERS);
                gr.initialize();
                gr.setValue('cluster_summary_id', clusterSummaryId);
                gr.insert();
                return {
                    status: 'success',
                };
            } catch (e) {
                return {
                    status: 'failure',
                    message: e.message
                };
            }
        },

        unIgnoreCluster: function(clusterSummaryId) {
            try {
                var gr = new GlideRecord(tables.NLU_PERFORMANCE_IGNORED_CLUSTERS);
                gr.addQuery('cluster_summary_id', clusterSummaryId);
                gr.query();
                if (gr.next())
                    gr.deleteRecord();
                return {
                    status: 'success',
                };
            } catch (e) {
                return {
                    status: 'failure',
                    message: e.message
                };
            }
        },

        type: 'NLUImprovementAnalaysisReport'
    };
})();
