(function() {
    var deletedCount = 0;
    var recordsToDelete = [
        ['sys_properties', 'a1b2c3d4e5f6789012345678abcdef90', 'name', 'com.snc.platform.security.oauth.access_control.enabled'],
        ['sys_script', 'c3d4e5f6a7b8901234567890abcdef12', 'name', 'revokeTokensOnRbacDisabled'],
        ['sys_script', 'c3d4e5f6a7b8901234567890bcdef034', 'name', 'Guard RBAC enablement'],
        ['sys_script', 'e5f6a7b8c9d0123456789012345678ab', 'name', 'Run tool scan on job insert'],
        ['sys_ui_page', 'b2c3d4e5f67890123456789012349bcd', 'name', 'cimd_import_metadata'],
        ['sysevent_register', 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d5', 'event_name', 'auth.server.tool.scan.job']
    ];
    
    gs.info('Fix script started: Deleting ' + recordsToDelete.length + ' fake sys_id records in AIG Security features');
    
    for (var i = 0; i < recordsToDelete.length; i++) {
        var table = recordsToDelete[i][0];
        var sysId = recordsToDelete[i][1];
        var uniqueField = recordsToDelete[i][2];
        var uniqueValue = recordsToDelete[i][3];
        
        try {
            var gr = new GlideRecord(table);
            gr.addQuery('sys_id', sysId);
            gr.addQuery(uniqueField, uniqueValue);
            gr.query();
            
            if (gr.next()) {
                if (gr.getValue('sys_id') == sysId && gr.getValue(uniqueField) == uniqueValue) {
                    gr.deleteRecord();
                    deletedCount++;
                } else {
                    gs.error('Safety check failed for ' + table + ' sys_id: ' + sysId);
                }
            }
        } catch (e) {
            gs.error('Error deleting ' + table + ' sys_id: ' + sysId + ' - ' + e.message);
        }
    }
    
    gs.info('Fix script completed: Deleted ' + deletedCount + ' of ' + recordsToDelete.length + ' records in AIG Security features');
})();
