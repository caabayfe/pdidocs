(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var data = request.body.data;

    try {
        if ((data.testSet && data.modelList && Array.isArray(data.modelList)) || data.testRun) {
            var definitionId = data.testRun;

            // If definitionId is not provided, then it's a fresh run:
            if (!definitionId) {
                var isOptimize = !!data.isOptimized;

                // Check if there is a definition with same set of inputs:
                var defGr = data.reRun && sn_nlu_workbench.NLUBatchTestDefinition.getRecord(data.testSet, data.modelList, isOptimize);
                definitionId = defGr && defGr.getUniqueValue();
                if (!definitionId) {
                    sn_nlu_workbench.NLUBatchTestDefinition.validateAndGetModelSnapshot(
                        data.modelList, isOptimize);
                    definitionId = sn_nlu_workbench.NLUBatchTestDefinition.addRecord(
                        data.testSet, data.modelList, isOptimize);
                    if (gs.nil(definitionId))
                        throw new Error(gs.getMessage('Failed to create test run definition'));
                }
            }

            var result = sn_nlu_workbench.NLUBatchTestDefinition.runTestInBackground(
                definitionId, data.sync);

            if (result.status === 'success') {
                response.setStatus(200);
            } else {
                response.setStatus(400);
            }
            response.setContentType('application/json');
            return result;
        } else {
            return new sn_ws_err.BadRequestError('Invalid input data provided');
        }
    } catch (e) {
        response.setStatus(400);
        return {
            status: 'failure',
            message: e.message
        };
    }

})(request, response);
