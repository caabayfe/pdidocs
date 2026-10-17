(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    // implement resource here
	var SUCCESS_CODE = 200;
	var variables = request.body.nextEntry();
	var table_name = request.pathParams.table_name;
	var sys_id = request.pathParams.sys_id;
	if (GlideStringUtil.isEligibleSysID(sys_id)) {
		var gr = new GlideRecord(table_name);
		if (!gr.get(sys_id) || !gr.canWrite())
			throw new sn_ws_err.NotFoundError("Either the record is invalid or security constraints prevent access to it!");
		if (!gr.isValidField('variables') || !gr.variables.canWrite())
			throw new sn_ws_err.BadRequestError("Security constraints prevent access to variables!");
		var strict = gs.getProperty('glide.sc.variable.acl.strict.enabled', 'false') == 'true';
		var deniedVariables = [];
		for (var key in variables) {
			if (!variables.hasOwnProperty(key) || typeof gr.variables[key] === 'undefined')
				continue;
			if (gr.variables[key].canWrite())
				gr.variables[key] = variables[key];
			else if (strict)
				deniedVariables.push(key);
		}
		if (deniedVariables.length > 0)
			throw new sn_ws_err.BadRequestError("Security constraints prevent access to variables: " + deniedVariables.join(', '));
		if (gr.update())
			response.setStatus(SUCCESS_CODE);
		else
			throw new sn_ws_err.BadRequestError('Failed to update the record');
	} else
		throw new sn_ws_err.BadRequestError("Invalid Sys Id");
})(request, response);
