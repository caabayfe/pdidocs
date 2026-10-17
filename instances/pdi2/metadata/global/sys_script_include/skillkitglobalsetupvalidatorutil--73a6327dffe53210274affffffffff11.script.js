var SkillKitGlobalSetupValidatorUtil = Class.create();
SkillKitGlobalSetupValidatorUtil.prototype = {
    initialize: function() {},

    enableGAICFlowDebug: function() {
        var sysProps = {
            "com.glide.oneapi.flow_debug": true,
            "com.glide.oneapi.fdih.async.quick.mode": false,
            "com.snc.process_flow.reporting.level": "FULL"
        };
        var sysPropNames = Object.keys(sysProps);
        for (var i = 0; i < sysPropNames.length; i++) {
            gs.setProperty(sysPropNames[i], sysProps[sysPropNames[i]]);
        }
    },

    disableGAICFlowDebug: function() {
        var sysProps = {
            "com.glide.oneapi.flow_debug": false,
            "com.glide.oneapi.fdih.async.quick.mode": true,
            "com.snc.process_flow.reporting.level": "OFF"
        };
        var sysPropNames = Object.keys(sysProps);
        for (var i = 0; i < sysPropNames.length; i++) {
            gs.setProperty(sysPropNames[i], sysProps[sysPropNames[i]]);
        }
        var sysPropSysIds = ["54c860f243110210b0f484b49bb8f243", "200233645330311033aeddeeff7b1229", "7263adf377032300c8c2d6553b106110"];
        for (var j = 0; j < sysPropSysIds.length; j++) {
            var sysUpdateGr = new GlideRecord('sys_update_xml');
            sysUpdateGr.addQuery('name', 'sys_properties_' + sysPropSysIds[j]);
            sysUpdateGr.query();
            if (sysUpdateGr.next()) {
                sysUpdateGr.setValue('replace_on_upgrade', true);
                sysUpdateGr.update();
            }
        }

    },

    fetchSkippedFilesDetails: function(storeApps) {
        var hasSkippedFiles = false;
        var messages = {
            skipped_files: [],
        };
        for (var storeAppIndex = 0; storeAppIndex < storeApps.length; storeAppIndex++) {
            var skippedFilesGr = new GlideRecord("sys_upgrade_history_log");
            skippedFilesGr.addQuery("disposition", "IN", "11,104,9,4,10");
            skippedFilesGr.addQuery("plugin", storeApps[storeAppIndex]);
            skippedFilesGr.query();
            if (skippedFilesGr.hasNext()) {
                hasSkippedFiles = true;
                var skippedCount = skippedFilesGr.getRowCount();
                messages["skipped_files"].push(
                    "Found " + skippedCount + " skipped files for store app '" + storeApps[storeAppIndex] +
                    "' during plugin installations/upgrades. " +
                    "Please review skipped files in sys_upgrade_history_log table with disposition in (Skipped, Skipped Error, Skipped Apply Once, Skipped (second pass), Skipped Manual Merge) to ensure " +
                    "no critical configurations were missed during plugin installation or upgrade."
                );

                // Log details of skipped files for troubleshooting
                while (skippedFilesGr.next()) {
                    messages["skipped_files"].push(
                        "Skipped file for " + storeApps[storeAppIndex] + ": " + skippedFilesGr.getValue("file_name") +
                        " (Priority: " + skippedFilesGr.getValue("type_priority") + ")"
                    );
                }
            }
        }
        return messages;
    },

    type: 'SkillKitGlobalSetupValidatorUtil'
};
