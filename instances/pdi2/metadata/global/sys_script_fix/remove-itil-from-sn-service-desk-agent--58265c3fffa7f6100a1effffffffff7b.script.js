(function removeItilRoleFromSDA() {
    gs.info('Fix Script [Remove itil from sn_service_desk_agent]: Execution started');

    if (pm.isZboot()) {
        gs.info('Fix Script [Remove itil from sn_service_desk_agent]: Skipping - Running in zboot mode');
        return;
    }

    gs.info('Fix Script [Remove itil from sn_service_desk_agent]: Checking for itil role containment in sn_service_desk_agent');

    // Get the sn_service_desk_agent role
    var sdaRoleGR = new GlideRecord('sys_user_role');
    sdaRoleGR.addQuery('name', 'sn_service_desk_agent');
    sdaRoleGR.query();

    if (!sdaRoleGR.next()) {
        gs.info('Fix Script [Remove itil from sn_service_desk_agent]: sn_service_desk_agent role not found - no action needed');
        return;
    }

    var sdaRoleSysId = sdaRoleGR.getUniqueValue();

    // Get the itil role
    var itilRoleGR = new GlideRecord('sys_user_role');
    itilRoleGR.addQuery('name', 'itil');
    itilRoleGR.query();

    if (!itilRoleGR.next()) {
        gs.info('Fix Script [Remove itil from sn_service_desk_agent]: itil role not found - no action needed');
        return;
    }

    var itilRoleSysId = itilRoleGR.getUniqueValue();

    // Check if the containment relationship exists and was created by the upgrade fix script
    var roleContainsGR = new GlideRecord('sys_user_role_contains');
    roleContainsGR.addQuery('role', sdaRoleSysId);
    roleContainsGR.addQuery('contains', itilRoleSysId);
    roleContainsGR.addQuery('sys_created_by', 'system');
    roleContainsGR.addQuery('sys_updated_by', 'system');
    roleContainsGR.query();

    var recordCount = roleContainsGR.getRowCount();

    if (recordCount === 0) {
        gs.info('Fix Script [Remove itil from sn_service_desk_agent]: No containment relationship created by "Add itil to sn_service_desk_agent role" fix script was found - no action needed');
        return;
    }

    if (recordCount > 1) {
        gs.warn('Fix Script [Remove itil from sn_service_desk_agent]: Found ' + recordCount + ' duplicate containment records - expected exactly 1. Manual cleanup required.');
        return;
    }

    // Delete the containment relationship (exactly 1 record)
    if (roleContainsGR.next()) {
        var recordSysId = roleContainsGR.getUniqueValue();
        if (roleContainsGR.deleteRecord()) {
            gs.info('Fix Script [Remove itil from sn_service_desk_agent]: Successfully deleted containment record with sys_id: ' + recordSysId);
        } else {
            gs.error('Fix Script [Remove itil from sn_service_desk_agent]: Failed to delete containment record with sys_id: ' + recordSysId);
            return;
        }
    }

    gs.info('Fix Script [Remove itil from sn_service_desk_agent]: Execution completed successfully');
})();
