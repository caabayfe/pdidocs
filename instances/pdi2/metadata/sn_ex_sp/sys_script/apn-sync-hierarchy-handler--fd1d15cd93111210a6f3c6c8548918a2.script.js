(function executeRule(current, previous /*null when async*/ ) {
    try {
        var tableName = current.getTableName();
        var sysId = current.getUniqueValue();

        var portalExtensibleNavigation = new sn_ex_sp.PortalExtensibleNavigationUtil();
        var response = portalExtensibleNavigation.syncPortalExtensibleNavigationItems(sysId, tableName);
		
        if (response.status === 'SUCCESS') {
            current.sync_status = 'completed';
            current.last_synced = new GlideDateTime();
        } else {
            current.sync_status = 'last_sync_failed';
        }
        current.update();
        gs.eventQueue('sn_ex_sp.apn.sync_email', current, JSON.stringify(response), gs.getUserID());
    } catch (error) {
        gs.error(gs.getMessage("Error in Business Rule: {0}", error.message));
        current.sync_status = 'last_sync_failed';
        current.update();
        gs.eventQueue('sn_ex_sp.apn.sync_email', current, JSON.stringify(response), gs.getUserID());
    }
})(current, previous);
