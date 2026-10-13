(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var results = [];

	// Validation
	var incidentShortDesc = request.pathParams.shortDescription;
	if (!incidentShortDesc)
		return new sn_ws_err.BadRequestError("Incident short description not provided");

	// Call to MLSolution API
	var mlSolution = sn_ml.MLSolutionFactory.getSolution("ml_sn_global_similar_incidents_mim");

	// Input key-value pairs
	var input = [{"short_description": incidentShortDesc}];

	// Configure optional parameters
	var options = {};
	options.top_n = parseInt(gs.getProperty('sn_major_inc_mgmt.major_incident_management.predict.top_n', '100'));

	var output = JSON.parse(mlSolution.predict(input, options));
	if (Object.keys(output).length == 0)
		return results;
	
	results = output["1"];
	if (results === undefined)
		return [];
	return results;
})(request, response);
