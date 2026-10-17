(function executeRule(current, previous /*null when async*/ ) {
	insertOrUpdateDSStatusToInProgress(current.sys_id);
    SNC.PAMLBConversion.enableMLBForAutomatedAndFormulaIndicators([current.sys_id]);
})(current, previous);

function insertOrUpdateDSStatusToInProgress(indicatorSysId) {
	var DS_IN_PROGRESS = "3";
	var gr = new GlideRecord("pa_indicator_data_snapshot_status");
	if(gr.get("indicator", indicatorSysId)) {
		gr.setValue("data_snapshot_status", DS_IN_PROGRESS);
		gr.update();
		return;
	}
	gr.initialize();
	gr.setValue("indicator", indicatorSysId);
	gr.setValue("data_snapshot_status", DS_IN_PROGRESS);
	gr.insert();
}
