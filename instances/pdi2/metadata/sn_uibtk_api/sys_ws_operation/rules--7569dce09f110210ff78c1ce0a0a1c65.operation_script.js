var { RuleFetcher } = require('@devsnc/uibtk-api');

(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var ids = request.queryParams.ids; // array
	var rf = new RuleFetcher();
	var rules = rf.getAsKeyedObject(ids);
	response.setBody({ rules });

})(request, response);
