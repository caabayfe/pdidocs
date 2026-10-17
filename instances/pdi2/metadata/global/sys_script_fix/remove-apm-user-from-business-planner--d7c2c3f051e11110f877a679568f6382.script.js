var gr = new GlideRecord("sys_user_role_contains");
gr.addQuery("contains", "7722dd809320220028517a75e57ffb9d"); //sn_apm.apm_role
gr.addQuery("sys_id", "b9ec01a03b403300a70fe79c83efc4b4");
gr.query();
//fix script to remove sn_apm.apm_user role from business_planner role, which is been deleted in Quebec release
if(gr.next()) {
	gs.info("Deleting sn_apm.apm_user role from business_role contained roles");
	gr.setWorkflow(false);
	var deletedRole = gr.deleteRecord();
	if(deletedRole)
		gs.info("Deleted sn_apm.apm_user role from business_role contained roles");
	else
		gs.info("Failed to remove sn_apm.apm_user role from business_role contained roles");
	gr.setWorkflow(true);
}
