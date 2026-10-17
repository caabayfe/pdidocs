(function executeRule(current, previous /*null when async*/) {
	if (current.skip_validation === true)
		return true;
	
	if (current.operation() === 'insert'){
		try {
			SNC.CmdbMetadataScriptableApi.validateNewSuggestedRelation(current.base_class, current.dependent_class, current.cmdb_rel_type,  current.child);	
		} catch (ex){
			gs.addErrorMessage(ex.getMessage());
			current.setAbortAction(true);
		}
	} else if (current.operation() === 'update'){
		try {
			SNC.CmdbMetadataScriptableApi.validateSuggestedRelationUpdate(current.sys_id, current.base_class, current.dependent_class, current.cmdb_rel_type, current.child);
		} catch (ex) {
			gs.addErrorMessage(ex.getMessage());
			current.setAbortAction(true);
		}
	}
})(current, previous);
