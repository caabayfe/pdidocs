// if the timeout on existing Click Modal Button steps is not set or is 0,
// set timeout to 5 seconds. Steps with a timeout of 0 have a null value
// in the database
var clickModalStep = new GlideRecord("sys_atf_step");
clickModalStep.addQuery("step_config", "22aed143dfe0220062fe6c7a4df2639d");
clickModalStep.addNullQuery("timeout");
clickModalStep.setValue("timeout", "0 00:00:05");
clickModalStep.updateMultiple();

gs.info("Updated " + clickModalStep.getRowCount() + " existing Click Modal Button step record(s)");
