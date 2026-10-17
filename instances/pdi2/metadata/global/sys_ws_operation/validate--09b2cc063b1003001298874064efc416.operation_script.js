(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var gr = new GlideRecord('cmdb_identifier');
	var obj = new IdentificationRuleValidator();
	var msg = '';
	
	if (gr.get(request.pathParams.sys_id)) {
		msg = obj.validate(gr);
	}
	
	return msg;

})(request, response);
