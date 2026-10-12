(function executeRule(current, previous /*null when async*/) {

	if(current.operation() == 'update') {
		var gru = GlideScriptRecordUtil.get(current);
		var changedFields = gru.getChangedFieldNames();

		if(changedFields.size() > 1 || (changedFields.size() == 1 && changedFields.get(0) != 'name')) {
			//Changing, deleting or creating a custom start stop condition will cancel the versions for that project
			//UNLESS only the name is changed
			SNC.ProcessOptimization.setDirty(current.entity.project, true);
		}
	} else {
		SNC.ProcessOptimization.setDirty(current.entity.project, true);
	}

})(current, previous);
