// returns array of matching CIs to supplied search text for CI name
function transform(input) {
	var result = {
		errors: [],
		name: '',
		max: parseInt(input.max) || 100,
		matches: 0,
		cis: []
	};
	
	try {
		var name = input.name;
		var workspaceId = input.workspaceId;
		var configIdentifierId = input.configIdentifierId;
		var mapBase = new sn_cmdb_ws.MapBase();
		var mode = input.mode || mapBase.OPERATIONAL_LIFE_CYCLE_STAGE_MODE.VIEW;
		if (!name || !name.length || !name[0]) {
			result.errors.push('name is missing');
		}
		
		if (!workspaceId) {
			result.errors.push('Workspace App Id is missing');
		}

		var TABLE_NAME = {
			OPERATIONAL_CYCLE_UNIFIED_MAP: mapBase.NODE_MAP_TABLE.OPERATIONAL_LIFE_CYCLE_FOR_UNIFIED_MAP,
			CMDB_CI: mapBase.NODE_MAP_TABLE.CMDB_CI
		};
		
		if (!result.errors.length) {
			result.name = name;
			var lifeCycleStageInclusionList;
			var mapService = new sn_cmdb_ws.MapService();
			lifeCycleStageInclusionList = mapService.getLifeCycleStageInclusionList(mode, workspaceId, configIdentifierId);

			var gr = new GlideRecordSecure(TABLE_NAME.CMDB_CI);
			gr.addEncodedQuery('nameSTARTSWITH' + name);
			if(lifeCycleStageInclusionList) {
				gr.addNullQuery(mapBase.COL_LIFE_CYCLE_STAGE).addOrCondition(mapBase.COL_LIFE_CYCLE_STAGE, mapBase.IN_OP, lifeCycleStageInclusionList);
			}
			gr.setLimit(result.max || 30);
			gr.query();
			while(gr.next() && result.matches < result.max) {
				result.matches++;
				result.cis.push({
					id: gr.getUniqueValue(),
					label: gr.getDisplayValue(),
					sublabel: gr.getClassDisplayValue(),
					'class': gr.getRecordClassName()
				});
			}
		}
		
	} catch (error) {
		result.errors.push(error.toString());
	}
	
	return result;
}
