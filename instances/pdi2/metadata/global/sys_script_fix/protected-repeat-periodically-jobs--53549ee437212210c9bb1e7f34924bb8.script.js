gs.info("Script started to set advance to true for all existing protected sysauto and sys_trigger records with periodically run type. Non-null starting fields of sysauto will be copied over to sys_trigger.");
updateAutos();
updateTriggers();
gs.info("Update complete for all protected Periodically sysauto records.");
// for existing protected sysauto records that are periodically jobs with starting set, mark advanced=true
function updateAutos() {
	var autoGr = new GlideRecord("sysauto");
	autoGr.addQuery("run_type", "periodically");
	autoGr.addNotNullQuery("run_start");
	autoGr.addNotNullQuery("sys_policy");
	autoGr.setWorkflow(false);
	autoGr.setValue("advanced", true);
	autoGr.updateMultiple();
}

function updateTriggers() {

	var autoGr = new GlideRecord("sysauto");
	autoGr.addQuery("run_type", "periodically");
	autoGr.addNotNullQuery("run_start");
	autoGr.addNotNullQuery("sys_policy");
	autoGr.query();
	gs.info("Number of protected sysauto records to be updated: " +autoGr.getRowCount());
	autoGr.setWorkflow(false);
	while(autoGr.next()){
		var triggerGr = new GlideRecord("sys_trigger");
		triggerGr.addQuery("document_key", autoGr.getUniqueValue());

		triggerGr.setValue("advanced", true);
		triggerGr.setValue("run_start", autoGr.getValue("run_start"));
		triggerGr.setWorkflow(false);
		triggerGr.updateMultiple();
	}
};
