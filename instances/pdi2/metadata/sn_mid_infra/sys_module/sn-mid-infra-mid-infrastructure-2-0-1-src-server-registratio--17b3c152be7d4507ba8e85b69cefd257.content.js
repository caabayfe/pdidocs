/**
 * Business Rule Script: Protect Registration Key Fields
 * 
 * Enforces field protection on sn_mid_registration_key table:
 * - consumed_at: Cannot be modified once set
 * - use_count: Cannot be decreased
 * - revoked: Cannot be set back to false once true (no un-revoking)
 * 
 * Note: sys_created_by is automatically protected by the ServiceNow platform.
 * Note: assigned_to is read-only at table level, no BR protection needed.
 * TODO: Migrate to DB listener for better performance and enforcement.
 */
(function executeRule(current, previous /*null when async*/) {

    // Protect consumed_at field - cannot be modified once set
    if (current.consumed_at.changes() && !gs.nil(previous.consumed_at)) {
        gs.addErrorMessage(gs.getMessage('Consumed At cannot be modified once set'));
        current.setAbortAction(true);
        return;
    }
    
    // Prevent use_count from being decreased
    if (current.use_count.changes()) {
        var currentCount = parseInt(current.getValue('use_count') || 0);
        var previousCount = parseInt(previous.getValue('use_count') || 0);
        
        if (currentCount < previousCount) {
            gs.addErrorMessage(gs.getMessage('Use Count cannot be decreased'));
            current.setAbortAction(true);
            return;
        }
    }
    
    // Prevent un-revoking a key (allow false->true, prevent true->false)
    if (current.revoked.changes()) {
        var wasRevoked = previous.getValue('revoked') == 'true' || previous.getValue('revoked') == true;
        var isRevoked = current.getValue('revoked') == 'true' || current.getValue('revoked') == true;
        
        if (wasRevoked && !isRevoked) {
            gs.addErrorMessage(gs.getMessage('Cannot un-revoke a registration key'));
            current.setAbortAction(true);
            return;
        }
    }
    
})(current, previous);
