showIndexCreator();

function showIndexCreator(){
	if(current.isValidRecord()){
		var mapId = current.getUniqueValue();
    	var validator = new SNC.CoalesceIndexValidator(mapId);
		if(validator.isIndexRequired()){
			g_scratchpad.indexNeeded = "true";
		}
		g_scratchpad.coalesceFieds = validator.getCoalesceFields();
		g_scratchpad.targetTable = validator.getTargetTableName();
		g_scratchpad.mapId = mapId;
	}
}
