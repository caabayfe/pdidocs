var NLUConflictDefinition = Class.create();

(function() {

    var tables = NLUWorkbenchConstants.tables;
    var NLUtables = global.NLUConstants.tables;
    var FIELDS = {
        MODELS: 'models'
    };

    NLUConflictDefinition.analyseConflicts = function(modelIds, definitionId) {
        var conflictDefinition;
        if (definitionId) {
            conflictDefinition = new NLUConflictDefinition(definitionId);
            modelIds = conflictDefinition.getGR().getValue('models').split(',');
        }
        var modelSnapshot = NLUConflictDefinition.constructModelSnapshot(modelIds);
        if (!definitionId) {
            definitionId = NLUConflictDefinition.addRecord(modelIds);
            conflictDefinition = new NLUConflictDefinition(definitionId);
        }

        if (!conflictDefinition.checkForRunningAnalysis()) {
            var executionId = conflictDefinition.createExecutionRec(modelSnapshot);
        } else {
            var errMsg = gs.getMessage('Failed to re run analysis due to an inprogress analysis');
            conflictDefinition._errorResult(errMsg);
        }

        var executionGr = new NLUConflictExecution(executionId).getGR();

        var script = "new sn_nlu_workbench.NLUConflictExecution('" + executionId + "').execute()";

        var scheduleId = global.NLUWorkbenchGlobalScript.scheduleScript(script, 'nlu_conflict_execution', executionId);

        return {
            definitionId: definitionId,
            executionId: executionId,
            createdOn: executionGr.getDisplayValue('sys_created_on'),
            scheduleId: scheduleId
        };
    };

    NLUConflictDefinition.modelCheck = function(modelVersion, language) {
        try {
            if (!modelVersion) return false;
            if (!language) language = 'en';
            var supported = false;
            var query = 'query { NLU { supportedFeaturesByLanguageAndVersion(language: ' + language + ', version: "' + modelVersion + '") { nlpLanguage, nluReleaseVersion, isSentenceEncoderEnabled } } }';
            var res = global.NLUParloIntegrator.getCapability(query);
            if (res && res.state === 'success' && !res.errors) {
                supported = res.data && res.data.NLU;
                supported = supported && supported.supportedFeaturesByLanguageAndVersion;
                supported = supported && supported.isSentenceEncoderEnabled;
            }
            return supported;
        } catch (e) {
            gs.warn('Error while fetching conflict suport for model: ' + modelVersion + '(' + language + ')');
            return true;
        }
    };

    NLUConflictDefinition.constructModelSnapshot = function(modelIds) {
        var modelVersion = null;
        var majorVersion = 0;
        var modelLanguage = null;

        var modelSnapshot = [];
        var intentCount = 0;
        var utteranceCount = 0;
        modelIds && modelIds.forEach(function(modelId) {
            var snapshot = NLUMLSolutionUtil.getModelSolutionInfo(modelId);

            if (!modelVersion) {
                modelVersion = snapshot.version;
                majorVersion = snapshot.version ? parseInt(snapshot.version.substring(0, 1)) : 0;
                if (isNaN(majorVersion)) majorVersion = 0;
            }
            if (!modelLanguage) modelLanguage = snapshot.language;
            var nluModel = new global.NLUModel(modelId);
            var modelName = nluModel.getGR().getValue('display_name');
            if (!NLUConflictDefinition.modelCheck(modelVersion, modelLanguage)) {
                var parloIntegrator = new global.NLUParloIntegrator(nluModel.getGR());
                var supportedLanguages = global.NLUParloIntegrator.getSupportedLanguages();
                var language = {};
                supportedLanguages.forEach(function(lang) {
                    if (lang.value === modelLanguage) {
                        language = lang;
                    }
                });
                var trainModes = language.trainModes;
                var isAsync = trainModes && Array.isArray(trainModes) && trainModes.indexOf('async') > -1 && trainModes.indexOf('sync') === -1;
                if (isAsync) {
                    throw new Error(gs.getMessage('Running conflict is not supported for {0} language model', language.label));
                } else {
                    throw new Error(gs.getMessage('Invalid model version. Please re-train {0} for latest version.', modelName));
                }
            }
            if (modelVersion !== snapshot.version)
                throw new Error(gs.getMessage('Models must be of same version. Please re-train models for latest version.'));
            if (modelLanguage !== snapshot.language)
                throw new Error(gs.getMessage('Models must be of same language.'));

            // dirty check
            var statusGr = new GlideRecord(NLUtables.SYS_NLU_MODEL_STATUS);
            statusGr.addQuery('model', modelId);
            statusGr.query();
            if (statusGr.next() && statusGr.getValue('dirty') === '1') {
                throw new Error(gs.getMessage('Please retrain {0} before you run this conflict report', modelName));
            }

            var intentCountGr = new GlideAggregate(NLUtables.SYS_NLU_INTENT);
            intentCountGr.addQuery('model', modelId);
            intentCountGr.addAggregate('COUNT');
            intentCountGr.query();
            if (intentCountGr.next()) {
                intentCount += intentCountGr.getAggregate('COUNT');
            }

            var uttrCountGr = new GlideAggregate(NLUtables.SYS_NLU_UTTERANCE);
            uttrCountGr.addQuery('intent.model', modelId);
            uttrCountGr.addAggregate('COUNT');
            uttrCountGr.query();
            if (uttrCountGr.next()) {
                utteranceCount += uttrCountGr.getAggregate('COUNT');
            }

            modelSnapshot.push(snapshot);
        });
        if (intentCount < 2) {
            throw new Error(gs.getMessage('Model(s) should have at least 2 intents'));
        } else if (utteranceCount < 2) {
            throw new Error(gs.getMessage('Model(s) should have at least 2 utterances'));
        }
        return modelSnapshot;
    };

    NLUConflictDefinition.addRecord = function(modelIds) {
        var record = new GlideRecord(tables.NLU_CONFLICT_DEFINITION);
        record.initialize();
        record.setValue(FIELDS.MODELS, modelIds);
        return record.insert();
    };

    NLUConflictDefinition.prototype = {
        initialize: function(definitionId) {
            this.definitionId = definitionId;
        },

        getGR: function() {
            if (!gs.nil(this.gr)) return this.gr;
            this.gr = new GlideRecord(tables.NLU_CONFLICT_DEFINITION);
            return this.gr.get(this.definitionId) && this.gr;
        },

        checkForRunningAnalysis: function() {
            var gr = new GlideRecord(tables.NLU_CONFLICT_EXECUTION);
            gr.addQuery('conflict_definition', this.getGR().getValue('sys_id'));
            gr.addQuery('status', 'IN', 'inprogress,processing_results');
            gr.query();
            if (gr.next()) {
                return true;
            }
            return false;
        },

        createExecutionRec: function(modelSnapshot) {
            var executionId = null;
            var errMsg;
            executionId = NLUConflictExecution.addRecord(this.definitionId, modelSnapshot);
            if (gs.nil(executionId)) {
                errMsg = errMsg || gs.getMessage('Failed to create execution');
                this._errorResult();
            }
            return executionId;
        },

        _errorResult: function(message) {
            gs.error('NLU Conflict Analysis Definition: ' + this.definitionId + ' > Error: ' + message);
            throw new Error(errMsg);
        },

        type: 'NLUConflictDefinition'
    };
})();
