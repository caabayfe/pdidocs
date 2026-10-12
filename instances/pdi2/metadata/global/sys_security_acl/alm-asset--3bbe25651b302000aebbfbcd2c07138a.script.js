answer = (function() {
    // 1. Users with roles beyond snc_internal/snc_external or no roles get full access
    // 2. Users with only base roles or no roles are restricted to assets where they appear in:
    //    assigned_to, managed_by, owned_by, reserved_for, supported_by, attested_by, audited_by, sn_itam_common_audited_by
    // Gated by sn_itam_restrict_asset_read property (default true) for customer override.
    
    if (gs.getProperty('sn_itam_restrict_asset_read', 'true') !== 'true')
        return true;
    var roles = gs.getUser().getRoles();
    var hasNoRoles = roles.size() === 0;
    var isBaseRoleOnly = roles.size() === 1 &&
        (String(roles.get(0)) === 'snc_internal' || String(roles.get(0)) === 'snc_external');
    if (!isBaseRoleOnly && !hasNoRoles)
        return true;
    var userId = gs.getUserID();
    var refFields = ['assigned_to', 'managed_by', 'owned_by', 'reserved_for',
                     'supported_by', 'attested_by', 'audited_by', 'sn_itam_common_audited_by'];
    for (var i = 0; i < refFields.length; i++) {
        if (current.isValidField(refFields[i]) && current.getValue(refFields[i]) === userId)
            return true;
    }
    return false;
})();
