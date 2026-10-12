var SimilarResolvedInicdentsScriptingGenerator = Class.create();
SimilarResolvedInicdentsScriptingGenerator.prototype = Object.extendsObject(sn_nb_action.ScriptingGeneratorHandlerBase, {
    category: 'ra_scripting_generator', // DO NOT REMOVE THIS LINE!

    getId: function() {
        return "sn_sow_inc.SimilarResolvedInicdentsScriptingGenerator";
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
            var nonMLRecommendationsHelper = new NonMLRecommendationsHelper();
            var similarResolvedIncidentsSysIds = nonMLRecommendationsHelper.getSimilarResolvedIncidentsWithFilters(param.contextRecord);
            var response = {
                'status': 'success',
                outputs: []
            };
            similarResolvedIncidentsSysIds.forEach(function(similarResolvedIncidentSysId) {
                response.outputs.push({
                    predictedRecord: similarResolvedIncidentSysId
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
    type: 'SimilarResolvedInicdentsScriptingGenerator'
});
