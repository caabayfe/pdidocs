(function executeRule(current, previous /*null when async*/) {

	try {
        // Get values from the current sys_upgrade_history record
        var fromVersion = current.from_version;
        var toVersion = current.to_version;
        var upgradeStarted = current.upgrade_started;
        var upgradeFinished = current.upgrade_finished;
        
        // Only proceed if upgrade_started is present
        if (!upgradeStarted) {
            return;
        }
        
        // Determine the upgrade progress status
        var newUpgradeProgress = '';
        if (upgradeStarted && !upgradeFinished) {
            newUpgradeProgress = 'in_progress';
        } else if (upgradeStarted && upgradeFinished) {
            newUpgradeProgress = 'complete';
        } else {
            return;
        }
        
        // Find and update the matching upgrade session with optimized query
        var upgradeSessionGR = new GlideRecord('sn_um_upgrade_sessions');
        upgradeSessionGR.addQuery('status', 'in_progress');
        upgradeSessionGR.addQuery('current_patch_id', fromVersion);
        upgradeSessionGR.addQuery('target_patch_id', toVersion);
        upgradeSessionGR.orderByDesc('sys_updated_on');
        upgradeSessionGR.query();
        
        if (upgradeSessionGR.next()) {
            var currentProgress = upgradeSessionGR.getValue('upgrade_progress');
            if (currentProgress != newUpgradeProgress) {
                upgradeSessionGR.setValue('upgrade_progress', newUpgradeProgress);
                upgradeSessionGR.update();
                gs.info('Upgrade History Tracker: Updated upgrade_progress to "' + newUpgradeProgress + '"');
            }
        }
        
    } catch (ex) {
        gs.error('Upgrade History Tracker: Error processing upgrade history record: ' + ex.getMessage());
    }

})(current, previous);
