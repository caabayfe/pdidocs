var SimilarOpenPRBsScriptingGenerator = Class.create();
SimilarOpenPRBsScriptingGenerator.prototype = Object.extendsObject(sn_nb_action.ScriptingGeneratorHandlerBase, {
    category: 'ra_scripting_generator', // DO NOT REMOVE THIS LINE!

    getId: function() {
        return "sn_sow_inc.SimilarOpenPRBsScriptingGenerator";
    },

    getOutputSchema: function() {
        var schema = [{
            'name': 'predictedRecord',
            'label': 'Predicted Record',
            'type': 'reference',
            'referenceTable': 'problem'
        }];
        return {
            'status': 'success',
            'schema': schema,
        };
    },

    getOutputs: function(param) {
        try {
            var nonMLRecommendationsHelper = new NonMLRecommendationsHelper();
            var similarOpenPRBsSysIds = nonMLRecommendationsHelper.getSimilarOpenPRBsWithFilters(param.contextRecord);
            var response = {
                'status': 'success',
                'outputs': []
            };
            similarOpenPRBsSysIds.forEach(function(similarOpenPRBSysId) {
                response.outputs.push({
                    predictedRecord: similarOpenPRBSysId
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

    type: 'SimilarOpenPRBsScriptingGenerator'
});
