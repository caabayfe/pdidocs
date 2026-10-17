(function process(request, response) {
	var table = request.pathParams.table;
	var sysId = request.pathParams.sysid;

	if (!table || !sysId)
		return new sn_ws_err.BadRequestError("Requires table and sys_id");

	var result= [];
	var grs = new GlideRecordSecure(table);
	if (grs.get(sysId)) {
		var params = request.body.nextEntry();
		var cabsnc = new CAB(grs);
		for (var k in params)
			cabsnc.setValue(k, params[k]);
		if (Object.keys(params).length > 0)
			cabsnc.update();
		result = cabsnc.toJS(true);
	}
	response.setBody(result);
})(request, response);
