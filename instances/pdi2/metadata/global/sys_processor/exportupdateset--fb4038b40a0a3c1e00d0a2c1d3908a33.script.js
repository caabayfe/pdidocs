(function process(g_request, g_response, g_processor) {
    var sysid = g_request.getParameter('sysparm_sys_id');
    var remoteUpdateGR = new GlideRecord('sys_remote_update_set');
    if (!remoteUpdateGR.get(sysid)) {
        gs.addErrorMessage(gs.getMessage('Update Set is invalid'));
        return;
    }
    if (!gs.hasRole('update_set_admin') && !sn_app_api.AppStoreAPI.canPublishToUpdateSet(remoteUpdateGR.application)) {
        gs.addErrorMessage(gs.getMessage('You do not have permission to perform this operation'));
        g_response.setStatus(403);
        return;
    }
    var exporter = new ExportWithRelatedLists('sys_remote_update_set', sysid);
    exporter.addRelatedList('sys_update_xml', 'remote_update_set');
    exporter.exportRecords(g_response);

    var isRemote = g_request.getParameter('sysparm_is_remote');
    var analytics = new sn_update_set.UpdateSetAnalytics();
    analytics.sendExportAnalytic(sysid, false, isRemote);

    var del = g_request.getParameter('sysparm_delete_when_done');
    if (del == "true" && remoteUpdateGR.canDelete())
        remoteUpdateGR.deleteRecord();
})(g_request, g_response, g_processor);
