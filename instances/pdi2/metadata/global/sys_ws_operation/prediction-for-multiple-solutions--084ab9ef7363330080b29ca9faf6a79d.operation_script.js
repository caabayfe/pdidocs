(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var solutionNames = [];
	var solutionNamesParam = getQueryParam(request, "solution_names");
	if (JSUtil.notNil(solutionNamesParam)) {
		solutionNames = solutionNamesParam.split(',');
	}

	var options = {};
	var optionsParam = getQueryParam(request, "options");
	if (JSUtil.notNil(optionsParam)) {
		options = JSON.parse(optionsParam);
	}

	var input = getPredictionInput(request);

	var result = {};
	var eps = new GlideScriptedExtensionPoint().getExtensions("MLSolutionUtil");
	if (eps.length > 0){
		var point = eps[0];
		result = point.getPredictions(input, solutionNames, options);
	}
	return result;

})(request, response);

function getQueryParam(request, param_name) {
	if (request.queryParams[param_name])
		return request.queryParams[param_name][0];
	else
		return null;
}

function getPredictionInput(request) {
	var predictionInput = {};
	var inputMaps = getQueryParam(request, "input_maps");
	var inputTable = getQueryParam(request, "input_table");
	var inputFilter = getQueryParam(request, "input_filter");

	if (JSUtil.notNil(inputMaps)) {
		predictionInput = JSON.parse(inputMaps);
	} else if (JSUtil.notNil(inputTable) && JSUtil.notNil(inputFilter)) {
		var gr = new GlideRecord(inputTable);
		gr.addEncodedQuery(inputFilter);
		gr.query();
		predictionInput = gr;
	}
	return predictionInput;
}
