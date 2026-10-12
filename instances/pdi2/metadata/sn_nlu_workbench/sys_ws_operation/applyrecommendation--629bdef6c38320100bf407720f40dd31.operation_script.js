(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    try {
        var executionId = request.pathParams.executionId;
        var testExecution = new sn_nlu_workbench.NLUBatchTestExecution(executionId);
        var result = testExecution.applyRecommendation();
        if (result && result.status !== 'failure')
            response.setStatus(200);
        else
            response.setStatus(400);
        response.setContentType('application/json');
        return result;
    } catch (e) {
        return e;
    }

})(request, response);
