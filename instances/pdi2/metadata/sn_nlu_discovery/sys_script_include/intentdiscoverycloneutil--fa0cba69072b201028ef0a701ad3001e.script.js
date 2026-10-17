var IntentDiscoveryCloneUtil = Class.create();

(function() {
    var tables = global.NLUConstants.tables;
    tables.SYS_NLU_INTENT_TRACE = 'sys_nlu_intent_trace';

    var TRACE_FIELDS = {
        TAX_MODEL: 'taxonomy_model',
        TAX_INTENT: 'taxonomy_intent',
        LANGUAGE: 'language',
        TYPE: 'type',
        NLU_INTENT: 'intent'
    };
    var TRACE_TYPE = {
        SYSTEM: 'system',
        CUSTOM: 'custom'
    };

    IntentDiscoveryCloneUtil.prototype = {

        initialize: function(reportId, reportIntentName, taxModel) {
            this.reportId = reportId;
            this.reportIntentName = reportIntentName;
            this.taxModel = taxModel;
            this.taxUtil = new sn_nlu_discovery.TaxonomyUtil();
            this.trackUtil = new sn_nlu_discovery.IntentDiscoveryRecordTracking();

            this.skippedIntents = [];
            this.primaryIntents = [];
        },

        cloneIntent: function(modelId, secLanguages) {
            this.taxIntentName = this.taxUtil.getTaxonomyNameFromIntentName(this.reportIntentName);
            this.intentName = this.taxIntentName;

            var priNluModel = new global.NLUModel(modelId);
            this.modelScope = priNluModel.getScope();
            var priLanguage = priNluModel.getGR().getValue('language');
            this.processIntent(priNluModel, [priLanguage], true);

            if (secLanguages && Array.isArray(secLanguages) && secLanguages.length > 0) {
                var priIntentGr = priNluModel.getIntents();
                while (priIntentGr.next()) {
                    if (this.intentName === priIntentGr.getValue('name'))
                        this.priIntentId = priIntentGr.getUniqueValue();
                    this.primaryIntents.push({
                        sysId: priIntentGr.getUniqueValue(),
                        name: priIntentGr.getValue('name')
                    });
                }
                this.processIntent(priNluModel, secLanguages, false);
            }

            return this.skippedIntents;
        },

        processIntent: function(priNluModel, languages, isPrimary) {
            var context = this;
            var mappingsGr = this.getOOBMappings(languages);
            var processedIntents = [];
            while (mappingsGr.next()) {
                if (mappingsGr.intent.name && processedIntents.indexOf(mappingsGr.intent) === -1) {
                    if (isPrimary || !this.intentName)
                        this.intentName = mappingsGr.intent.name.toString();
                    var language = mappingsGr.getValue(TRACE_FIELDS.LANGUAGE);
                    var nluModel = isPrimary ? priNluModel : this.getSecNluModel(priNluModel, language);

                    if (!this.checkSkipIntent(nluModel))
                        this.importIntentFromOOBModel(mappingsGr, nluModel, isPrimary);

                    var index = languages.indexOf(language);
                    if (index > -1) languages.splice(index, 1);
                    processedIntents.push(mappingsGr.intent);
                }
            }

            // Rest of the languages, which don't have OOB mapping:
            languages.forEach(function(language) {
                var nluModel = isPrimary ? priNluModel : context.getSecNluModel(priNluModel, language);
                if (!context.checkSkipIntent(nluModel))
                    context.createIntentFromTaxonomy(nluModel, isPrimary);
            });
        },

        checkSkipIntent: function(nluModel) {
            // if oob intent mapping doesn't exist, use taxonomy intent name for lookup
            // use non mapped name for lookup, override it if we find a mapping.
            // Skip intent if already exists in model & there is atleast one utterance: 
            try {
                var utteranceGA = new GlideAggregate(tables.SYS_NLU_UTTERANCE);
                utteranceGA.addQuery('intent.model', nluModel.getGR().getUniqueValue());
                utteranceGA.addQuery('intent.name', this.intentName);
                utteranceGA.addAggregate('COUNT');
                utteranceGA.query();
                if (utteranceGA.next() && utteranceGA.getAggregate('COUNT') > 0) {
                    this.skippedIntents.push(this.taxIntentName);
                    return true;
                }
            } catch (ex) {
                gs.error('IntentDiscoveryCloneUtil.checkSkipIntent > failed to check intent');
            }
            return false;
        },

        getSecNluModel: function(priNluModel, langauge) {
            var priModelGr = priNluModel.getGR();
            var priModelId = priModelGr.getUniqueValue();
            var gr = new GlideRecord(tables.SYS_NLU_MODEL);
            gr.addQuery('language', langauge);
            gr.addQuery('primary_model', priModelId);
            gr.query();
            if (gr.next())
                return new global.NLUModel(gr.getUniqueValue());

            // create new record:
            var fields = ['display_name', 'language', 'category', 'sys_scope', 'primary_model'];
            var modelProps = {
                display_name: priModelGr.getValue('display_name') + ' ' + langauge.toUpperCase(),
                language: langauge,
                category: priModelGr.getValue('category'),
                sys_scope: priModelGr.getValue('sys_scope'),
                primary_model: priModelId
            };
            var newModelId = global.NLUSystemUtil.copyRecord(tables.SYS_NLU_MODEL, fields, modelProps);
            var nluModel = new global.NLUModel(newModelId);
            this.syncIntents(nluModel);
            return nluModel;
        },

        syncIntents: function(secNluModel) {
            var context = this;
            this.primaryIntents.forEach(function(intent) {
                if (intent.name !== context.intentName) {
                    context.createIntent(secNluModel, intent.name, intent.sysId, false);
                }
            });
        },

        addToIntentTrace: function(intentId, language) {
            var traceId = this.createOOBMapping(intentId, language);
            if (traceId) {
                var mapping = this.taxUtil.getIntentNameFromTaxonomyMapping(this.taxIntentName);
                var taxonomyIntentSysId = this.taxUtil.getSysIdForTaxonomyIntentName(this.reportId, mapping);
                if (taxonomyIntentSysId != null) {
                    this.trackUtil.trackIntentAction(taxonomyIntentSysId, language, intentId);
                }
            }
        },

        updatePrimaryIntent: function(intentGr, isPrimary) {
            if (isPrimary) {
                this.priIntentId = intentGr.getUniqueValue();
            } else if (this.priIntentId) {
                intentGr.setValue('primary_intent', this.priIntentId);
                intentGr.update();
            }
        },

        importIntentFromOOBModel: function(oobMapping, nluModel, isPrimary) {
            var oobIntentName = oobMapping.intent.name.toString();
            if (oobIntentName) {
                var modelId = nluModel.getGR().getUniqueValue();
                var importStatus = global.NLUImportUtil.importIntent([oobMapping.intent], modelId);
                if (importStatus && importStatus.status === 'success') {
                    var intentGr = nluModel.getIntents('name=' + oobIntentName);
                    if (intentGr.next()) {
                        var newIntentId = intentGr.getUniqueValue();
                        var language = oobMapping.getValue(TRACE_FIELDS.LANGUAGE);
                        this.addToIntentTrace(newIntentId, language);
                        this.updatePrimaryIntent(intentGr, isPrimary);
                    }
                }
            }
        },

        createIntentFromTaxonomy: function(nluModel, isPrimary) {
            // oobIntent does not exist, create intent
            var context = this;
            var newIntentId = this.createIntent(nluModel, this.intentName, !isPrimary && this.priIntentId, true);

            if (newIntentId) {
                if (isPrimary) this.priIntentId = newIntentId;
                var language = nluModel.getGR().getValue('language');

                var utterencesToAdd = this.taxUtil.getTaxonomyUtterences(this.reportId, this.taxIntentName, language);
                utterencesToAdd.forEach(function(eachUtterance) {
                    context.createUtterance(newIntentId, eachUtterance);
                });

                this.addToIntentTrace(newIntentId, language);
            }
        },

        createIntent: function(nluModel, intentName, priIntentId, isClone) {
            var gr = nluModel.getIntents('name=' + intentName);
            if (!gr.next()) {
                var modelId = nluModel.getGR().getUniqueValue();

                var newIntent = new GlideRecord(tables.SYS_NLU_INTENT);
                newIntent.initialize();
                newIntent.setValue('model', modelId);
                newIntent.setValue('sys_scope', this.modelScope);
                newIntent.setValue('name', intentName);
                newIntent.setValue('description', intentName);
                // Enable the primary intents or only in case of clone to secondary: 
                newIntent.setValue('enable', !priIntentId || isClone);
                if (priIntentId) newIntent.setValue('primary_intent', priIntentId);
                return newIntent.insert();
            } else {
                var update = false;
                if (gr.getValue('enable') === '0' && (!priIntentId || isClone)) {
                    gr.setValue('enable', true);
                    update = true;
                }
                if (!gr.getValue('primary_intent') && priIntentId) {
                    gr.setValue('primary_intent', priIntentId);
                    update = true;
                }
                if (update) gr.update();
                return gr.getUniqueValue();
            }
        },

        createUtterance: function(intentId, utterance) {
            if (!this.utteranceExists(intentId, utterance)) {
                var utteranceGR = new GlideRecord(tables.SYS_NLU_UTTERANCE);
                utteranceGR.initialize();
                utteranceGR.setValue('intent', intentId);
                utteranceGR.setValue('utterance', utterance);
                utteranceGR.setValue('sys_scope', this.modelScope);
                utteranceGR.insert();
            }
        },

        utteranceExists: function(intentId, utterance) {
            var utteranceGA = new GlideAggregate(tables.SYS_NLU_UTTERANCE);
            utteranceGA.addQuery('intent', intentId);
            utteranceGA.addQuery('utterance', utterance);
            utteranceGA.addAggregate('COUNT');
            utteranceGA.query();
            return utteranceGA.next() && utteranceGA.getAggregate('COUNT') > 0;
        },

        getOOBMappings: function(languages) {
            var oobMapping = new GlideRecord(tables.SYS_NLU_INTENT_TRACE);
            oobMapping.addQuery(TRACE_FIELDS.TAX_MODEL, this.taxModel);
            oobMapping.addQuery(TRACE_FIELDS.TAX_INTENT, this.taxIntentName);
            oobMapping.addQuery(TRACE_FIELDS.LANGUAGE, 'IN', languages);
            oobMapping.addQuery(TRACE_FIELDS.TYPE, TRACE_TYPE.SYSTEM);
            oobMapping.query();
            return oobMapping;
        },

        createOOBMapping: function(newIntentId, language) {
            var traceRecord = new GlideRecord(tables.SYS_NLU_INTENT_TRACE);
            traceRecord.initialize();
            traceRecord.setValue(TRACE_FIELDS.TAX_MODEL, this.taxModel);
            traceRecord.setValue(TRACE_FIELDS.TAX_INTENT, this.reportIntentName);
            traceRecord.setValue(TRACE_FIELDS.LANGUAGE, language);
            traceRecord.setValue(TRACE_FIELDS.TYPE, TRACE_TYPE.CUSTOM);
            traceRecord.setValue(TRACE_FIELDS.NLU_INTENT, newIntentId);
            return traceRecord.insert();
        },

        type: 'IntentDiscoveryCloneUtil'
    };
})();
