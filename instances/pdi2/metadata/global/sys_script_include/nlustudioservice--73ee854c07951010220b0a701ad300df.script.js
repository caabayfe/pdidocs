var NLUStudioService = Class.create();

(function() {

    var constants = NLUConstants.constants;
    var tables = NLUConstants.tables;
    var stateTypes = NLUConstants.MODEL_STATE_TYPES;
    var STATUS = {
        ERROR: 'error',
        WARNING: 'warning',
        SUCCESS: 'success'
    };
    var PLAIN_TEXT = 'plain_text';
    var HTML = 'html';

    var MODEL_TYPE = {
        UNGROUPED: 'ungrouped',
        PRIMARY: 'primary',
        SECONDARY: 'secondary'
    };
    var PRIMARY_MODEL_FLD = NLUImportUtil.FIELDS_DATA[tables.SYS_NLU_MODEL].primaryField;

    var _getMlSolutionGR = function() {
        var mlSolutionGr = new GlideRecord(tables.ML_SOLUTION);
        mlSolutionGr.addQuery('active', true);
        mlSolutionGr.addQuery('capability', 'nlu_trainer');
        mlSolutionGr.query();

        return mlSolutionGr;
    };

    var _getPrimaryModel = function(modelName) {
        var gr = new GlideRecord(tables.SYS_NLU_MODEL);
        if (gr.get('name', modelName))
            return gr.getValue(PRIMARY_MODEL_FLD) || gr.getUniqueValue();
        return null;
    };

    var _getPrimaryModelById = function(modelId) {
        var gr = new GlideRecord(tables.SYS_NLU_MODEL);
        if (gr.get(modelId))
            return gr.getValue(PRIMARY_MODEL_FLD) || modelId;
        return null;
    };

    var _getModelType = function(gr) {
        var primaryId = gr.getValue(PRIMARY_MODEL_FLD);
        if (primaryId) return MODEL_TYPE.SECONDARY;
        var priGr = new GlideRecord(tables.SYS_NLU_MODEL);
        return priGr.get(PRIMARY_MODEL_FLD, gr.getUniqueValue()) ? MODEL_TYPE.PRIMARY : MODEL_TYPE.UNGROUPED;
    };

    var _getModelData = function(gr) {
        if (gs.nil(gr)) {
            return {
                id: null
            };
        }
        var modelData = {
            id: gr.getUniqueValue(),
            name: gr.getValue('name'),
            displayName: gr.getValue('display_name'),
            language: NLUModel.getLanguage(gr),
            scope: gr.getValue('sys_scope'),
            type: _getModelType(gr),
            category: gr.getValue('category'),
            readOnly: gr.getValue('sys_policy') === "read" ? true : false
        };
        if (gr.getValue(PRIMARY_MODEL_FLD)) {
            modelData.primaryId = gr.getValue(PRIMARY_MODEL_FLD);
            modelData.primaryName = gr[PRIMARY_MODEL_FLD].name.getValue();
        }

        var solution = NLUParloIntegrator.getSolution(gr.getValue('name'));
        if (solution) {
            var modelStatus = NLUParloIntegrator.getStatusFromSolution(solution);
            delete modelStatus.status;
            NLUHelper.extend(modelData, modelStatus);
        }
        return modelData;
    };

    var _getGroupModelData = function(gr) {
        var modelsArray = [];
        while (gr.next()) {
            modelsArray.push(_getModelData(gr));
        }
        return modelsArray;
    };

    var _getModelGroupByPrimary = function(primaryModelId) {
        if (!primaryModelId) return [];
        var gr = new GlideRecord(tables.SYS_NLU_MODEL);
        var grOR = gr.addQuery('sys_id', primaryModelId);
        grOR.addOrCondition(PRIMARY_MODEL_FLD, primaryModelId);
        gr.query();
        return _getGroupModelData(gr);
    };

    /*
    	publishStatus: [error | warning | success]
    	publishMessage: {
    		type: [plain_text | html]
    		text: <>,
    	}
    */
    var pluginInstalled = GlidePluginManager.isActive('com.snc.nlu.workbench.advanced');

    var _publishStatusResp = function(status, messageType, message) {
        return {
            publishStatus: status,
            publishMessage: {
                type: messageType,
                text: message
            }
        };
    };

    var _getMessageWithLink = function(message, link, linkText) {
        return '<p>' + message + '</p><br/><a href=\'' + link + '\' target=\'_blank\'/>' + linkText + '</a>';
    };

    var _getPublishStatus = function(modelData, includeWarnings) {
        /*** ERRORS ***/
        // Check if model is dirty and needs to be trained
        if (modelData.isModelDirty === "1")
            return _publishStatusResp(STATUS.ERROR, PLAIN_TEXT, gs.getMessage('Model should be trained'));
        // Check if model exists:
        if (!modelData || !modelData.id)
            return _publishStatusResp(STATUS.ERROR, PLAIN_TEXT, gs.getMessage('Model does not exist.'));
        // Role check: 
        if (!gs.hasRole(constants.NLU_ADMIN_ROLE))
            return _publishStatusResp(STATUS.ERROR, PLAIN_TEXT, gs.getMessage('User is not authorized to publish.'));
        if (pluginInstalled && includeWarnings) {
            var testInfo = sn_nlu_workbench.NLUBatchTestExecution.getReportInfo(modelData.id, false, modelData.trainedVersion);
            // If batch testing is in progress
            if (testInfo.status === 'inprogress') {
                return _publishStatusResp(STATUS.WARNING, PLAIN_TEXT, gs.getMessage('Batch testing for this NLU model is currently in progress. Are you sure you want to publish the topic?'));
            }

            // Latest text execution was not successful/no batch testing results available
            if (!testInfo || !testInfo.executionId) {
                return _publishStatusResp(STATUS.WARNING, HTML, _getMessageWithLink(
                    gs.getMessage('Before publishing, we recommend that you test the model. Testing the model gets you insights into how the model is correctly and incorrectly predicting intents.'),
                    'nav_to.do?uri=/$nlu-studio.do#/model-overview/' + modelData.id,
                    gs.getMessage('Test this model in NLU Workbench')
                ));
            }
        }
        // Model is never trained
        if (!modelData.trainedVersion || modelData.trainedVersion <= 0)
            return _publishStatusResp(STATUS.ERROR, PLAIN_TEXT, gs.getMessage('The model is never trained.'));
        // Last trained model is already published
        if (modelData.trainedVersion <= modelData.publishedVersion)
            return _publishStatusResp(STATUS.ERROR, PLAIN_TEXT, gs.getMessage('The latest version is already published.'));
        // If Training is in progress
        if (modelData.status === stateTypes.training)
            return _publishStatusResp(STATUS.ERROR, PLAIN_TEXT, gs.getMessage('The model training is in progress.'));

        /*** SUCCESS ***/
        return _publishStatusResp(STATUS.SUCCESS, PLAIN_TEXT, gs.getMessage('This model can be published'));
    };

    var _getModelStatusByName = function(modelName, addPublishStatus) {
        var modelData = {};
        var modelGr = NLUModel.getGRByName(modelName);
        if (!gs.nil(modelGr)) {
            modelData = _getModelData(modelGr);
            var modelStatusGr = NLUModel.getModelStatusGr(modelGr.getUniqueValue());
            if (modelStatusGr) {
                modelData.lastUpdatedOn = modelStatusGr.getValue('model_updated_on');
            } else {
                var lastUpdatedOn = NLUModel.getLastUpdatedOn(modelGr.getUniqueValue());
                modelData.lastUpdatedOn = lastUpdatedOn && lastUpdatedOn.getValue();
            }
        }
        modelData.isModelDirty = modelStatusGr.getValue('dirty');
        if (addPublishStatus) {
            NLUHelper.extend(modelData, _getPublishStatus(modelData, true));
        }
        return modelData;
    };

    NLUStudioService.publishModels = function(modelNames) {
        var result = {};
        var modelGr = new GlideRecord(tables.SYS_NLU_MODEL);
        modelGr.addQuery('name', 'IN', modelNames);
        modelGr.query();
        while (modelGr.next()) {
            var modelData = _getModelData(modelGr);
            var canPublish = _getPublishStatus(modelData, false);
            if (canPublish.publishStatus === STATUS.SUCCESS) {
                var publishResult = NLUStudioPublisher.publishModel(modelGr.getUniqueValue());
                if (publishResult.status === 'success') {
                    result[modelGr.getValue('name')] = {
                        publishStatus: STATUS.SUCCESS,
                        publishedVersion: publishResult.publishedVersion
                    };
                } else {
                    result[modelGr.getValue('name')] = _publishStatusResp(STATUS.ERROR, PLAIN_TEXT, publishResult.message);
                }
            } else {
                result[modelGr.getValue('name')] = canPublish;
            }
        }
        return result;
    };

    NLUStudioService.getAllModels = function(category, primary, includeLastUpdated) {
        var result = [];
        var gr = new GlideRecord(tables.SYS_NLU_MODEL);
        if (category) gr.addQuery('category', category);
        if (primary) gr.addNullQuery(PRIMARY_MODEL_FLD);
        gr.query();
        while (gr.next()) {
            if (includeLastUpdated) result.push(NLUStudioService.getModelStatusByName(gr.name));
            else result.push(_getModelData(gr));
        }
        return result;
    };

    NLUStudioService.getModelGroup = function(modelName) {
        return _getModelGroupByPrimary(_getPrimaryModel(modelName));
    };

    NLUStudioService.getModelGroupById = function(modelId) {
        return _getModelGroupByPrimary(_getPrimaryModelById(modelId));
    };

    NLUStudioService.getTrainedModels = function(category, primary) {
        var solutionNames;
        var aggr = new GlideAggregate(tables.ML_SOLUTION);
        aggr.addQuery('capability', 'nlu_trainer');
        aggr.addQuery('state', 'solution_complete');
        aggr.groupBy('solution_name');
        aggr.query();
        while (aggr.next()) {
            var solName = aggr.getValue('solution_name');
            solutionNames = (solutionNames ? solutionNames + ',' : '') + solName + ',' + solName.substring(3);
        }

        var gr = new GlideRecord(tables.SYS_NLU_MODEL);
        gr.addQuery('name', 'IN', solutionNames);
        gr.addQuery('category', category);
        if (primary) gr.addNullQuery(PRIMARY_MODEL_FLD);
        gr.query();
        return _getGroupModelData(gr);
    };

    NLUStudioService.getModelStatusByName = function(modelName, addPublishStatus) {
        if (Array.isArray(modelName)) {
            var result = [];
            modelName.forEach(function(name) {
                result.push(_getModelStatusByName(name, addPublishStatus));
            });
            return result;
        }
        return _getModelStatusByName(modelName, addPublishStatus);
    };

    NLUStudioService.getLastTrainedVersion = function(modelName) {
        var solution = NLUParloIntegrator.getSolution(modelName);
        return NLUParloIntegrator.getLastTrainedVersion(solution);
    };

    NLUStudioService.getPublishedVersion = function(modelName) {
        var solution = NLUParloIntegrator.getSolution(modelName);
        return solution && solution.getActiveVersion();
    };

    NLUStudioService.getLastTrainedVersionById = function(modelId) {
        var modelGr = NLUModel.getGRById(modelId);
        return modelGr && NLUStudioService.getLastTrainedVersion(modelGr.getValue('name'));
    };

    NLUStudioService.getPublishedVersionById = function(modelId) {
        var modelGr = NLUModel.getGRById(modelId);
        return modelGr && NLUStudioService.getPublishedVersion(modelGr.getValue('name'));
    };

    NLUStudioService.getAllPublishedModels = function(category) {
        var modelsArray = [],
            id, nluModelRec;
        var modelObj, name, modelNames = '';
        var solutionVersion = 0,
            modelsObj = {}; //<name>: {model object}

        try {
            var mlSolutionGr = _getMlSolutionGR();
            while (mlSolutionGr.next()) {
                name = mlSolutionGr.getValue('solution_name');
                // From Quebec, the model name and solution name will be same
                modelNames = name + ',' + name.substring(3);
                nluModelRec = NLUModel.getGRByName(modelNames);

                solutionVersion = mlSolutionGr.getValue('version');
                modelObj = {};

                if (nluModelRec) {

                    if (modelsObj[name]) {
                        if (solutionVersion > modelsObj[name].publishedVersion) {
                            modelsObj[name].publishedVersion = solutionVersion;
                        }
                        continue;
                    }

                    modelObj = NLUSystemUtil.getObjectFromGR(nluModelRec, {
                        name: 'name',
                        displayName: 'display_name',
                        id: 'sys_id',
                        language: 'language',
                        scope: 'sys_scope',
                        category: 'category'
                    });
                    if (category && category != modelObj.category) continue;

                    modelObj.language = modelObj.language || constants.MODEL_DEFAULT_LANG;
                    modelObj.publishedVersion = solutionVersion;
                    modelsObj[name] = modelObj;
                }
            }
        } catch (e) {}
        for (var property in modelsObj) {
            modelsArray.push(modelsObj[property]);
        }
        return modelsArray;
    };

    NLUStudioService.getIntentsByModel = function(modelName, includeTrained, options) {
        var model = NLUModel.getGRByName(modelName);
        return NLUStudioService.getIntentsByModelId(model && model.getValue('sys_id'), includeTrained, options);
    };

    NLUStudioService.getEntitiesByModel = function(modelName, includeTrained, options) {
        var model = NLUModel.getGRByName(modelName);
        return NLUStudioService.getEntitiesByModelId(model && model.getValue('sys_id'), includeTrained, options);
    };

    NLUStudioService.getSystemEntitiesByModel = function(modelName) {
        var model = NLUModel.getGRByName(modelName);
        return NLUStudioService.getSystemEntitiesByModelId(model && model.getValue('sys_id'));
    };

    NLUStudioService.getEntitiesByIntent = function(intentName, modelName) {
        var model = NLUModel.getGRByName(modelName);
        if (model) {
            var modelId = model.getValue('sys_id');
            var nluModel = new NLUModel(modelId);
            var intent = nluModel.getIntents('name=' + intentName);
            return NLUStudioService.getEntitiesByIntentId(intent && intent.getValue('sys_id'));
        }

        return [];
    };

    NLUStudioService.getIntentsByModelId = function(modelId, includeTrained, options) {
        if (modelId) {
            var nluModel = new NLUModel(modelId);
            var filterQuery = constants.ENABLED_INTENTS_QUERY;
            if (options && options.includeDisabled) filterQuery = '';
            if (options && options.includeDraft) return NLUIntent.getDataFromGR(nluModel.getIntents(filterQuery));
            var maxTimeStamp = includeTrained ? nluModel.getLastTrainedTimestamp() : nluModel.getPublishedTimestamp();
            if (!gs.nil(maxTimeStamp)) {
                filterQuery = 'sys_created_on' + '<=' + maxTimeStamp + '^' + filterQuery;
                return NLUIntent.getDataFromGR(nluModel.getIntents(filterQuery));
            }
        }
        return [];
    };

    NLUStudioService.getEntitiesByModelId = function(modelId, includeTrained, options) {
        if (modelId) {
            var nluModel = new NLUModel(modelId);
            if (options && options.includeDraft) return NLUEntity.getDataFromGR(nluModel.getEntities('', true));
            var maxTimeStamp = includeTrained ? nluModel.getLastTrainedTimestamp() : nluModel.getPublishedTimestamp();
            if (!gs.nil(maxTimeStamp)) {
                var entityRec = nluModel.getEntities('sys_created_on' + '<=' + maxTimeStamp, true);
                return NLUEntity.getDataFromGR(entityRec);
            }
        }

        return [];
    };

    NLUStudioService.getSystemEntitiesByModelId = function(modelId) {
        if (modelId) {
            var nluModel = new NLUModel(modelId);
            return nluModel.getSystemEntities();
        }

        return [];
    };

    NLUStudioService.getEntitiesByIntentId = function(intentId) {
        if (intentId) {
            var nluIntent = new NLUIntent(intentId);
            var entityRec = nluIntent.getEntities();
            return NLUEntity.getDataFromGR(entityRec);
        }

        return [];
    };

    NLUStudioService.getEntities = function(modelId, intentId, includeTrained) {
        var result = [];

        if (modelId) {
            var nluModel = new NLUModel(modelId);
            var maxTimeStamp = includeTrained ? nluModel.getLastTrainedTimestamp() : nluModel.getPublishedTimestamp();
            var entityRec;
            if (!gs.nil(maxTimeStamp)) {
                if (intentId) {
                    // If intentId is also passed, then get only model level entities:
                    entityRec = nluModel.getModelEntities('sys_created_on' + '<=' + maxTimeStamp);
                } else {
                    entityRec = nluModel.getEntities('sys_created_on' + '<=' + maxTimeStamp, true);
                }
                result = result.concat(NLUEntity.getDataFromGR(entityRec));
                // System entities:
                result = result.concat(nluModel.getSystemEntities());
            }
        }
        if (intentId) {
            result = result.concat(NLUStudioService.getEntitiesByIntentId(intentId));
        }

        return result;
    };

    NLUStudioService.getModelStatus = function(modelId) {
        var nluModel = new NLUModel(modelId);
        return nluModel.syncStatus();
    };

    NLUStudioService.createIntent = function(modelProps, intentName) {
        try {
            if (NLUHelper.isEmpty(modelProps)) throw new Error(gs.getMessage("modelProps are missing"));
            var name = modelProps.name || "";
            if (name.length < 3) throw new Error(gs.getMessage("Model name must be at least 3 characters long"));
            if (name.length > 40) throw new Error(gs.getMessage("Model name cannot be more than 40 characters"));
            var result = {};
            var priModelId = "";
            var modelIds = [];
            var modelGr = null;
            var category = modelProps.category || constants.MODEL_CAT_SEARCH;
            var primaryLanguage = modelProps.primaryLanguage || constants.MODEL_DEFAULT_LANG;
            var supportedLanguages = NLUParloIntegrator.getSupportedLanguageCodesByCategory(modelProps.category);
            var secondaryLanguages = modelProps.secondaryLanguages && modelProps.secondaryLanguages.filter(function(language) {
                return supportedLanguages.indexOf(language) !== -1;
            });
            modelProps.secondaryLanguages = secondaryLanguages;
            if (!modelProps.sys_id) {
                if (supportedLanguages.indexOf(primaryLanguage) === -1) throw new Error(gs.getMessage('Primary language is not in one of the supported languages'));
                priModelId = NLUModelGroup.createModelGroup(modelProps, supportedLanguages);
                modelGr = NLUModel.getGRById(priModelId);
            } else if (modelProps.sys_id) {
                modelGr = NLUModel.getGRById(modelProps.sys_id);
                if (!modelGr) {
                    throw new Error(gs.getMessage('Model does not exist'));
                }
                priModelId = _getPrimaryModelById(modelProps.sys_id);
                new NLUModelGroup(priModelId).createSecondaryModels(modelProps, supportedLanguages);
            }
            var languages = modelProps.secondaryLanguages || [];
            languages.push(modelGr.getValue('language'));
            var nluModelGroup = new NLUModelGroup(priModelId);
            new NLUModel(priModelId).createIntent(intentName);
            nluModelGroup.enableIntents(intentName, languages);

            modelIds = nluModelGroup.getModelIds(modelProps.secondaryLanguages);

            modelIds.forEach(function(modelId) {
                var _result = {};
                var nluModel = new NLUModel(modelId).getGR();
                _result.name = nluModel.getValue('name');
                _result.displayName = nluModel.getValue('display_name');
                _result.primary = !nluModel.primary_model ? true : false;
                result[nluModel.getValue('language')] = _result;

            });

            return result;
        } catch (e) {
            return {
                status: 'failure',
                message: e.message
            };
        }
    };

    NLUStudioService.isIntentInSolutionMappedtoVATopic = function(solution) {
        var modelName = solution.ml_capability_definition.solution_label + '';
        var gr = NLUModel.getGRByName(modelName);
        var modelId = gr.getUniqueValue();
        return new NLUInterfaceHelper().getMappedIntentsCountInModel(modelId) > 0;
    };

    NLUStudioService.prototype = {
        initialize: function() {},
        type: 'NLUStudioService'
    };
})();
