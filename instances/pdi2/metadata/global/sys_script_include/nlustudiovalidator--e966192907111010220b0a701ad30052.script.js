var NLUStudioValidator = Class.create();

(function() {

    var constants = NLUConstants.constants;
    var sysProps = NLUConstants.SYS_PROPS;

    NLUStudioValidator.validateRecord = function(data) {
        var modelObj, modelGr, parloIntegrator,
            output, modelInfo = {},
            result = {};

        try {
            if (data.type === 'model') {
                modelInfo[data.name] = {
                    name: data.name
                };
            } else if (data.modelId) {
                modelGr = NLUModel.getGRById(data.modelId);
                if (!modelGr) throw new Error(gs.getMessage('Model id does not exist'));

                parloIntegrator = new NLUParloIntegrator(modelGr);
                modelObj = NLUStudioTrainer.getModelDataFromGR(modelGr, parloIntegrator);

                modelInfo[modelObj.name] = modelObj;
                if (data.type === 'intent') {
                    modelInfo[modelObj.name].intents = [{
                        name: data.name
                    }];
                } else if (data.type === 'entity') {
                    var entityObj = {
                        name: data.name,
                    };
                    if (data.pattern) {
                        entityObj.samples = [{
                            pattern: data.pattern
                        }];
                    }
                    modelInfo[modelObj.name].entities = [entityObj];
                } else if (data.type == 'vocabulary') {
                    var vocabObj = {
                        relatedTerms: data.relatedTerms
                    };
                    if (data.pattern) {
                        vocabObj.pattern = data.pattern;
                    }
                    modelInfo[modelObj.name].vocabulary = [vocabObj];
                }
            }

            output = parloIntegrator.validate(modelInfo);
            result.status = output.status;
            if (output.status === 'failure' && output.hasOwnProperty('exception')) {
                throw new Error();
            }
            if (output.status === 'failure') {
                result.errors = NLUHelper.getErrorsFromResponse(output.response);
            }
        } catch (e) {
            result.status = 'failure';
            result.errors = [{
                message: constants.PREDICTION_SERVER_UNAVAILABLE
            }];
        }
        return result;
    };

    NLUStudioValidator.validate = function(modelId, intentId, utterance, entityId) {
        var nluModel, modelName, modelGr, parloIntegrator,
            intentGr, intentObj, output, modelInfo = {};
        var result = {},
            entityGr, entityObj, intent;

        try {

            nluModel = new NLUModel(modelId);
            modelGr = nluModel.getGR();
            if (!modelGr) throw new Error(gs.getMessage('Model id does not exist'));

            modelName = modelGr.getValue('name');
            parloIntegrator = new NLUParloIntegrator(modelGr);

            if (intentId) {
                modelInfo[modelName] = NLUStudioTrainer.getModelDataFromGR(modelGr, parloIntegrator);
                modelInfo[modelName].vocabulary = NLUStudioTrainer.getVocabularyDataFromGR(nluModel.getVocabulary());

                intentGr = NLUIntent.getGRById(intentId);
                if (!intentGr) throw new Error(gs.getMessage('Intent id does not exist'));

                intent = {
                    name: intentGr.getValue('name'),
                };
                if (entityId) {
                    entityGr = NLUEntity.getGRById(entityId);
                    if (!entityGr) throw new Error(gs.getMessage('Entity id does not exist'));

                    intent.entities = [{
                        name: entityGr.getValue('name'),
                        samples: [{
                            entityAnnotation: utterance
                        }]
                    }];
                } else if (utterance) {
                    var updatedUtterance = NLUStudioTrainer.serializeUtterance(utterance);
                    intent.samples = [{
                        utterance: updatedUtterance.utterance
                    }];
                    if (updatedUtterance.handleNames.length > 0) {
                        modelInfo[modelName].lookupSources = NLUStudioTrainer.getLookupSources(updatedUtterance.handleNames, modelGr.getUniqueValue());
                    }
                } else {
                    var utteranceData = NLUStudioTrainer.getUtterancesDataFromGR(
                        (new NLUIntent(intentId)).getUtterances());
                    if (utteranceData) intent.samples = utteranceData.utteranceArray;
                }

                modelInfo[modelName].intents = [intent];
            } else {
                modelInfo[modelName] = NLUStudioTrainer.getTrainJson(nluModel, parloIntegrator);
            }
            output = parloIntegrator.validate(modelInfo);
            result.status = output.status;

            if (output.status === 'failure' && output.hasOwnProperty('exception')) {
                throw new Error();
            }
            result.suggestions = NLUStudioValidator.getSuggestionsFromResponse(output.response);
            if (output.status === 'failure') {
                result.errors = NLUHelper.getErrorsFromResponse(output.response);
            }
        } catch (e) {
            result.status = 'failure';
            result.errors = [{
                message: constants.PREDICTION_SERVER_UNAVAILABLE
            }];
        }
        return result;
    };

    NLUStudioValidator.getSuggestionsFromResponse = function(response) {
        var suggestions = [];
        var hardwareEnabled = gs.getProperty(sysProps.PREBUILT_VOCAB_HARDWARE);
        hardwareEnabled = hardwareEnabled != 'disabled';
        var softwareEnabled = gs.getProperty(sysProps.PREBUILT_VOCAB_SOFTWARE);
        softwareEnabled = softwareEnabled != 'disabled';

        var messages = response.messages;
        Array.isArray(messages) && messages.forEach(function(record) {
            if (record && record.type === 'INFO' && record.sample && record.suggestions) {
                var lookupSources = record.suggestions.corrections && record.suggestions.corrections.lookupSources;
                if (lookupSources) {
                    lookupSources.forEach(function(suggestion) {
                        var utterance = suggestion.utterance.replace(
                            constants.UTTERANCE_REGEX,
                            function(m) {
                                var json = JSON.parse(m.replace(/\\"/g, '"').slice(1, -1));
                                var sources = json.lookupSources;
                                var replace = m;
                                if (sources && Array.isArray(sources)) {
                                    sources.forEach(function(each) {
                                        if (each.name.indexOf('@lookupSources:hardware.') === 0) {
                                            if (!hardwareEnabled) replace = json.phrase;
                                        } else if (each.name.indexOf('@lookupSources:software.') === 0) {
                                            if (!softwareEnabled) replace = json.phrase;
                                        }
                                    });
                                }
                                return replace;
                            }
                        );
                        var pos = utterance.search(constants.UTTERANCE_REGEX);
                        if (pos > -1) {
                            suggestions.push({
                                utterance: utterance
                            });
                        }
                    });
                }
            }
        });
        return suggestions;
    };

    NLUStudioValidator.prototype = {
        type: 'NLUStudioValidator',
        initialize: function() {}
    };

})();
