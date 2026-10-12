if (sysparm_proceed == "true") {
    var gr = new GlideRecord('sys_dm_update');

    if (gr.get(sysparm_sys_id)) {
        var errorMessage = new SNC.DataManagementAPI().hasRightToExecute(gr);
        if (errorMessage != null) {
            gs.addErrorMessage(errorMessage);
            response.sendRedirect("sys_dm_update.do?sys_id=" + sysparm_sys_id);
        } else {
            var worker = new GlideDataManagementProgressWorker(gr);
            worker.setBackground(true);
            worker.start();

            var redirect = "dm_update_status.do?sysparm_pworker_sysid=" + worker.getProgressID();
            redirect += "&sysparm_sys_id=" + sysparm_sys_id;

            response.sendRedirect(redirect);
        }
    } else {
        response.sendRedirect("sys_dm_update_list.do");
    }
} else {
    response.sendRedirect("sys_dm_update_list.do");
}
