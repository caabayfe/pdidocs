(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	//Updates the solution based on user targets
    try {
        var solutionId = decodeURI(request.pathParams.solution_id);
        var queryParams = request.queryParams;
        var targetMetricName = String(queryParams.target_metric_name);
        var targetMetricValue = String(queryParams.target_metric_value);
        var applyclassificationTargetValue = new sn_ml_ui.MLApplyClassificationTargetValues();
		
		applyclassificationTargetValue.validateInputs(targetMetricName, targetMetricValue);
        applyclassificationTargetValue.applyClassificationTargetValues(solutionId, targetMetricName, targetMetricValue);
    } catch (error) {
		gs.info(gs.getMessage('Solution Update Failed : {0}',error));
        return sn_ws_err.BadRequestError(error);
    }

})(request, response);
