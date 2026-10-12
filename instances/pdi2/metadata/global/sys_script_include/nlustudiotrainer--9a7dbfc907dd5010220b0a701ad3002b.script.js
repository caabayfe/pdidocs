var NLUStudioTrainer = Class.create();

(function() {

    var constants = NLUConstants.constants;
    var ENTITY_TYPES = NLUConstants.ENTITY_TYPES;
    var VOCAB_TYPES = NLUConstants.VOCAB_TYPES;
    var INTENT_ENITITY_RELATIONSHIP = NLUConstants.INTENT_ENITITY_RELATIONSHIP;
    var stateTypes = NLUConstants.MODEL_STATE_TYPES;
    var tables = NLUConstants.tables;
    var sysProps = NLUConstants.SYS_PROPS;

    NLUStudioTrainer.canTrainModel = function(modelId) {
        return !NLUModel.isInCloneOrTranslation(modelId);
    };

    NLUStudioTrainer.trainModel = function(modelId, options) {
        var nluModel, trainJson, output, modelGr;
        var parloIntegrator;
        var result = {};

        try {
            nluModel = new NLUModel(modelId);
            modelGr = nluModel.getGR();
            if (!modelGr) throw new Error(gs.getMessage('Model id does not exist'));

            parloIntegrator = new NLUParloIntegrator(modelGr);

            //populate training mode and supported system entities in CapabilityCache
            parloIntegrator.populateCapabilityCache('allNers {name, isEnabled}, trainModes');

            try {
                // Populate train json:
                trainJson = NLUStudioTrainer.getTrainJson(nluModel, parloIntegrator);
            } catch (e) {
                result.status = 'failure';
                result.message = e.message;
                return result;
            }

            // Invoke service:
            output = parloIntegrator.train(trainJson, options);
            result.status = output.status;
            if (output.status === stateTypes.training) {
                result.trainingVersion = output.response.solutionVersion;
                // Update nlu_model_status table to indicate it is being currently trained
                nluModel.updateStatus({
                    state: stateTypes.training
                });
                result.status = 'success';
            } else if (output.status == 'success') {
                var solution = parloIntegrator.getSolution();
                result.trainedVersion = output.response.solutionVersion;
                var solutionVersion = solution.getVersion(result.trainedVersion);
                var details = JSON.parse(solutionVersion.getProperties());
                // Update nlu_model_status table
                nluModel.updateStatus({
                    state: stateTypes.trained,
                    trained_version: result.trainedVersion,
                    last_trained_on: new GlideDateTime(details.sys_updated_on),
                    dirty: false
                });

            } else if (output.status == 'failure') {
                result.errors = NLUHelper.getErrorsFromResponse(output.response);
            } else if (output.status == 'error') {
                result.status = 'failure';
                result.message = output.response;
            }
        } catch (e) {
            result.status = 'failure';
            result.message = gs.getMessage("The system encountered an unexpected error and couldn't complete your request. Please contact your system administrator for help or try again");
            gs.debug("Exception caught in  NLUStudioTrainer.trainModel: " + e.message);
        }
        return result;
    };

    NLUStudioTrainer.cancelTraining = function(modelId) {
        var result = {};
        try {
            nluModel = new NLUModel(modelId);
            modelGr = nluModel.getGR();
            if (!modelGr)
                throw new Error(gs.getMessage('Model id does not exist'));
            result = new NLUParloIntegrator(modelGr).cancelTraining();
        } catch (e) {
            result.status = 'failure';
            result.message = e.message;
        }
        return result;
    };

    NLUStudioTrainer.getTrainJson = function(nluModel, parloIntegrator) {
        var modelId = nluModel.getGR().getUniqueValue();
        var trainJson = NLUStudioTrainer.getModelDataFromGR(nluModel.getGR(), parloIntegrator);
        trainJson.entities = NLUStudioTrainer.getEntitiesDataFromGR(nluModel.getModelEntities());
        var intents = NLUStudioTrainer.getIntentDataFromGR(nluModel.getIntents(constants.ENABLED_INTENTS_QUERY), trainJson.entities);
        trainJson.intents = intents.intentsArray;
        if ((gs.getProperty(sysProps.SKIP_NO_INTENT, false) == false || gs.getProperty(sysProps.SKIP_NO_INTENT, false) == "false") && NLUSystemUtil.isNLUAdvUtahSupported()) {
            var intentCount = (intents && intents.intentsArray && intents.intentsArray.length) || 0;
            var testUtteranceCount = intentCount > 0 && intents.intentsArray.reduce(function(result, intentData) {
                return result + ((intentData && intentData.testSamples && intentData.testSamples.length) || 0);
            }, 0) || 0;
            trainJson.intents.push(NLUStudioTrainer.getIrrelevantData(modelId, constants.IRRELEVANT_UTTERANCE_LIMIT, Math.round(testUtteranceCount * 0.1)));
        }
        trainJson.vocabulary = NLUStudioTrainer.getVocabularyDataFromGR(nluModel.getVocabulary());
        trainJson.lookupSources = NLUStudioTrainer.getLookupSources(intents.handleNames, modelId);
        trainJson.properties = NLUStudioTrainer.getProperties(parloIntegrator.getSupportedSystemEntities(), nluModel);
        return trainJson;
    };

    NLUStudioTrainer.getProperties = function(supportedSystemEntities, nluModel) {
        var properties = [];
        var disabledSystemEntities = NLUStudioTrainer.getDisabledSystemEnities(supportedSystemEntities, nluModel);
        var ignorePunctuation = nluModel.getGR().getValue("ignore_punctuation");
        if (!gs.nil(ignorePunctuation)) {
            properties.push({
                name: "neuralModelPunctuationCleaning",
                value: ignorePunctuation
            });
        }
        if (disabledSystemEntities.length > 0) {
            properties.push({
                name: "disabledNERTypes",
                value: JSON.stringify(disabledSystemEntities)
            });
        }
        return properties;
    };

    NLUStudioTrainer.getDisabledSystemEnities = function(supportedSystemEntities, nluModel) {
        var activeSystemEntities = nluModel.getSystemEntities();
        var disabledSystemEntities = [];
        var activeSystemEntitiesNames = [];

        activeSystemEntities.forEach(function(entity) {
            activeSystemEntitiesNames.push(entity.name);
        });

        var arrayUtil = new global.ArrayUtil();
        supportedSystemEntities.forEach(function(systemEntity) {
            if (arrayUtil.indexOf(activeSystemEntitiesNames, systemEntity) === -1) {
                disabledSystemEntities.push("GLOBAL." + systemEntity);
            }
        });
        return disabledSystemEntities;
    };

    NLUStudioTrainer.getLookupSources = function(handleNames, modelId) {

        var lookupSources = [];
        var lookupGr = NLULookup.getGR(handleNames);
        while (lookupGr.next()) {
            var solutionName = lookupGr.getValue('solution_name');
            if (lookupGr.getValue('type') === VOCAB_TYPES.lookup) {
                lookupSources.push({
                    name: lookupGr.getValue('name'),
                    solutionName: solutionName
                });
            } else {
                var trainStaticLookup = !solutionName;
                if (!trainStaticLookup) {
                    var lookupUpdatedOn = lookupGr.getValue('sys_updated_on');
                    lookupUpdatedOn = lookupUpdatedOn ? new GlideDateTime(lookupUpdatedOn).getNumericValue() : 0;
                    var lookupTrainedOn = new NLULookup(null, lookupGr).getLastTrainedOn();
                    lookupTrainedOn = lookupTrainedOn ? new GlideDateTime(lookupTrainedOn).getNumericValue() : -1;
                    if (lookupUpdatedOn > lookupTrainedOn) {
                        trainStaticLookup = true;
                    } else {
                        lookupSources.push({
                            name: lookupGr.getValue('name'),
                            solutionName: solutionName
                        });
                    }
                }

                if (trainStaticLookup) {
                    var lookupTrainResult = new NLULookupTrainer(null, lookupGr).trainLookup();
                    if (lookupTrainResult.status === 'failure') {
                        gs.log('NLUStudioTrainer static lookup train error: ' + lookupTrainResult.message);
                        throw new Error(gs.getMessage('Error while synching vocabulary source: {0}. Please check vocabulary source has values.', lookupGr.getValue('name')));
                    }

                    lookupSources.push({
                        name: lookupTrainResult.lookupDetails.handleName,
                        solutionName: lookupTrainResult.lookupDetails.solutionName
                    });
                }
            }
        }

        return lookupSources;
    };

    NLUStudioTrainer.getModelDataFromGR = function(modelGr, parloIntegrator) {
        var modelJson = NLUSystemUtil.getObjectFromGR(modelGr, {
            name: 'name',
            language: 'language',
            confidenceThreshold: 'confidence_threshold',
            modelPurpose: 'category'
        });
        modelJson.schemaVersion = constants.SCHEMA_VERSION;
        modelJson.language = modelJson.language || constants.MODEL_DEFAULT_LANG;
        try {
            modelJson.version = parloIntegrator.getModelVersion();
        } catch (ex) {
            var modelName = modelJson.name;
            var solutionName = NLUParloIntegrator.getModelSolutionName(modelGr.getUniqueValue());
            if (modelName !== solutionName && modelGr.getValue('sys_policy') !== 'read') {
                modelGr.setValue('name', solutionName);
                if (!modelJson.modelPurpose) {
                    modelJson.modelPurpose = constants.MODEL_CAT_VA;
                    modelGr.setValue('category', constants.MODEL_CAT_VA);
                }
                modelGr.update();
                modelJson.name = solutionName;
                parloIntegrator.setModelGr(modelGr);
            }
            modelJson.version = parloIntegrator.getModelVersion(sn_ml.NLUSolutionStore.get(solutionName, {}));
        }
        return modelJson;
    };

    NLUStudioTrainer.getDefaultTestSamples = function(modelId, intent, testLimit) {
        var testSetGr = new GlideRecord('nlu_batch_test_utterance');
        testSetGr.addQuery('test_set.model', modelId);
        testLimit.orderByDesc('sys_updated_on');
        if (intent)
            testSetGr.addEncodedQuery('intentLIKE' + intent);
        else
            testSetGr.addNullQuery('intent');
        if (testLimit) {
            testSetGr.setLimit(testLimit);
        }
        testSetGr.query();

        var testSamples = [];
        while (testSetGr.next()) {
            if (intent) {
                var intents = (testSetGr.getValue('intent') || '').split(',');
                if (intents.indexOf(intent) == -1)
                    continue;
            }
            if (testSetGr.getValue('source') === 'expert_feedback') {
                testSamples.push({
                    utterance: testSetGr.getValue('utterance'),
                    source: "expert-feedback"
                });
            } else {
                testSamples.push({
                    utterance: testSetGr.getValue('utterance')
                });
            }
        }

        return testSamples;
    };

    NLUStudioTrainer.getIntentDataFromGR = function(intentsGr, modelEntities) {
        var intentsArray = [];
        var intentObj, intentId, nluIntent;
        var handleNames = [];
        var entities = [];

        modelEntities.forEach(function(eachModelEntity) {
            entities.push(eachModelEntity.name);
        });

        while (intentsGr.next()) {
            intentId = intentsGr.getValue('sys_id');
            nluIntent = new NLUIntent(intentId);

            var utternace = NLUStudioTrainer.getUtterancesDataFromGR(nluIntent.getUtterances());
            var testSamples = [];
            if (NLUSystemUtil.isNLUAdvUtahSupported()) {
                testSamples = NLUStudioTrainer.getDefaultTestSamples(intentsGr.getValue('model'), intentsGr.getValue('name'));
            }
            handleNames = handleNames.concat(utternace.handleNames);
            intentObj = {
                name: intentsGr.getValue('name'),
                description: intentsGr.getValue('description'),
                samples: utternace.utteranceArray,
                testSamples: testSamples,
                entities: []
            };
            if (intentsGr.getValue('override_confidence_threshold') === '1')
                intentObj.confidenceThreshold = intentsGr.getValue('confidence_threshold');


            // Intent Entities:
            var entitiesGr = nluIntent.getEntities();
            var openEnded = [];
            var allIntentEntities = NLUStudioTrainer.getEntitiesDataFromGR(entitiesGr, intentId, true);
            allIntentEntities.forEach(function(eachEntity) {
                entities.push(eachEntity.name);
                if (eachEntity.type == ENTITY_TYPES.open_ended) openEnded.push(eachEntity);
                else intentObj.entities.push(eachEntity);
                delete eachEntity.type;
            });
            if (openEnded.length > 0) intentObj.templates = openEnded;

            // Important or sufficient entities
            var importantEntities = [];
            var sufficientEntities = [];
            var arrayUtil = new global.ArrayUtil();
            var intentEntitiesGr = nluIntent.getIntentEntities();
            while (intentEntitiesGr.next()) {
                var entityName = intentEntitiesGr.entity.name;
                if (arrayUtil.indexOf(entities, entityName) !== -1) {
                    var relationship = intentEntitiesGr.getValue('relationship');
                    if (relationship === INTENT_ENITITY_RELATIONSHIP.important)
                        importantEntities.push('@entity:' + entityName + '@@');
                    if (relationship === INTENT_ENITITY_RELATIONSHIP.sufficient)
                        sufficientEntities.push('@entity:' + entityName + '@@');
                }

            }
            if (importantEntities.length > 0) intentObj.importantEntities = importantEntities;
            if (sufficientEntities.length > 0) intentObj.sufficientEntities = sufficientEntities;
            
            intentsArray.push(intentObj);
        }

        return {
            handleNames: handleNames,
            intentsArray: intentsArray
        };
    };

    NLUStudioTrainer.getIrrelevantData = function(modelId, trainLimit, testLimit) {
        var noIntentObj = {
            name: "NO_INTENT",
            samples: [],
            testSamples: []
        };
        var statusGr = global.NLUModel.getModelStatusGr(modelId);
        
        var labeledDataGr = new GlideRecord('ml_labeled_data');
        labeledDataGr.addEncodedQuery('label_type=irrelevant^ORlabel_type=irrelevant_to_this_model^product=nlu^source=virtual_agent^ORsource=manual');
        labeledDataGr.orderByDesc('sys_updated_on');
        labeledDataGr.setLimit(trainLimit);
        if (statusGr && statusGr.getValue('last_tuned_on')) {
            labeledDataGr.addQuery('sys_updated_on', '<=', statusGr.getValue('last_tuned_on'));
        }
        labeledDataGr.query();

        while (labeledDataGr.next()) {
            noIntentObj.samples.push({
                utterance: labeledDataGr.getValue('text'),
                source: 'expert-feedback'
            });
        }

        noIntentObj.testSamples = NLUStudioTrainer.getDefaultTestSamples(modelId, null, testLimit);
        
        return noIntentObj;
    };

    NLUStudioTrainer.getUtterancesDataFromGR = function(utterancesGr) {
        var utterance, utteranceArray = [];
        var handleNames = [];
        var updatedUtterance;
        while (utterancesGr.next()) {
            updatedUtterance = NLUStudioTrainer.serializeUtterance(utterancesGr.getValue('utterance'));
            handleNames = handleNames.concat(updatedUtterance.handleNames);
            var utteranceObj = {
                utterance: updatedUtterance.utterance
            };
            var source = utterancesGr.getValue('source');
            if (source && source !== 'manual') utteranceObj.source = "expert-feedback";
            utteranceArray.push(utteranceObj);
        }
        return {
            handleNames: handleNames,
            utteranceArray: utteranceArray
        };
    };

    NLUStudioTrainer.deserialiseUtterance = function(utterance) {
        return utterance.replace(
            /{{(.*?)}}/g,
            function(m) {
                return JSON.parse(m.replace(/\\"/g, '"').slice(1, -1)).phrase;
            });
    };

    NLUStudioTrainer.serializeUtterance = function(utterance) {
        var handleNames = [];
        var updatedUtterance = utterance;
        // replace the annotation with lookupsource
        if (/(^|\s)@([^\s]+)(\s|$)/g.test(utterance)) {
            var utteranceHandleRegex = /(^|\s)@([^\s]+)(\s|$)/g;
            var match;
            while (match = utteranceHandleRegex.exec(utterance)) {
                var handleName = match[2];
                updatedUtterance = updatedUtterance.replace('@' + handleName, '@lookupSources:' + handleName + '@@');
                handleNames.push(handleName);
                utteranceHandleRegex.lastIndex--;
            }
        }
        return {
            utterance: updatedUtterance,
            handleNames: handleNames
        };
    };

    NLUStudioTrainer.getVocabularyDataFromGR = function(vocabGr) {
        var vocabularyArray = [];
        var vocabularyObj, vocabularyId, relatedTerms, type;
        
        while (vocabGr.next()) {
            vocabularyObj = {};

            type = vocabGr.getValue('type');
            if (type === VOCAB_TYPES.pattern) {
                vocabularyObj.pattern = vocabGr.getValue('pattern');
            } else if (type === VOCAB_TYPES.lookup) {
                vocabularyObj.handle = vocabGr.getValue('name');
                vocabularyObj.simpleValues = {
                    values: NLUSystemUtil.getTableFieldValues(vocabGr.getValue('table'),
                        vocabGr.getValue('field_name'))
                };
            } else {
                vocabularyObj.pattern = NLUHelper.wordToRegex(vocabGr.getValue('name'));
            }
            relatedTerms = vocabGr.getValue('related_terms');
            vocabularyObj.relatedTerms = (relatedTerms && relatedTerms.split(',')) || [];
            vocabularyArray.push(vocabularyObj);
        }

        return vocabularyArray;
    };

    NLUStudioTrainer.getEntitiesDataFromGR = function(entityRec, intentId, addType) {
        var nluEntity, entityArray = [];
        var entityObj, entityId, utterances, entityType, entityValues;
        
        while (entityRec.next()) {
            entityId = entityRec.getValue('sys_id');
            entityType = entityRec.getValue('type');
            entityValues = entityRec.getValue('values_list');
            entityObj = {
                name: entityRec.getValue('name')
            };
            if (entityRec.getValue('override_confidence_threshold') === '1')
                entityObj.confidenceThreshold = entityRec.getValue('confidence_threshold');
            if (addType) entityObj['type'] = entityRec.getValue('type');
            
            nluEntity = new NLUEntity(entityId);
            
            utterances = NLUStudioTrainer.getAnnotationsDataFromGR(nluEntity.getAnnotations(intentId, 'utterance.intent.enable=true^ORutterance.intent.enableISEMPTY'));
            if (entityType == ENTITY_TYPES.list) {
                if (entityRec.lookup) {
                    var normalizedField = entityRec.getValue('field_name');
                    var lookupType = entityRec.lookup.getRefRecord().getValue('type');
                    if (lookupType == VOCAB_TYPES.static_lookup) {
                        normalizedField = normalizedField === 'actual' ? 'item_name' : 'keywords';
                    }
                    entityObj.fieldMapping = [{
                        name: '@lookupSources:' + entityRec.lookup.name + '@@',
                        normalizedField: normalizedField
                    }];
                    NLUHelper.extend(entityObj, NLUStudioTrainer.getAnnotations(utterances));
                } else {
                    entityValues = entityValues && entityValues.split(',');
                    entityObj.categories = NLUStudioTrainer.getCategories(entityValues, utterances);
                }
            } else if (entityType == ENTITY_TYPES.pattern) {
                entityObj.samples = [{
                    pattern: entityValues
                }];
            } else if (entityType == ENTITY_TYPES.open_ended) {
                NLUHelper.extend(entityObj, NLUStudioTrainer.getAnnotations(utterances, null, true));
            } else {
                NLUHelper.extend(entityObj, NLUStudioTrainer.getAnnotations(utterances));
                if (entityType == ENTITY_TYPES.system_derived) {
                    var parent = entityRec.getValue('parent') || entityRec.base_entity.name.toString();
                    entityObj.parent = 'entity:GLOBAL.' + parent;
                }
            }
            if (!(typeof entityObj.samples != 'undefined' && entityObj.samples.length == 0)) {
                entityArray.push(entityObj);
            }
        }

        return entityArray;
    };

    NLUStudioTrainer.getAnnotationsDataFromGR = function(utteranceRec) {
        var utteranceArray = [];
        while (utteranceRec.next()) {
            utteranceArray.push(JSON.parse(utteranceRec.getValue('annotation')));
        }
        return utteranceArray;
    };

    NLUStudioTrainer.getCategories = function(entityValues, utterances) {
        var categories = [],
            samples;
        
        if (entityValues && utterances) {
            entityValues.forEach(function(category) {
                var annotations = NLUStudioTrainer.getAnnotations(utterances, category);
                samples = annotations && annotations.samples;
                samples && samples.length > 0 && categories.push({
                    category: category,
                    samples: samples
                });
            });
        }

        return categories;
    };

    NLUStudioTrainer.getAnnotations = function(utterances, cat, isOpenEnded) {

        var samples = [];
        var contentSource = [];
        if (utterances) {
            utterances.forEach(function(annotations) {
                annotations.forEach(function(annotation) {
                    if (cat && cat === annotation.cat || !cat) {
                        var annotatedString = annotation.annotatedString;
                        // replace the annotation with lookupsource
                        if (/(^|\s|")@([^\s]+)(\s|$|")/g.test(annotation.annotatedString)) {
                            var annotationHandleRegex = /(^|\s|")@([^\s]+)(\s|$|")/g;
                            var match;
                            while (match = annotationHandleRegex.exec(annotation.annotatedString)) {
                                var handleName = match[2];
                                var position;

                                //if the annotation occurs as the last word within the phrase, then "}} also becomes part of the capturing group
                                if ((position = handleName.lastIndexOf('"}}')) > -1 && (position + 3 === handleName.length))
                                    handleName = handleName.substring(0, position);

                                annotatedString = annotatedString.replace('@' + handleName, '@lookupSources:' + handleName + '@@');
                                var lookupPhrase = NLUStudioTrainer.getLookupPhrase(annotation.annotatedString);
                                if (lookupPhrase === handleName) contentSource.push('@lookupSources:' + handleName + '@@');
                                annotationHandleRegex.lastIndex--;
                            }
                        }
                        samples.push(isOpenEnded ? {
                            annotation: annotatedString
                        } : {
                            entityAnnotation: annotatedString
                        });
                    }
                });
            });
        }
        
        if (contentSource.length > 0) {
            return {
                contentSource: contentSource,
                samples: samples
            };
        }
        return {
            samples: samples
        };
    };

    NLUStudioTrainer.getLookupPhrase = function(annotatedString) {
        var phraseRegex = /{{phrase="@([^)]+)"}}/g;
        var match = phraseRegex.exec(annotatedString);
        return match && Array.isArray(match) && match.length > 1 && match[1];
    };

    NLUStudioTrainer.prototype = {
        type: 'NLUStudioTrainer',
        initialize: function() {},
    };

})();
