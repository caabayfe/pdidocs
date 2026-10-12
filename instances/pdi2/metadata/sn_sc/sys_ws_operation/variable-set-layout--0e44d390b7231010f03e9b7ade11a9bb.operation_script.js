(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var variableSetIds = request.body.data.variableSetIds || [];
	var output = {};
	variableSetIds.forEach(function(setId) {
		var set = new sn_sc.CatalogItemVariableSet(setId);
		var layout = set.getLayout(true);
		var map = {"onlyMeta" : "true"};
		var variables = set.getFlatQuestions(map);
		output[setId] = {
			layout: layout,
			variables: variables
		};
	});
	return output;
})(request, response);
