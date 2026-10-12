(function executeRule(current, previous /*null when async*/ ) {

    var processDefId = current.getValue("process_def");
    var sysId = current.getUniqueValue();
    var category = current.getValue("category");
	//Validate user has write access on process def
    if (!current.process_def.getRefRecord().canWrite()) {
        current.setAbortAction(true);
        gs.setRedirect(current);
        gs.addErrorMessage(gs.getMessage("You are not allowed to create/update this record as it belongs to Content pack"));
    }

    //validate that record is not duplicate
    var duplicateKpiRecord = new global.ProminProcessConfigUtil().getDuplicateKPICategory(processDefId, sysId, category);
    if (!gs.nil(duplicateKpiRecord)) {
        var link = '<a href="' + duplicateKpiRecord + '" target="_blank">Click here</a>';
        var error = gs.getMessage("Only one Category KPI mapping record is allowed per process configuration. {0} to view existing KPI category record", [link]);
        gs.addErrorMessage(error);
        current.setAbortAction(true);
    }


})(current, previous);
