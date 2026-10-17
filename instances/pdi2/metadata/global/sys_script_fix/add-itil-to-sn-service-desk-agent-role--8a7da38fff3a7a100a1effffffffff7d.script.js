(function addItilRoleToSDA() {
    gs.info('Fix Script [Add itil to sn_service_desk_agent role]: Execution started');

    if (pm.isZboot() || pm.isActive('com.snc.itsm.roles')) {
        gs.info('Fix Script [Add itil to sn_service_desk_agent role]: Skipping - Either zboot or com.snc.itsm.roles plugin is active');
        return;
    }

    gs.info('Fix Script [Add itil to sn_service_desk_agent role]: Adding itil role as contained role in sn_service_desk_agent');

    // Get the sn_service_desk_agent role
    var sdaRoleGR = new GlideRecord('sys_user_role');
    sdaRoleGR.addQuery('name', 'sn_service_desk_agent');
    sdaRoleGR.query();

    if (!sdaRoleGR.next()) {
        gs.error('Fix Script [Add itil to sn_service_desk_agent role]: sn_service_desk_agent role not found');
        return;
    }

    var sdaRoleSysId = sdaRoleGR.getUniqueValue();

    // Get the itil role
    var itilRoleGR = new GlideRecord('sys_user_role');
    itilRoleGR.addQuery('name', 'itil');
    itilRoleGR.query();

    if (!itilRoleGR.next()) {
        gs.error('Fix Script [Add itil to sn_service_desk_agent role]: itil role not found');
        return;
    }

    var itilRoleSysId = itilRoleGR.getUniqueValue();

    // Check if the relationship already exists
    var existingContainsGR = new GlideRecord('sys_user_role_contains');
    existingContainsGR.addQuery('role', sdaRoleSysId);
    existingContainsGR.addQuery('contains', itilRoleSysId);
    existingContainsGR.query();

    if (existingContainsGR.hasNext()) {
        gs.info('Fix Script [Add itil to sn_service_desk_agent role]: itil role is already contained in sn_service_desk_agent role - no action needed');
        return;
    }

    // Add itil as a contained role in sn_service_desk_agent
    var roleContainsGR = new GlideRecord('sys_user_role_contains');
    roleContainsGR.initialize();
    roleContainsGR.role = sdaRoleSysId;
    roleContainsGR.contains = itilRoleSysId;

    if (!roleContainsGR.insert()) {
        gs.error('Fix Script [Add itil to sn_service_desk_agent role]: Failed to add itil as contained role in sn_service_desk_agent');
        return;
    }

    gs.info('Fix Script [Add itil to sn_service_desk_agent role]: Successfully added itil as contained role in sn_service_desk_agent');
    gs.info('Fix Script [Add itil to sn_service_desk_agent role]: Execution completed successfully');
})();
