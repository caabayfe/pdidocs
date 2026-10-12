var SimilarOpenIncidentsScriptingGenerator = Class.create();
SimilarOpenIncidentsScriptingGenerator.prototype = Object.extendsObject(sn_nb_action.ScriptingGeneratorHandlerBase, {
    category: 'ra_scripting_generator', // DO NOT REMOVE THIS LINE!

    getId: function() {
        return "sn_sow_inc.SimilarOpenIncidentsScriptingGenerator";
    },

    getOutputSchema: function() {
        var schema = [{
            'name': 'predictedRecord',
            'label': 'Predicted Record',
            'type': 'reference',
            'referenceTable': 'incident'
        }];
        return {
            'status': 'success',
            'schema': schema,
        };
    },

    getOutputs: function(param) {
        try {
            var nonMLRecommendationsHelper = new sn_sow_inc.NonMLRecommendationsHelper();
            var similarOpenIncidentsSysIds = nonMLRecommendationsHelper.getSimilarOpenIncidentsWithFilters(param.contextRecord);
            var response = {
                'status': 'success',
                outputs: []
            };
            similarOpenIncidentsSysIds.forEach(function(similarOpenIncidentSysId) {
                response.outputs.push({
                    predictedRecord: similarOpenIncidentSysId
                });
            });
            return response;
        } catch (e) {
            return {
                'status': 'error',
                'errorCode': 40001,
                'errorMessage': 'Failed to get Non-ML recommendations for Similar Open Problem records' // this will be logged
            };
        }
    },
    type: 'SimilarOpenIncidentsScriptingGenerator'
});
