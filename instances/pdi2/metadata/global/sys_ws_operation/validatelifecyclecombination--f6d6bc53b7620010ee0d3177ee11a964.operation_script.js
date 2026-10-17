(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    response.setContentType('application/json');
	var util = new LifeCycleUtil();
	var table = util.getParamAsString('table');
	var stage = util.getParamAsString('life_cycle_stage');
	var status = util.getParamAsString('life_cycle_stage_status');
	
	if (!table || !stage || !status) {
		return new sn_ws_err.BadRequestError('Missing Parameters');
	}
	
	var tables = util.getParents(table);
	tables.push(table);
	var gr = new GlideRecord('life_cycle_control');
	gr.addEncodedQuery('table.nameIN' + tables.join() + '^life_cycle_stage=' + stage + '^life_cycle_stage_status=' + status);
	gr.query();
	var result = {'is_valid': gr.hasNext()};
	
	response.setStatus(200);
	response.setBody(result);

})(request, response);
