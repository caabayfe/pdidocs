var tables = [
    'sys_pd_activity',
    'sys_pd_activity_context',
    'sys_pd_activity_definition',
    'sys_pd_activity_m2m_app_object',
    'sys_pd_activity_override',
    'sys_pd_activity_start_rule_definition',
    'sys_pd_activity_start_rule_var',
    'sys_pd_activity_type',
    'sys_pd_activity_type_prop',
    'sys_pd_asset_configuration',
    'sys_pd_context',
    'sys_pd_context_chunk',
    'sys_playbook_execution',
    'sys_pd_context_log',
    'sys_pd_derivative',
    'sys_pd_lane',
    'sys_pd_lane_context',
    'sys_pd_lane_start_rule_definition',
    'sys_pd_lane_start_rule_var',
    'sys_pd_panel_override',
    'sys_pd_process_definition',
    'sys_pd_process_input',
    'sys_pd_process_output',
    'sys_pd_process_type',
    'sys_pd_process_variant',
    'sys_pd_snapshot',
    'sys_pd_snapshot_chunk',
    'sys_pd_snapshot_input',
    'sys_pd_snapshot_output',
    'sys_pd_swim_lane',
    'sys_pd_swim_lane_image',
    'sys_pd_timer_attributes',
    'sys_pd_trigger_definition',
    'sys_pd_trigger_execution',
    'sys_pd_trigger_input',
    'sys_pd_trigger_instance',
    'sys_pd_trigger_license',
    'sys_pd_trigger_type',
    'v_pd_activity_condition_to_run',
    'v_pd_lane_condition_to_run'
];
function deactivate() {
    if (!isAPIPresent() || !isSystemReady())
        return;
    var denyACLIds = getDenyACLs();
    var batchId = gs.generateGUID();
    gs.info(
        'BatchId [' + batchId + ']. \n' +
        'Playbook Designer deactivate Deny Unless ACLs on upgrade. \n' +
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
