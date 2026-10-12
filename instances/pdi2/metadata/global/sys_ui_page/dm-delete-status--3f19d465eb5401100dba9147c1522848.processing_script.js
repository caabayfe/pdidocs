// if we are here, we have hit the cancel button
var gr = new GlideRecord('sys_dm_delete');

if (gr.get(dm_sysid)) {
    var pworker = new GlideDataManagementProgressWorker(gr);
    pworker.cancel();

    var pm = new GlideProgressMonitor(pworker_sysid);
    //wait for 15 seconds
    pm.waitForCompletionOrTimeout(15);

    var redirect = "dm_delete_status.do?sysparm_pworker_sysid=" + pworker_sysid;
    redirect += "&sysparm_sys_id=" + sysparm_sys_id;

    response.sendRedirect(redirect);
} else {
    response.sendRedirect("sys_dm_delete_list.do");
}
