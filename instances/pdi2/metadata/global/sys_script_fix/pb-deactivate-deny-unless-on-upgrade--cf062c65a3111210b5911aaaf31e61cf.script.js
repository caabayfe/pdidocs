var tables = [
    'sys_pd_activity_type',
    'sys_playbook_activity_renderer',
    'sys_playbook_experience',
    'sys_playbook_experience_action_assignment_map',
    'sys_playbook_experience_activity_ui',
    'sys_playbook_experience_configuration',
    'sys_playbook_experience_record_generator',
    'sys_playbook_experience_state_to_status',
    'sys_playbook_experience_status_mapping',
    'sys_playbook_experience_status_to_state'
];
function deactivate() {
    if (!isAPIPresent() || !isSystemReady())
        return;
    var denyACLIds = getDenyACLs();
    var batchId = gs.generateGUID();
    gs.info(
        'BatchId [' + batchId + ']. \n' +
        'Playbook Experience deactivate Deny Unless ACLs on upgrade. \n' +
        'Attempting to deactivate [' + denyACLIds.join(',') + '].'
    );
    var skippedIds = [];
    try {
        var api = getAPI();
        skippedIds =
            new api().deactivateACLsAndFiltersOnUpgrade(denyACLIds);
    } catch (err) {
        gs.info(
            'BatchId [' + batchId + ']. \n' +
            'Exception occurred while attempting to deactivate Deny Unless ACLs on upgrade. \n' +
            'Error is [' + err + ']. \n'
        );
        return;
    }
    gs.info(
        'BatchId [' + batchId + ']. \n' +
        'Finished deactivating Deny Unless ACLs on upgrade. \n' +
        'ACLs skipped [' + skippedIds.join(',') + '].'
    );
}
function isAPIPresent() {
    try {
        return !!getAPI();
    } catch (err) {
        return false;
    }
}
function getAPI() {
    try {
        return sn_data_filter.SlowRolloutUpgradeHelperAPI ||
            sn_security_upgrade_utils.SlowRolloutUpgradeHelperAPI;
    } catch (err) {
        return undefined;
    }
}
function isSystemReady() {
    return !GlidePluginManager.isZboot() &&
        GlidePluginManager.isUpgradeSystemBusy();
}
function getDenyACLs() {
    var gr = new GlideRecord('sys_security_acl');
    gr.addQuery('name', 'IN', tables.join(','));
    gr.addQuery('decision_type', 'deny');
    gr.addActiveQuery();
    gr.query();
    var ids = [];
    while (gr.next()) {
        ids.push(gr.getUniqueValue());
    }
    return ids;
}
deactivate();
