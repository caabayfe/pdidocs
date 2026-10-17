gs.print("Dropping generation_request_data column from sn_atf_tg_generated_test table");
gs.dropColumn("sn_atf_tg_generated_test", "generation_request_data");
var gr = new GlideRecord("sys_dictionary");
gr.addQuery("name", "sn_atf_tg_sn_boq");
gr.addQuery("element", "job_logs");
gr.query();
if (gr.next()) {
	if (gr.getValue("display") === "1"){
		gs.info("Setting display of job logs as false");
		gr.setValue("display", false);
    gr.setWorkflow(false);
		gr.update();
	}
}

gr = new GlideRecord("sys_dictionary");
gr.addQuery("name", "sn_atf_tg_sn_boq");
gr.addQuery("element", "sys_id");
gr.query();
if (gr.next()) {
	if (gr.getValue("display") === "0"){
		gs.info("Setting display of sys id as true");
		gr.setValue("display", true);
    gr.setWorkflow(false);
		gr.update();
	}
}
