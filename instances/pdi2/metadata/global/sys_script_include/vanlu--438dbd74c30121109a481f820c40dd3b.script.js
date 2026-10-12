var VaNLU = Class.create();
(function() {
    VaNLU.validate = function(modelId) {
		var nluModel = new NLUModel(modelId);
		var trainJson = NLUStudioTrainer.getTrainJson(nluModel);
		var modelName = nluModel.getModelDisplayName();
        var jsonToValidate = {
            "testModel": {
                "name": modelName,
                "intents": trainJson.intents
            }
        };
        var authoringModel = {};
        var solutionInfo = {
            "label": "test_validation_correction"
        };
        var solution = new sn_ml.NLUSolution(solutionInfo, authoringModel);
        var options = {
            "nluValidateMode": "Full"
        };
        var validationResult = solution.validate(jsonToValidate, options);
		return JSON.parse(validationResult);
    };

    VaNLU.prototype = {
        initialize: function() {},

        type: 'VaNLU'
    };
})();
