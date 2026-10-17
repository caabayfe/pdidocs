(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
/**
Params:
	tableName
	sinceTime
*/
    var saOpsWrapper = new SaOperationsWrapper(SNC.SaActionsHandler);
	saOpsWrapper.process(request,response, "wasTableUpdatedSince");

})(request, response);
