var NLUModelTranslator = Class.create();

(function() {
    var tables = NLUConstants.tables;
    var constants = NLUConstants.constants;
    var stateTypes = NLUConstants.MODEL_STATE_TYPES;

    var TRANSLATE_MODES = {
        MACHINE: 'machineTranslate',
        EXPORT_IMPORT: 'exportImport',
        THIRDPARTY: 'thirdPartyTranslate'
    };

    NLUModelTranslator.machineTranslate = function(artifactName, modelId, language, params, stubModelId) {
        var result = {};
        try {
            new global.LocalizationFrameworkAPIV2().machineTranslate(artifactName, modelId, language, JSON.parse(params));
        } catch (e) {
            gs.debug('Model translation failed for' + modelId + 'with error' + e.message);
            global.NLUModel.updateModelStatus(stubModelId, stateTypes.error_while_translating);
            result.status = 'failure';
            result.message = e.message;
        }
        return result;
    };

    NLUModelTranslator.prototype = {
        initialize: function(modelId, language) {
            this.modelId = modelId;
            this.language = language;
            this.nluModel = new NLUModel(modelId);
            this.importUtil = new NLUImportUtil(modelId, true);
        },

        createStubModel: function() {
            var srcModelGr = this.nluModel.getGR();
            var stubModelDisplayName = srcModelGr.display_name + ' ' + this.language.toUpperCase();
            var newProps = {
                language: this.language,
                display_name: stubModelDisplayName
            };
            var newModelId = this.importUtil.createRecord(tables.SYS_NLU_MODEL, srcModelGr, newProps);
            if (!newModelId) return;
            newProps = {
                model: newModelId
            };
            var intentProps = {
                model: newModelId,
                origin: null
            };
            var srcIntentGr = this.nluModel.getIntents();
            var intentIdsMap = new NLUImportUtil(newModelId, true).createIntents(srcIntentGr, intentProps);
            var newNLUModel = new NLUModel(newModelId);
            if (NLUParloIntegrator.isEntitiesEnabled(this.language, newNLUModel.getVersion())) {
                newProps.sysEntities = newNLUModel.getSystemEntities();
                var entityMap = this.importUtil.createModelEntities(this.nluModel.getModelEntities(), newProps);
                this.importUtil.createIntentEntities(intentIdsMap, newProps, entityMap);
            }

            return newModelId;
        },

        translate: function(mode) {
            var result = {};
            var errorMessage = null;
            try {
                var srcModelGr = this.nluModel.getGR();
                var tgtModelGr = this.nluModel.getTranslatedModels(this.language);
                var doesModelExist = tgtModelGr.next();
                var modelId = doesModelExist ? tgtModelGr.getUniqueValue() : this.createStubModel();
                if (!modelId) {
                    if (NLUSystemUtil.getCurrentDomain() != srcModelGr.getValue('sys_domain'))
                        errorMessage = gs.getMessage('Cannot create secondary model in domain different from primary model');
                    return {
                        status: 'failure',
                        message: errorMessage || gs.getMessage('Failed to create model')
                    };
                }
                if (!GlidePluginManager.isActive("com.glide.localization_framework")) return {
                    status: 'success',
                    sysId: modelId
                };
                this.lfApi = new global.LocalizationFrameworkAPIV2();
                this.srcLangugage = NLUModel.getLanguage(this.nluModel.getGR());

                result.sysId = modelId;
                switch (mode) {
                    case TRANSLATE_MODES.MACHINE:
                        var params = {
                            sourceLanguage: this.srcLangugage,
                            overrideExistingTranslations: false
                        };
                        var script = "global.NLUModelTranslator.machineTranslate('" + constants.NLU_ARTIFACT_NAME + "','" + this.modelId + "', '" + this.language + "', '" + JSON.stringify(params) + "', '" + modelId + "')";
                        NLUWorkbenchGlobalScript.scheduleScript(script, tables.SYS_NLU_MODEL, this.modelId);
                        global.NLUModel.updateModelStatus(modelId, stateTypes.translating);
                        break;
                    case TRANSLATE_MODES.THIRDPARTY:
                        result.data = this.thirdPartyTranslate();
                        global.NLUModel.updateModelStatus(modelId, stateTypes.translating);
                        break;
                }
                result.status = 'success';
            } catch (e) {
                //Prevent deletion of model if the translate is called for delta changes.
                if (!doesModelExist) this.cleanUp(modelId);
                result.status = 'failure';
                result.message = e.message;
            }
            return result;
        },

        cleanUp: function(modelId) {
            global.NLUModel.deleteModel(modelId);
        },

        thirdPartyTranslate: function() {
            return this.lfApi.requestTranslations(constants.NLU_ARTIFACT_NAME, [this.modelId], [this.language], {
                sourceLanguage: this.srcLangugage
            });
        },

        type: 'NLUModelTranslator'
    };
})();
