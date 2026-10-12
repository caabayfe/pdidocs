var NLUStudioPredictor = Class.create();

(function() {

    var constants = NLUConstants.constants;

    NLUStudioPredictor.predict = function(modelId, utterance) {
        var nluModel, modelGr, parloIntegrator;
        var result = {};

        try {
            nluModel = new NLUModel(modelId);
            modelGr = nluModel.getGR();
            if (!modelGr) throw new Error(gs.getMessage('Model id does not exist'));

            var intentProp = gs.getProperty('com.glide.cs.intent_confidence_threshold', '0.40');
            var entityProp = gs.getProperty('com.glide.cs.entity_confidence_threshold', '0.40');
            var ctOverride = {
                'all-intents': intentProp,
                'all-entities': entityProp
            };

            parloIntegrator = new NLUParloIntegrator(modelGr);
            var publishedVersion = parloIntegrator.getActiveSolutionVersion();
            if (publishedVersion)
                return JSON.parse(parloIntegrator.predict(utterance, ctOverride, publishedVersion));
            else {
                result.status = 'failure';
                result.message = gs.getMessage('Unable to retrieve published version for the given model');
            }

        } catch (e) {
            result.status = 'failure';
            result.message = e.message || constants.PREDICTION_SERVER_UNAVAILABLE;
        }
        return result;
    };

    NLUStudioPredictor.testUtterance = function(modelId, utterance) {
        var nluModel, modelGr, parloIntegrator, confidenceThreshold,
            statusGr, options, output,
            trainedVersion, publishedVersion;
        var result = {},
            currDate;

        try {
            nluModel = new NLUModel(modelId);
            modelGr = nluModel.getGR();
            if (!modelGr) throw new Error(gs.getMessage('Model id does not exist'));

            parloIntegrator = new NLUParloIntegrator(modelGr);
            confidenceThreshold = modelGr.getValue('confidence_threshold');

            statusGr = nluModel.getStatus();
            trainedVersion = statusGr.getValue('trained_version') ? parseInt(statusGr.getValue('trained_version')) : 0;
            publishedVersion = statusGr.getValue('published_version') ? parseInt(statusGr.getValue('published_version')) : 0;

            if (trainedVersion > 0 && utterance) {
                var ctOverride = {
                    all: 0.01
                };
                if (publishedVersion > 0) {

                    output = JSON.parse(parloIntegrator.predict(
                        utterance, ctOverride, publishedVersion));
                    confidenceThreshold = parloIntegrator.getConfidenceThreshold(publishedVersion) ||
                        confidenceThreshold || 0.6;
                    result.published = {
                        intents: NLUStudioPredictor.getResultFromTest(output.response.intents, nluModel),
                        confidenceThreshold: confidenceThreshold
                    };
                }
                if (trainedVersion > publishedVersion) {

                    output = JSON.parse(parloIntegrator.predict(
                        utterance, ctOverride, trainedVersion));
                    confidenceThreshold = parloIntegrator.getConfidenceThreshold(trainedVersion) ||
                        confidenceThreshold || 0.6;
                    result.trained = {
                        intents: NLUStudioPredictor.getResultFromTest(output.response.intents, nluModel),
                        confidenceThreshold: confidenceThreshold
                    };
                }

                if (output.status == 'failure') {
                    throw new Error();
                }
                result.status = output.status;
                if (output.response) result.message = output.response;
            } else {
                result.status = 'failure';
                result.message = gs.getMessage('Invalid input data');
            }
        } catch (e) {
            result.status = 'failure';
            result.message = e.message || constants.PREDICTION_SERVER_UNAVAILABLE;
        }
        return result;
    };

    NLUStudioPredictor.canAddEntity = function(modelEntities, enabledEntities, entityName) {
        if ((modelEntities.indexOf(entityName) !== -1) || enabledEntities.some(function(ent) {
            return ent.name === entityName;
        })) {
            return true;
        }
        return false;
    };

    NLUStudioPredictor.getResultFromTest = function(intents, nluModel) {
        var top3Intents = [];
        var intent, name, namePath, intentsFilter = '';
        if (intents) {
            var modelEntitiesGr = nluModel.getEntities(); //returns gr
            var modelEntities = [];
            while (modelEntitiesGr.next()) {
                modelEntities.push(modelEntitiesGr.getValue('name'));
            }
            var enabledSystemEntities = nluModel.getSystemEntities(); //array of sys entity objects with props { name, id, createdon }
            for (var i = 0, l = intents.length; i < l && i < 3; i++) {
                intent = intents[i];
                var entities = [];

                intent.entities.forEach(function(entity) {
                    namePath = entity.name;
                    if (parseFloat(entity.score) > 0.4) {
                        namePath = namePath.split(':')[1];
                        namePath = namePath.split('.');
                        name = namePath[namePath.length - 1];
                        var addEntity = NLUStudioPredictor.canAddEntity(modelEntities, enabledSystemEntities, name);
                        if (addEntity) {
                            entities.push({
                                name: name,
                                score: entity.score,
                                value: (entity.normalization && entity.normalization.value) || entity.value
                            });
                        }
                    }
                });

                intentsFilter += (intentsFilter ? '^ORname=' : 'name=') + intent.intentName;
                top3Intents.push({
                    name: intent.intentName,
                    score: intent.score,
                    entities: entities
                });
            }
        }
        var intentsNameIdMap = {};
        if (intentsFilter) {
            var intentsGr = nluModel.getIntents(intentsFilter);
            while (intentsGr.next()) {
                intentsNameIdMap[intentsGr.getValue('name')] = intentsGr.getUniqueValue();
            }
        }

        return top3Intents.map(function(eachIntent) {
            eachIntent.id = intentsNameIdMap[eachIntent.name];
            return eachIntent;
        });
    };

    NLUStudioPredictor.prototype = {
        initialize: function() {},
        type: 'NLUStudioPredictor'
    };

})();
