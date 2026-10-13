gs.log("**Start altering table=sys_dictionary columns=name,element");
runFixScript();
gs.log("Finish");

function runFixScript() {
	if (pm.isZboot())
		return;

	var gr = new GlideRecord("sys_dictionary");
	if (!gr.isValid()) {
		gs.error("Invalid table: sys_dictionary");
		return;
	}

	gr.addQuery("name", "sys_metric");
	gr.addQuery("element", "IN", "name,element");

	gr.query();
	while (gr.next()) {
		gr.setValue("read_only", "false");
		if (!gr.update())
			gs.error("Could not update table: sys_metric");
		gs.log("**updated "+gr.getValue('name')+" "+gr.getValue('element')+"  **");

	}	

}
