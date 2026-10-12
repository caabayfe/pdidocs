var MIDServerUpgradeUtil = Class.create();

// this function should be called after the upgrade has been triggered and intended
// to verify whether the upgrade completed successfully
MIDServerUpgradeUtil.verifyUpgradeCompleted = function(sysId) {
    var mid = new GlideRecord('ecc_agent');
    if (!mid.get(sysId)) {
        gs.log('Unable to check upgrade status of MID Server sys_id=' + sysId);
        return;
    }

    if (mid.getValue('status') != 'Up') {
        // check if any upgrade stages are still inProgress
        var stage = new GlideRecord('ecc_agent_upgrade_history_stage');
        stage.addQuery('mid_server', sysId);
        stage.addQuery('state', 'InProgress');
        stage.query();

        if (stage.getRowCount() > 0) {
            MIDServerUtil.createOrUpdateIssue(sysId, 'Upgrade', 'MID Server failed to upgrade');
            
            // mark those stages as failed
            while (stage.next()) {
                stage.setValue('state', 'Failed');
                stage.setValue('message', 'Stage was marked as Failed since it did not complete in time for upgrade verification');
                stage.update();
            }
            
            return;
        }
    }

    MIDServerUtil.resolveExistingIssues(sysId, 'Upgrade');

};

MIDServerUpgradeUtil.prototype = {
    initialize: function() {},

    type: 'MIDServerUpgradeUtil'
};
