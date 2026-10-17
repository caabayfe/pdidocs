// if the timeout existing record query steps is not set,
// set timeout to 5 seconds
var recordQueryStep = new GlideRecord("sys_atf_step");
recordQueryStep.addQuery("step_config", "0270b8005f30220012b44adb7f46666a");
recordQueryStep.addNullQuery("timeout");
recordQueryStep.query();
while (recordQueryStep.next()) {
	recordQueryStep.setValue("timeout", "0 00:00:05");
	recordQueryStep.update();
}
gs.info("Updated " + recordQueryStep.getRowCount() + " existing record query record(s)");
