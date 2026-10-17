var sysId = event.parm1;
var progresId = event.parm2;

gs.info('Upgrade Test Suites sys_id: ' + sysId + ', progress_id: ' + progresId);

var result = global.UpgradeManagementApiUtil.prototype.getCICDProgress(progresId);
// var result = new sn_upgrade_mgmt.UpgradeManagementATFUtil().getCICDProgress(progresId);

if (!result) {
    gs.info('Result is null. Will re-queue.');
    gs.eventQueue('sn_upgrade_mgmt.testsuite_execute', null, sysId, progresId);
} else {
    try {
        // Step 2: Parse result
        var json = JSON.parse(result);
        var executionId = json.test_suite_result_id;

        // Step 3: Validate test_suite_result_id
        if (!executionId) {
            gs.info('test_suite_result_id missing. Will re-queue.');
            gs.eventQueue('sn_upgrade_mgmt.testsuite_execute', null, sysId, progresId);
        } else {
            // Step 4: Update the record
            var gr = new GlideRecord('sn_um_upgrade_test_suites');
            if (gr.get(sysId)) {
                gr.setValue('suite_execution_id', executionId);
                gr.update();
                gs.info('Updated suite_execution_id for record: ' + sysId);
            }
        }
    } catch (e) {
        gs.error('JSON parse or processing error: ' + e.message);
        gs.eventQueue('sn_upgrade_mgmt.testsuite_execute', null, sysId, progresId);
    }
}
