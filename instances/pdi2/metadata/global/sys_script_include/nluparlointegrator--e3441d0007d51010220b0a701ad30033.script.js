var NLUParloIntegrator = Class.create();

(function() {
    var nluService = sn_ml.MLServiceUtil;
    var constants = NLUConstants.constants;
    var workflowConstants = WorkflowSolutionUtils.constants;
    var tables = NLUConstants.tables;
    var stateTypes = NLUConstants.MODEL_STATE_TYPES;
    var sysProps = NLUConstants.SYS_PROPS;

    function getSupportedFeaturesByLanguageAndVersion(language, version, queryFilter) {
        var queryCondition = 'supportedFeaturesByLanguageAndVersion(language: ' + language + ',version:\"' + version + '\")';
        var res = NLUParloIntegrator.getCapability('query { NLU { ' + queryCondition + ' { ' + queryFilter + ' } } }');
        if (res.state == 'success' && res.data) {
            return res.data.NLU.supportedFeaturesByLanguageAndVersion;
        }
    }

    NLUParloIntegrator.getModelSolutionName = function(modelLabel) {
        //Create a solution with dummy authoring model and add it to the solution store to get the solution name
        var authoringModel = {
            'dummyKey': 'dummyValue'
        };
        var solution = new sn_ml.NLUSolution({
            'label': modelLabel,
            "schedulingInfo": {
                "useCase": "Train NLU Solution"
            }
        }, authoringModel);
        var solutionName = sn_ml.NLUSolutionStore.add(solution);
        return solutionName;
    };
    NLUParloIntegrator.getSolution = function(modelName) {
        try {
            var labelOptions = modelName.match(/^ml_.*/) === null ? {
                useLabel: true
            } : {};
            return sn_ml.NLUSolutionStore.get(modelName, labelOptions);
        } catch (ex) {
            gs.error('Failed to get info for ' + modelName);
        }
        return null;
    };
    NLUParloIntegrator.getSolutionVersions = function(solution) {
        //Building solution version info
        var solutionVersionInfoArray = [];
        try {
            var solutionVersionDetails = JSON.parse(solution.getSolutionVersionDetails());
            if (solutionVersionDetails && solutionVersionDetails.status === 'success')
                solutionVersionInfoArray = solutionVersionDetails.response.versions;
        } catch (e) {
            gs.debug('NLU model getSolutionVersions error : ' + e.message);
        }
        gs.debug('NLU Model Versions information : ' + JSON.stringify(solutionVersionInfoArray));
        return solutionVersionInfoArray;
    };
    NLUParloIntegrator.getLastTrainedVersion = function(solution) {
        var solDefGr = NLUParloIntegrator.getSolutionDefinition(solution);
        try {
            if (solDefGr) {
                var solutionVersionNum = parseInt(solDefGr.getValue('current_solution_version') || 0);
                return solutionVersionNum > 0 && solution.getVersion(solutionVersionNum);
            }
        } catch (ex) {
            gs.debug("Exception fetching solution version: ", ex);
        }
        return null;
    };
    NLUParloIntegrator.getSolutionDefinition = function(solution) {
        var solutionName = solution.getName();
        var gr = new GlideRecord(tables.ML_CAPABILITY_DEFINITION_BASE);
        gr.addQuery('solution_name', solutionName);
        gr.setLimit(1);
        gr.query();
        return gr.next() && gr;
    };
    NLUParloIntegrator.getDefinitionUpdatedOn = function(solution) {
        var solDefGr = NLUParloIntegrator.getSolutionDefinition(solution);
        return solDefGr && solDefGr.getValue('sys_updated_on');
    };
    NLUParloIntegrator.getStatusFromSolution = function(solution) {
        var result = {
            state: 'draft'
        };
        var pCreatedOn = 0,
            tCreatedOn = 0,
            iCreatedOn = 0,
            createdOn, details;
        var mlSolutionUpdatedOn = null;
        var mlSolutionCreatedOn = null;
        var tVersion = 0,
            pVersion = 0,
            iVersion = 0;
        try {
            var lastVersionObj = NLUParloIntegrator.getLastTrainedVersion(solution);
            var lastVersion = lastVersionObj ? parseInt(lastVersionObj.getVersionNumber()) : 0;
            var modelVersions = NLUParloIntegrator.getSolutionVersions(solution);
            var len = modelVersions.length;
            for (var i = len - 1; i >= 0; i--) {
                details = modelVersions[i];
                var version = parseInt(details.version);
                // Ignore all the versions after current_version of capability definition:
                if (version > lastVersion) continue;
                createdOn = new GlideDateTime(details.sys_created_on).getNumericValue();
                if (details.active == 'true' && createdOn > pCreatedOn) {
                    pCreatedOn = createdOn;
                    pVersion = version;
                    result.lastPublishedBy = NLUSystemUtil.getUserName(details.sys_updated_by);
                    result.lastPublishedOn = details.sys_updated_on;
                }
                if (createdOn > tCreatedOn) {
                    if (details.state === constants.SOLUTION_COMPLETE) {
                        tCreatedOn = createdOn;
                        tVersion = version;
                        mlSolutionUpdatedOn = details.sys_updated_on;
                        mlSolutionCreatedOn = details.sys_created_on;
                    } else if (details.hasJobEnded === 'false') {
                        iCreatedOn = createdOn;
                        iVersion = version;
                    }
                }
            }
            result.trainedVersion = tVersion;
            result.publishedVersion = pVersion;
            result.trainingVersion = iVersion;
            if (tCreatedOn)
                result.lastTrainedOn = mlSolutionUpdatedOn;
            if (iCreatedOn > tCreatedOn) {
                result.state = stateTypes.training;
            } else if (tCreatedOn > pCreatedOn) {
                result.state = stateTypes.trained;
            } else if (tCreatedOn && pCreatedOn && tCreatedOn === pCreatedOn) {
                result.state = stateTypes.published;
                // When last trained version is published, we can't use ml_solutions.updated_on for trainedOn value.
                // - If latest ml_solution is successful, then use updated_on of corresponding ml_capability_definition record.
                // - Else use the ml_solution.created_on
                if (result.trainedVersion === lastVersion) {
                    result.lastTrainedOn = NLUParloIntegrator.getDefinitionUpdatedOn(solution);
                } else {
                    result.lastTrainedOn = mlSolutionCreatedOn;
                }
            }
            result.status = 'success';
            gs.debug('NLU Model Status : ' + JSON.stringify(result));
        } catch (e) {
            result.status = 'failure';
            gs.debug('NLU Model getModelStatus error : ' + e.message);
        }
        return result;
    };
    NLUParloIntegrator.prototype = {
        type: 'NLUParloIntegrator',
        initialize: function(modelGr) {
            this.setModelGr(modelGr);
        },
        setModelGr: function(modelGr) {
            this.modelGr = modelGr;
            // If the model name does not start with 'ml_', it is a Pre-Quebec model
            this.labelOptions = modelGr.getValue('name').match(/^ml_.*/) === null ? labelOptions = {
                useLabel: true
            } : {};
        },
        _getPayload: function(options) {
            var payload = [{
                solutionName: this.modelGr.getValue('name'),
                solutionDomain: this.modelGr.getValue('sys_domain'),
                solutionScope: this.modelGr.getValue('sys_scope')
            }];
            if (options) {
                var domain = NLUSystemUtil.getCurrentDomain();
                if (domain) options['solutionDomain'] = domain;
                NLUHelper.extend(payload[0], options);
            }
            return JSON.stringify(payload);
        },
        getSolution: function() {
            var modelName = this.modelGr.getValue('name');
            return sn_ml.NLUSolutionStore.get(modelName, this.labelOptions);
        },
        getLatestVersion: function() {
            var solution = this.getSolution();
            var latestVersion = solution.getLatestVersion();
            if (latestVersion) return parseInt(latestVersion.getVersionNumber());
            return 0;
        },
        getModelVersion: function(solution) {
            if (!solution) solution = this.getSolution();
            var output = JSON.parse(solution.getModelVersion(NLUModel.getLanguage(this.modelGr), {
                "request_purpose": this.modelGr.getValue('category')
            }));
            return output.response.version;
        },
        getModelStatus: function() {
            try {
                var solution = this.getSolution();
                return NLUParloIntegrator.getStatusFromSolution(solution);
            } catch (e) {
                return {
                    status: 'failure',
                    message: e.message
                };
            }
        },
        train: function(trainData, options) {
            var trainDataStr = JSON.stringify(trainData);
            gs.debug('NLU Model JSON : ' + trainDataStr);
            var output = {};
            try {
                var modelName = this.modelGr.getValue('name');
                var isL3Model = this.isAsync();
                var intentCount = trainData.intents && trainData.intents.length || 0;
                var maxIntentsCount = parseInt(gs.getProperty(sysProps.MAX_INTENTS_FOR_SYNC_TRAIN, 0));
                var utteranceCount = intentCount > 0 && trainData.intents.reduce(function(result, intentData) {
                    return result + (intentData && intentData.samples && intentData.samples.length || 0);
                }, 0) || 0;
                var maxUtteranceCount = parseInt(gs.getProperty(sysProps.MAX_UTTERANCES_FOR_SYNC_TRAIN, 0));
                var isAsync = utteranceCount > maxUtteranceCount || intentCount > maxIntentsCount || isL3Model;
                var workflowAsyncCapability = isAsync && this.isWorkflowAsyncSupportedForVersion(trainData.version);
                var trainingOptions = {
                    "trainingMode": isAsync ? "async" : "sync"
                };
                var solutionInfo = {
                    "label": modelName,
                    "trainingMode": isAsync ? "async" : "sync",
                    "description": workflowConstants.WORKFLOW_NLU_USECASE_NAME,
                    "workflowAsyncCapability": workflowAsyncCapability,
                    "schedulingInfo": {
                        "useCase": workflowConstants.WORKFLOW_NLU_USECASE_NAME
                    },
                    "tags": [
                        "Train NLU Solution"
                    ],
                    "workflowConfiguration": {
                        "trainingFrequency": "run_once"
                    },
                    "trainingPipeline": {
                        "pipelineInput": {
                            "datasets": {
                                // DON'T REMOVE : Required by WorkflowSolution Configuration Validation
                            },
                            "config": {
                                "authoring_model": trainData
                            },
                            "solutions": {
                                // DON'T REMOVE : filed dynamically by NLUSolution
                            }
                        },
                        "pipelineName": "nlu_training_workflow_v1"
                    }
                };
                solutionInfo.nluTrainingMode = "";
                if (!isAsync || isL3Model)
                    solutionInfo.nluTrainingMode = "IntentClassifier";
                var ultDataSet = this.getUtteranceLabelDataSet(modelName);
                if (ultDataSet) {
                    solutionInfo.trainingPipeline.pipelineInput.datasets["utterance_label_table"] = ultDataSet;
                    solutionInfo.trainingPipeline.pipelineInput.config["use_utterance_label_table"] = gs.getProperty(sysProps.USE_ML_LABELED_TABLE) || "false";
                }
                var solutionOpts = this.labelOptions;
                if (options && typeof options === 'object') {
                    solutionOpts = NLUHelper.extend(solutionOpts, options);
                }
                var updatedSolution = new sn_ml.NLUSolution(solutionInfo, JSON.parse(trainDataStr));
                sn_ml.NLUSolutionStore.update(modelName, updatedSolution, solutionOpts);
                if (options && typeof options === 'object') {
                    trainingOptions = NLUHelper.extend(trainingOptions, options);
                }
                var solutionVersion = updatedSolution.submitTrainingJob(trainingOptions);
                var solutionStatus = JSON.parse(solutionVersion.getStatus());
                if (solutionStatus.hasJobEnded === 'false')
                    output.status = 'training';
                else {
                    output.status = solutionStatus.state === constants.SOLUTION_COMPLETE ? 'success' : 'failure';
                }
                output.response = {
                    solutionVersion: solutionVersion.getVersionNumber()
                };
            } catch (e) {
                var errorMessage = e.message;
                if (errorMessage) {
                    var position = errorMessage.indexOf(constants.SYNCHRONOUS_TRAINING_FAILURE);
                    if (position === -1) {
                        position = errorMessage.indexOf(constants.VALIDATION_FAILURE);
                        if (position !== -1)
                            position = position + constants.VALIDATION_FAILURE.length;
                    } else {
                        position = position + constants.SYNCHRONOUS_TRAINING_FAILURE.length;
                    }
                    // Extract the error message for unknown words
                    if (position !== -1)
                        output = JSON.parse(errorMessage.substring(position));
                    else
                        throw e;
                } else {
                    output = gs.getMessage('Unable to train model at this point of time. Please try again later');
                }
            }
            gs.debug('NLU Model Train response : ' + JSON.stringify(output));
            return output;
        },
        cancelTraining: function() {
            var result = {};
            try {
                var nluSolution = this.getSolution();
                nluSolution.cancelTrainingJob();
                result.status = 'success';
            } catch (e) {
                gs.debug('NLU Model cancelTraining error' + e.message);
                result.status = 'failure';
                result.message = e.message;
            }
            return result;
        },
        validate: function(modelInfo) {
            var modelInfoStr = JSON.stringify(modelInfo);
            gs.debug('NLU Model Info : ' + modelInfoStr);
            var authoringModel = {};
            var solutionInfo = {
                "label": this.modelGr.getValue('name'),
                "schedulingInfo": {
                    "useCase": "Train NLU Solution"
                }
            };
            var solution = new sn_ml.NLUSolution(solutionInfo, authoringModel);
            var output = solution.validate(JSON.parse(modelInfoStr));
            gs.debug('NLU Model Validate response : ' + output);
            return JSON.parse(output);
        },
        predict: function(utterance, ctOverride, solutionVersion) {
            var inputJson = {
                utterance: utterance
            };
            var currDate = (new Date()).toJSON();
            var options = {
                confidenceThresholdOverride: ctOverride,
                clientRequestTime: currDate.split('T')[0]
            };
            var solution = this.getSolution();
            var nluSolutionVersion = solution.getVersion(solutionVersion);
            var results = nluSolutionVersion.predict(JSON.parse(JSON.stringify(inputJson)), options);
            gs.debug('NLU Model predict response : ' + results);
            return results;
        },
        getConfidenceThreshold: function(solutionVersion) {
            try {
                var solution = this.getSolution();
                var nluSolutionVersion = solution.getVersion(solutionVersion);
                var solutionVersionProperties = JSON.parse(nluSolutionVersion.getProperties());
                return solutionVersionProperties.authoringModel.confidenceThreshold;
            } catch (e) {
                gs.debug('NLU Model getConfidenceThreshold error : ' + e.message);
            }
            return 0;
        },
        publish: function(trainedVersion) {
            //Activating the specified version
            var solution = this.getSolution();
            solution.setActiveVersion(trainedVersion);
            var solutionVersion = solution.getVersion(trainedVersion);
            var solutionProperties = JSON.parse(solutionVersion.getProperties());
            var output = {
                'status': solutionProperties.isActive === 'true' ? 'success' : 'failure',
                'response': {
                    'solutionVersion': trainedVersion
                }
            };
            gs.debug('NLU Model Publish response : ' + JSON.stringify(output));
            return output;
        },
        getActiveSolutionVersion: function() {
            var solutionVersion;
            try {
                var solution = this.getSolution();
                var nluSolutionVersion = solution.getActiveVersion();
                solutionVersion = nluSolutionVersion.getVersionNumber();
            } catch (e) {
                gs.debug('NLU model getActiveSolutionVersion error: ' + e.message);
                solutionVersion = null;
            }
            return solutionVersion;
        },
        // Capability Cache:
        populateCapabilityCache: function(queryFilter) {
            var language = NLUModel.getLanguage(this.modelGr);
            var version = this.getModelVersion(this.getSolution());
            var data = getSupportedFeaturesByLanguageAndVersion(language, version, queryFilter);
            if (data) {
                this.capabilityCache = NLUHelper.extend({}, data);
            }
        },
        isAsync: function() {
            if (!this.capabilityCache || !this.capabilityCache.trainModes)
                this.populateCapabilityCache('trainModes');
            var trainModes = this.capabilityCache.trainModes;
            return trainModes &&
                Array.isArray(trainModes) &&
                trainModes.indexOf('async') > -1 &&
                trainModes.indexOf('sync') === -1;
        },
        isWorkflowAsyncSupportedForVersion: function(version) {
            try {
                if (!this.capabilityCache || !this.capabilityCache.releaseFeatures)
                    this.populateCapabilityCache('releaseFeatures { name, isSupported, nonSupportedVersions }');
                for (var i = 0; i < this.capabilityCache.releaseFeatures.length; i++) {
                    var feat = this.capabilityCache.releaseFeatures[i];
                    if ((feat.name || '').toLowerCase() === 'workflow_async' && feat.isSupported === true) {
                        return feat.nonSupportedVersions.indexOf(version) === -1;
                    }
                }
            } catch (e) {
                gs.error('Error while fetching async capabilities');
            }
            return false;
        },
        getSupportedSystemEntities: function() {
            var supportedNERs = [];
            if (!this.capabilityCache || !this.capabilityCache.allNers)
                this.populateCapabilityCache('allNers {name, isEnabled}');
            this.capabilityCache.allNers.forEach(function(ner) {
                if (ner.isEnabled) {
                    supportedNERs.push(ner.name);
                }
            });
            return supportedNERs;
        },
        getTrainedIntentNames: function(transformer) {
            var intentNames = [];
            try {
                var solVersion = NLUParloIntegrator.getLastTrainedVersion(this.getSolution());
                var propsJson = JSON.parse(solVersion.getProperties());
                propsJson.authoringModel.intents.forEach(function(intentData) {
                    intentNames.push(
                        transformer ? transformer(intentData.name) : intentData.name
                    );
                });
            } catch (ex) {
                gs.error('Failed to get trained intents for model: ' + this.modelGr.getUniqueValue());
            }
            return intentNames;
        },
        getUtteranceLabelDataSet: function(modelName) {
            var utteranceLabelData = null;
            var intentIds = this.getIntentIdsFromModelName(modelName);
            var encodedQuery = 'usage=nlu_model_train^product=nlu^label_typeINpositive,irrelevant,irrelevant_to_this_model^label_referenceIN' + intentIds.join(',');
            var ultGr = new GlideRecord(tables.ML_LABELED_DATA);
            ultGr.addEncodedQuery(encodedQuery);
            ultGr.query();
            if (ultGr.getRowCount() > 0) {
                utteranceLabelData = new sn_ml.DatasetDefinition({
                    'tableName': tables.ML_LABELED_DATA,
                    'fieldNames': ['text', 'label', 'label_type', 'correct_label', 'recommendation', 'source', 'product', 'usage', 'frequency', 'sys_domain'],
                    'encodedQuery': encodedQuery
                });
            }
            return utteranceLabelData;
        },
        getIntentIdsFromModelName: function(modelName) {
            var intentIds = [];
            var intentGr = new GlideRecord(tables.SYS_NLU_INTENT);
            intentGr.addEncodedQuery('enableISEMPTY^ORenable=true');
            intentGr.addQuery('model.name', modelName);
            intentGr.query();
            while (intentGr.next()) {
                intentIds.push(intentGr.getUniqueValue());
            }
            return intentIds;
        },
    };
    NLUParloIntegrator.getCapability = function(query) {
        var result = {};
        try {
            result = nluService.fetchGraphQL(query);
            if (result) {
                result = JSON.parse(result);
                result.state = 'success';
            } else {
                result.state = 'failure';
            }
        } catch (e) {
            result.state = 'failure';
            gs.debug('Error fetching capability: ' + e.message);
        }
        return result;
    };
    NLUParloIntegrator.getSupportedLanguages = function() {
        var res = this.getCapability("query { NLU { supportedLanguages { name, language, releaseFeatures { name, isSupported, nonSupportedVersions }, hasSupportForSearch, tokenType, intents { entities { isEnabled, supportsVocabSources } }, allNers {name, isEnabled}, trainModes } } }");
        var supportedLanguages = [];
        if (res.state == 'success' && res.data) {
            res.data.NLU.supportedLanguages.forEach(function(language) {
                var systemEntities = [];
                language.allNers.forEach(function(ner) {
                    if (ner.isEnabled) {
                        var translatedLabel = gs.getMessageLang('nlu_entity_' + ner.name, language.language);
                        systemEntities.push({
                            name: ner.name,
                            label: translatedLabel === 'nlu_entity_' + ner.name ? ner.name : translatedLabel
                        });
                    }
                });
                var ignorePunctuation = undefined;
                (language.releaseFeatures || []).forEach(function(feat) {
                    if (feat.name === "neural_model_punctuation_cleaning") {
                        ignorePunctuation = feat.isSupported;
                    }
                });

                var languageObject = {
                    label: gs.getMessage(language.name),
                    value: language.language,
                    intentOnly: !language.intents.entities.isEnabled,
                    supportsVocabSources: language.intents.entities.supportsVocabSources,
                    hasSupportForSearch: language.hasSupportForSearch,
                    tokenType: language.tokenType,
                    trainModes: language.trainModes,
                    systemEntities: systemEntities,
                    ignorePunctuation: ignorePunctuation
                };

                (languageObject.value.equals("en")) ? supportedLanguages.unshift(languageObject): supportedLanguages.push(languageObject);
            });
        }
        return supportedLanguages;
    };
    NLUParloIntegrator.getSupportedLanguageCodesByCategory = function(category) {
        if (category !== constants.MODEL_CAT_SEARCH) return NLUParloIntegrator.getSupportedLanguageCodes();
        var supportedLanguages = [];
        var result = NLUParloIntegrator.getSupportedLanguages();
        result.forEach(function(language) {
            if (language.hasSupportForSearch) supportedLanguages.push(language.value);
        });
        return supportedLanguages;
    };
    NLUParloIntegrator.getSupportedLanguageCodes = function() {
        var res = this.getCapability("query { NLU { supportedLanguages { language } } }");
        var supportedLanguages = [];
        if (res.state == 'success' && res.data) {
            res.data.NLU.supportedLanguages.forEach(function(language) {
                supportedLanguages.push(language.language);
            });
        }
        return supportedLanguages;
    };

    NLUParloIntegrator.isEntitiesEnabled = function(language, version) {
        var queryFilter = 'intents { entities { isEnabled } }';
        var data = getSupportedFeaturesByLanguageAndVersion(language, version, queryFilter);
        if (data) {
            return data.intents.entities.isEnabled;
        }
        return false
    };

    NLUParloIntegrator.getSupportedSystemEntities = function(language, version) {
        var supportedNERs = [];
        var queryFilter = 'allNers {name, isEnabled}';
        var data = getSupportedFeaturesByLanguageAndVersion(language, version, queryFilter);
        if (data) {
            data.allNers.forEach(function(ner) {
                if (ner.isEnabled) {
                    supportedNERs.push(ner.name);
                }
            });
        }
        return supportedNERs;
    };

    NLUParloIntegrator.getPunctuationAndThresholdCapabilities = function(language, version) {
        var queryFilter = 'name, modelThreshold, releaseFeatures { name, isSupported, nonSupportedVersions }';
        var data = getSupportedFeaturesByLanguageAndVersion(language, version, queryFilter);
        var capabilities = {};
        if (data) {
            capabilities["modelThreshold"] = data.modelThreshold;
            var releaseFeatures = data.releaseFeatures;
            (releaseFeatures || []).forEach(function(feat) {
                if (feat.name === 'neural_model_punctuation_cleaning') {
                    capabilities["isIgnoreEnabled"] = feat.isSupported;
                }
            });
        }
        return capabilities;
    };
})();
