if (sysparm_proceed == "true") {
    var condition = new GlideStringUtil().unEscapeHTML(sysparm_condition);
	var updateFieldValue = new GlideStringUtil().unEscapeHTML(sysparm_set_value);
    var runDt = new GlideDateTime();
    if (!gs.nil(sysparm_run_at))
        runDt.setDisplayValue(sysparm_run_at);

    var gr = new GlideRecord('sys_dm_update');
    if (gr.get(sysparm_sys_id)) {
        gr.setValue('table', sysparm_table); 
        gr.setValue('condition', condition);
        gr.setValue('set_workflow', sysparm_set_workflow);
        gr.setValue('run_at', runDt);
        gr.setValue('set_system_fields', sysparm_set_system_fields);
        gr.setValue('set_value', updateFieldValue);
        gr.update();

        //check ACL
        var errorMessage = new SNC.DataManagementAPI().hasRightToExecute(gr);
        if (errorMessage != null) {
            gs.addErrorMessage(errorMessage);
            response.sendRedirect("sys_dm_update.do?sys_id=" + sysparm_sys_id);
        } else {
            var scheduleJob = new global.DMTSchedulerUtils().scheduleDM(gr, 'sys_dm_update');
        }
    } else {
        response.sendRedirect("sys_dm_update_list.do");
    }
    response.sendRedirect("sys_dm_update_list.do");
}
