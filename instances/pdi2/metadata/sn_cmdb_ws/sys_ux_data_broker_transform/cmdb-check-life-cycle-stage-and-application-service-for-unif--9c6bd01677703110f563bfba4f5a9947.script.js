function transform(input) {
	var result = {
		errors: [],
		isValidLifeCycleStage : false,
		isAnApplicationService: false
	};
	try {
	
		if(!input || !input.record || !input.workspaceId) {
			return result;
		}
		var workspaceId = input.workspaceId;
		var configIdentifierId = input.configIdentifierId;
		var lifeCycleStageInclusionList;
		var mapBase = new sn_cmdb_ws.MapBase();
		var mapService = new sn_cmdb_ws.MapService();
		var serviceMapUtility = new sn_cmdb_ws.ServiceMapUtility();

		result.isAnApplicationService = serviceMapUtility.isAnApplicationService(input.table);
		lifeCycleStageInclusionList = mapService.getLifeCycleStageInclusionList(
			mapBase.OPERATIONAL_LIFE_CYCLE_STAGE_MODE.VIEW,
			workspaceId,
			configIdentifierId
		);
		var gr = new GlideRecord(mapBase.NODE_MAP_TABLE.CMDB_CI);
		gr.query(mapBase.COL_SYS_ID, input.record);
		if(lifeCycleStageInclusionList) {
			gr.addNullQuery(mapBase.COL_LIFE_CYCLE_STAGE).addOrCondition(mapBase.COL_LIFE_CYCLE_STAGE, mapBase.IN_OP, lifeCycleStageInclusionList);
		}
		gr.setLimit(1);
		gr.query();
		if(gr.hasNext()) {
			result.isValidLifeCycleStage = true;
		}
	} catch (error) {
		result.errors.push(error.toString());
	}
	return result;
}
