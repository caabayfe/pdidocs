(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    response.setContentType('application/json');
    var helper = new CMDBDataManagerHelper();
    var result = {};
	result.related_entry_tables = helper.getRelatedEntryTables();
    response.setStatus(200);
    response.setBody(result);

})(request, response);
