var NLUInterfaceHelper = Class.create();
var tables = NLUConstants.tables;

(function() {

    NLUInterfaceHelper.getModelIntentsData = function() {
        var models = null;
        var igr = new GlideRecord(tables.SYS_NLU_INTENT);
        igr.query();
        while (igr.next()) {
            if (!models) models = {};
            if (!models[igr.model.name]) models[igr.model.name] = [];
            models[igr.model.name].push(igr.getValue('name'));
        }
        return models;
    };

    NLUInterfaceHelper.prototype = {

        initialize: function() {
            var epoints = new global.GlideScriptedExtensionPoint();
            this.eps = epoints.getExtensions("NLUInterface");
        },

        getAllMappedIntentsCount: function() {
            var result = {};
            var modelData = NLUInterfaceHelper.getModelIntentsData();
            if (this.eps.length > 0) {
                for (var i = 0; i < this.eps.length; i++) {
                    try {
                        var eachResult = this.eps[i].getAllMappedIntentsCount(modelData);
                        if (eachResult) {
                            Object.keys(eachResult).forEach(function(eachModel) {
                                if (result[eachModel]) {
                                    result[eachModel] += parseInt(eachResult[eachModel]);
                                } else {
                                    result[eachModel] = parseInt(eachResult[eachModel]);
                                }
                            });
                        }
                    } catch (e) {
                        gs.error('Failed to get mapped intents from the implementer: ' + e.message);
                    }
                }
            }
            return result;
        },

        getMappedIntents: function(modelId, intentIds) {
            var gr = new GlideRecord(tables.SYS_NLU_MODEL);
            if (gr.get(modelId)) {
                var modelName = gr.getValue('name');

                var intentNames;
                if (!NLUHelper.isEmpty(intentIds)) {
                    intentNames = [];

                    var intentGr = new GlideRecord(tables.SYS_NLU_INTENT);
                    intentGr.addQuery('model', modelId);
                    intentGr.addQuery('sys_id', intentIds);
                    intentGr.query();

                    while (intentGr.next()) {
                        intentNames.push(intentGr.getValue('name'));
                    }
                }
                var parlo = new NLUParloIntegrator(gr);
                var trainedIntentNames = parlo.getTrainedIntentNames();
                return this.getMappedIntentsFromName(modelName, intentNames, trainedIntentNames);
            }
            return [];
        },

        getMappedIntentsFromName: function(modelName, intentNames, trainedIntentNames) {
            var result = [];
            if (this.eps.length > 0) {
                for (var i = 0; i < this.eps.length; i++) {
                    if (this.eps[i]) {
                        var eachResult = this.eps[i].getMappedIntents(modelName, intentNames);
                        if (eachResult) {
                            Object.keys(eachResult.mappings).forEach(function(intentName) {
                                eachResult.mappings[intentName].forEach(function(mapping) {
                                    mapping.isIntentTrained = trainedIntentNames.indexOf(intentName) > -1;
                                });
                            });
                            result.push(eachResult);
                        }
                    }
                }
            }
            return result;
        },

        getMappedIntentsCountInModel: function(modelId) {
            return Object.keys(this.getMappedIntents(modelId)[0].mappings).length;
        },

        type: 'NLUInterfaceHelper'
    };
})();
