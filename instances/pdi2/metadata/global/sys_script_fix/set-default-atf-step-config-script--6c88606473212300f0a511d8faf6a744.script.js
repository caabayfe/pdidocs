var gr = new GlideRecord("sys_dictionary");
gr.addQuery("name", "sys_atf_step_config");
gr.addQuery("element", "step_execution_generator");
gr.query();
if (gr.next()) {
	gr.setValue("default_value" , "javascript:new ATFVariablesUtil().getDefaultStepConfigScript();");
	gr.update();
	gs.info("Successfully updated default step execution script field on sys_atf_step_config");
} else
	gs.info("Dictionary record for step_execution_generator on sys_atf_step_config not found; default value not updated");
