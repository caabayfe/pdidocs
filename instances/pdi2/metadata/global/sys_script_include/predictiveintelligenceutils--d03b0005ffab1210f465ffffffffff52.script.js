var PredictiveIntelligenceUtils = Class.create();
PredictiveIntelligenceUtils.prototype = {
    initialize: function() {
        this.ML_SOLUTION_UTIL = "MLSolutionUtil";
        this.SOLUTION_NAME = "solution_name";
        this.SUCCESS = "SUCCESS";
        this.ERROR = "ERROR";
    },

    /**
     * Fetch solution name from capability defintion metadata.
     * returns solutionName
     */
    _getSolutionName: function(capabilityId) {
        var input = input || {};
        var encodedQuery = 'capability=' + capabilityId;
        var conditionString = encodedQuery;
        var orderAttribute = null;
        var orderDirection = null;
        var recordsPerPage = null;
        var offset = null;

        var capabilityDefinitions = sn_one_extend.OneExtendUtil.getCapabilityDefinitions({
            conditionString,
            orderAttribute,
            orderDirection,
            recordsPerPage,
            offset
        });

        var solutionName = "";

        if (capabilityDefinitions.length > 0) {
            var metadata = capabilityDefinitions[0].metadata || "{}";
            var metadataJSON = JSON.parse(metadata);
            solutionName = metadataJSON.id;
        }
        return solutionName;
    },

    /**
     * Remove _meta, feature_invocation_id and topnresult from request payload. 
     * returns cleanedRequest
     */
    _getPredictionInput: function(request) {
        var capabilityId = request._meta.capability || "";
        var capabilityAttributes = sn_one_extend.OneExtendUtil.getCapabilityAttributes(capabilityId) || {};
        var capabilityInputs = capabilityAttributes.inputs || [];

        var result = {};
        for (var i = 0; i < capabilityInputs.length; i++) {
            var item = capabilityInputs[i];
            var attrName = String(item.attributeName);
            if (attrName === "topnresult") continue;
            result[attrName] = request[attrName] !== undefined ? request[attrName] : "";
        }

		// Below logic is needed if
        var replaceSlashesInKeys = function(obj) {
            var newObj = {};
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    newObj[key.replace(/\//g, ".")] = obj[key];
                }
            }
            return newObj;
        };
        return replaceSlashesInKeys(result);
    },

    _getErrorOutput: function(errorMessage) {
        return {
            outputs: {
                status: this.ERROR,
                message: errorMessage || "",
                response: [this._getResponseObject()],
            }
        };
    },

    _getResponseObject: function(predictions) {
        predictions = predictions || {};
        return {
            "predictedValue": predictions.predictedValue || "",
            "predictedSysId": predictions.predictedSysId || "",
            "confidence": predictions.confidence || "",
            "threshold": predictions.threshold || ""
        };
    },

    execute: function(request) {
        var response = {};
        try {
            request = request || {};
            gs.info("PredictiveIntelligenceUtils request: " + JSON.stringify(request));
            var solutionName = this._getSolutionName(request._meta.capability);

            if (gs.nil(solutionName)) {
                return this._getErrorOutput("301: SolutionName is empty");
            }


            // Prediction expected solutionName to be in array format. Below will convert it to array.
			solutionName = solutionName.split(',');

            // Construct topNResult, used as input while doing predictions.
            var topNResult = request["topnresult"];
            var topN = parseInt(topNResult, 10);
            var options = {
                top_n: isNaN(topN) || topN <= 0 ? 1 : topN,
                apply_threshold: true
            };

            var input = [this._getPredictionInput(request)];

            var mlSolution = sn_ml.MLSolutionFactory.getSolution(solutionName);
            var predictions = JSON.parse(mlSolution.predict(input, options) || "{}");
            var key = Object.keys(predictions).length > 0 ? Object.keys(predictions)[0] : null;
            predictions = global.JSUtil.notNil(key) ? predictions[key] : null;

            if (global.JSUtil.notNil(predictions) && !global.JSUtil.isEmpty(predictions)) {
                var outputs = {
                    status: this.SUCCESS,
                    message: "",
                    response: predictions,
                };
                response.outputs = outputs;
                gs.info("PredictiveIntelligenceUtils predicted response: " + JSON.stringify(response));
                return response;
            } else {
                return this._getErrorOutput("400: Results from Prediction were empty. Please try running prediction from Predictive Intelligence UI.");
            }
        } catch (error) {
            gs.info(sn_i18n.Message.getMessage("glide-one-api", "Execution of PredictiveIntelligence capability failed with error: {error}", {
                error: JSON.stringify(error.message)
            }));
            return this._getErrorOutput("404: Prediction Failed with error: " + error.message + ". Please try running prediction from Predictive Intelligence UI.");
        }
    },

    type: 'PredictiveIntelligenceUtils'
};
