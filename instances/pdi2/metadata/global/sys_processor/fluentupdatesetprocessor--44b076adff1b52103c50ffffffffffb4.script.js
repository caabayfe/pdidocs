(function process(g_request, g_response, g_processor) {
    var sysid = g_request.getParameter('sysparm_sys_id');
    var scopeId = g_request.getParameter('sysparm_app_sys_id');
    if (!gs.hasRole('sdk_support_admin') && !sn_app_api.AppStoreAPI.canPublishToUpdateSet(scopeId)) {
        gs.error('fluent export: You do not have permission to perform this operation');
        g_response.setStatus(403);
        g_processor.writeOutput('application/json', new global.JSON().encode({
            result: 'You do not have permission to perform this operation. Please check if user requires a granular role access.'
        }));
        return;
    }

    var updateGR = new GlideRecord('sys_update_set');
    updateGR.addQuery('application', scopeId);
    if (!updateGR.get(sysid)) {
        gs.error('fluent export: Invalid Update Set');
        g_response.setStatus(400);
        g_processor.writeOutput('application/json', new global.JSON().encode({
            result: 'Invalid Update Set'
        }));
        return;
    }

    if (JSUtil.notNil(updateGR.base_update_set) && updateGR.base_update_set != updateGR.sys_id) {
        gs.error('fluent export: Provided Update Set is part of a batch, please provide sys_id of Update Set Batch base');
        g_response.setStatus(400);
        g_processor.writeOutput('application/json', new global.JSON().encode({
            result: 'Provided Update Set is part of a batch, please provide sys_id of Update Set Batch base'
        }));
        return;
    }


    var isBatchedUpdateSet = JSUtil.notNil(updateGR.base_update_set);

    var updateSetExport = new UpdateSetExport();
    var remoteSysid = isBatchedUpdateSet ? updateSetExport.exportHierarchy(updateGR) : updateSetExport.exportUpdateSet(updateGR);

    var exporter = new ExportWithRelatedLists('sys_remote_update_set', remoteSysid);
    if (isBatchedUpdateSet) { // batched update set
        exporter.addRelatedList('sys_remote_update_set', 'remote_base_update_set');
        exporter.addQuerySet('sys_update_xml', "application=" + scopeId + "^remote_update_set.remote_base_update_set=" + remoteSysid);
    } else { // single update set
        exporter.addQuerySet('sys_update_xml', "application=" + scopeId + "^remote_update_set=" + remoteSysid);
    }

    // generate XML and set response
    exporter.exportRecords(g_response);
    // delete Remote Update Set records
    var remoteUpdateGR = new GlideRecord('sys_remote_update_set');
    remoteUpdateGR.addQuery('sys_id', remoteSysid);
    remoteUpdateGR.addOrCondition('remote_base_update_set', sysid);
    remoteUpdateGR.query();

    do {
        if (remoteUpdateGR.canDelete()) {
            remoteUpdateGR.deleteRecord();
        }
    } while (remoteUpdateGR.next());

})(g_request, g_response, g_processor);
