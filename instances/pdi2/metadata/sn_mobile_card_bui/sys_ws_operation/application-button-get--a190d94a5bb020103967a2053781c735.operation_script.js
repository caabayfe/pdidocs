(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    // get request params
	var scope = request.queryParams.scope;

	// get buttons in scope
	var output = [];
	var buttonsGR = new GlideRecordSecure('sys_sg_button');
	if(scope) {
		buttonsGR.addQuery('sys_scope', scope);
	}
	buttonsGR.query();
	while(buttonsGR.next()) {
		var object = {
			sysId: buttonsGR.getValue('sys_id'),
			name: buttonsGR.getValue('name'),
			type: buttonsGR.getValue('type'),
			context: buttonsGR.getValue('context'),
			actionItem: buttonsGR.getValue('write_back_action_item'),
			description: buttonsGR.getValue('description'),
			scope: buttonsGR.getValue('sys_scope'),
			table: buttonsGR.getValue('table')
		};
		output.push(object);
	}

	return output;

})(request, response);
