(function executeRule(current, previous /*null when async*/) {

	var gru = GlideScriptRecordUtil.get(current);
	var changedFields = gru.getChangedFieldNames();
	
	if(changedFields.size() === 1 && changedFields.get(0).equals("last_discovered")){
		//take no action, just a discovery ping
		return;
	} else {
		//check if definition of retired is among the total change list
		var retireDef = sn_cmdb.CMDBRetirementScriptableApi.getRetirementDefinitionForClass(current.sys_class_name);
		if(gs.nil(retireDef))
			return;
		var defParams = JSON.parse(retireDef);
		var shouldCascadeCheck = true;
		for(var key in defParams){
			//Each field of retirement def should be in the changed list AND
			//each field value should match the retirement def
			if(!changedFields.contains(key) || !current.getValue(key).equals(defParams[key])){ 
				shouldCascadeCheck = false;
				break;
			}
		}
		if(shouldCascadeCheck){
			var dependentCIHelper = new DependentCIHelper();
			dependentCIHelper.checkAndAddToEOLLedger(current.sys_id, current.sys_class_name, true);
		}
	}

})(current, previous);
