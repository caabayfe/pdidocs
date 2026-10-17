(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	response.setContentType('application/json');
	var util = new LifeCycleUtil();
	var table = util.getParamAsString('table');
	var stage = util.getParamAsString('life_cycle_stage');
	var result = {};
	result.life_cycle_stage = [];
	var mapObj = {};
	var pushedStatus = {};
	
	var gr = new GlideRecord('life_cycle_control');
	if (table) {
		var tables = util.getParents(table);
		tables.push(table);
		gr.addEncodedQuery('table.nameIN' + tables.join());
	}
	if (stage) {
		gr.addQuery('life_cycle_stage', stage);
	}
	gr.query();
	while (gr.next()) {
		if (!mapObj[gr.life_cycle_stage.sys_id]) {
			mapObj[gr.life_cycle_stage.sys_id] = {};
			mapObj[gr.life_cycle_stage.sys_id].label = gr.getValue('life_cycle_stage');
			mapObj[gr.life_cycle_stage.sys_id].sys_id = gr.life_cycle_stage.sys_id;
		}
		
		var stageObj = mapObj[gr.life_cycle_stage.sys_id];
		
		if (!stageObj.life_cycle_stage_status) {
			stageObj.life_cycle_stage_status = [];
		}
		if (!pushedStatus[gr.life_cycle_stage.sys_id]) {
			pushedStatus[gr.life_cycle_stage.sys_id] = [];
		}
		if (pushedStatus[gr.life_cycle_stage.sys_id].indexOf(gr.life_cycle_stage_status.sys_id.toString()) < 0) {
			stageObj.life_cycle_stage_status.push({
				label: gr.getValue('life_cycle_stage_status'),
				sys_id: gr.life_cycle_stage_status.sys_id
			});
			pushedStatus[gr.life_cycle_stage.sys_id].push(gr.life_cycle_stage_status.sys_id.toString());
		}
		
	}
	
	var keys = Object.keys(mapObj);
	for (var i = 0; i < keys.length; i++) {
		result.life_cycle_stage.push(mapObj[keys[i]]);
	}
	
	response.setStatus(200);
	response.setBody(result);

})(request, response);
