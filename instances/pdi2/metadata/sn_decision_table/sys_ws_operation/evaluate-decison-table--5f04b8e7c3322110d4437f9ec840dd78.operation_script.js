(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var queryParams = request.queryParams;
    var data = request.body.data;
    var decisionTableId = queryParams.decisionTableId;
    var inputs = data.testInputs;
    var answerElementNames = data.answerElementNames;
    var includeDelta = data.includeDelta;
    var isFirstMatch = data.isFirstMatch;
    var isMultiResultTable = data.isMultiResultTable;

    if (!decisionTableId) {
        throw new sn_ws_err.ServiceError()
            .setStatus(500)
            .setMessage('decisionTableId query parameter is required.');
    }

    var builderApi = new sn_dt.DecisionTableBuilderAPI();
    var resultResponse = builderApi.evaluateDecisionTable(decisionTableId, inputs, includeDelta, isFirstMatch);

    var results = {};
    if (resultResponse) {
        for (var decisionId in resultResponse) {
            if (isMultiResultTable) {
                var resultElements = resultResponse[decisionId].result_elements;
                var resultElementValues = [];
                for (var j = 0; j < answerElementNames.length; j++) {
                    var element = answerElementNames[j];
                    var resultValue = resultElements[element];
                    var resultElementValue = {
                        name: element,
                        value: resultValue == undefined ? '' : resultValue.toString(),
                        displayValue: resultValue == undefined ? '' : resultValue.getDisplayValue()
                    };
                    resultElementValues.push(resultElementValue);
                }
                results[decisionId] = resultElementValues;

            } else {
                var resultRecord = resultResponse[decisionId];
                var result = [{
                    value: resultRecord.getUniqueValue(),
                    displayValue: resultRecord.getDisplayValue()
                }];
                results[decisionId] = result;
            }

        }
    }

    response.setBody(results);
    response.setStatus(200);

})(request, response);
