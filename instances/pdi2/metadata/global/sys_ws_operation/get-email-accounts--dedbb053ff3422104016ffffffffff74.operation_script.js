(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var result = {
		maxWorkers: 2,
		results: []
	};
    var gr = new GlideRecord("sys_email_account");
	gr.addEncodedQuery('account_type!=forward_address');
	gr.setLimit(2000);
	gr.query();
	while(gr.next()) {
		result.results.push({
			name: gr.getValue("name"),
			type: gr.getValue("type"),
			active: gr.active ? "Active" : "Inactive",
			sysId: gr.getUniqueValue()
		});
	}

response.setBody(result);
})(request, response);
