(function executeRule(current, previous) {
    try {
        if (!current.target_platform_version.nil()) {
            return;
        }

        var currentPatchId = current.getValue('current_patch_id');
        var targetPatchId = current.getValue('target_patch_id');
        var sessionType = current.getValue('session_type');
        var platformVersionNumber = null;

        if (currentPatchId && targetPatchId && currentPatchId == targetPatchId && sessionType == 'bulk_app_update') {
            // Bulk App Update: Look up platform version from installed compatible suite config
            var grSuite = new GlideRecord('sys_suite_config');
            grSuite.addQuery('compatible', true);
            grSuite.orderByDesc('sys_created_on');
            grSuite.setLimit(1);
            grSuite.query();
            if (grSuite.next()) {
                platformVersionNumber = grSuite.getValue('platform');
                gs.info('Business Rule: Retrieved platform version from sys_suite_config: ' + platformVersionNumber);
            }
        } else if (targetPatchId) {
            // System Upgrade: look up platform version from upgrade_preview_version
            var grVersion = new GlideRecord('upgrade_preview_version');
            grVersion.addQuery('value', targetPatchId);
            grVersion.setLimit(1);
            grVersion.query();
            if (grVersion.next()) {
                platformVersionNumber = grVersion.getValue('platform_version_number');
                gs.info('Business Rule: Retrieved platform version from upgrade_preview_version: ' + platformVersionNumber);
            }
        }

        if (platformVersionNumber) {
            current.setValue('target_platform_version', platformVersionNumber);
            current.setWorkflow(false);
            current.autoSysFields(false);
            current.update();
        } else {
            gs.error('Business Rule: Failed to retrieve platform version for patch ' + targetPatchId);
        }
    } catch (err) {
        gs.error('Business Rule: Error updating target_platform_version - ' + err);
    }
})(current, previous);
