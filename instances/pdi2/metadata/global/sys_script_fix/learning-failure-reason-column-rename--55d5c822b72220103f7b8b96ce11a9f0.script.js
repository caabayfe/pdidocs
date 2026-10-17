gs.info("Updating the sa_time_series table - learning_failure_reason column label value.");
runFixScript();
gs.info("Updating the sa_time_series table - Finish");

function runFixScript() {
	if (pm.isZboot()){
		return;
	}

	var gr = new GlideRecord("sys_dictionary");
	if (!gr.isValid()) {
		gs.error("Invalid table: sys_dictionary");
		return;
	}
	gr.addQuery("name", "sa_time_series");
	gr.addQuery("element", "learning_failure_reason");
	gr.query();
	if (gr.next()) {
		gr.setValue("column_label", "Learning Model Info");
		if (!gr.update())
			gs.error("Updating the sa_time_series table - Could not change column learning_failure_reason label");
		else
			gs.info("Updating the sa_time_series table - updated "+gr.getValue('name')+" "+gr.getValue('element')+".");
	}	
}
