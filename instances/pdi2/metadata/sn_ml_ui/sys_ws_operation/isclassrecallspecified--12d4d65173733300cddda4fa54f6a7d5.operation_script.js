(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    //This queries the solution record and checks whether the class-recall has been sepcified pre training
    var solution_id = decodeURI(request.pathParams.solution_id);
	return new sn_ml_ui.MLApplyClassificationTargetValues().isClassRecallSpecified(solution_id);


})(request, response);
