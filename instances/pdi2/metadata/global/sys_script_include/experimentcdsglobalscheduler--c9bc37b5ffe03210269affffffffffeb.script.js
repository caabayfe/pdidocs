var ExperimentCDSGlobalScheduler = Class.create();
ExperimentCDSGlobalScheduler.prototype = {
    initialize: function () { },

    oneTimeCDSScheduler: function (triggerName, scriptContent) {
        // Validate inputs
        if (!triggerName || !scriptContent) {
            gs.error("[ExperimentCDSGlobalScheduler] Trigger name and script content must be provided.");
            return null;
        }

        // Calculate execution time: 1 minute in the future
        var curTime = new GlideDateTime();
        var future1Min = new GlideDateTime(curTime);
        future1Min.addSeconds(60);  // Run 1 minute later

        // Create the sys_trigger record
        var trig = new GlideRecord("sys_trigger");
        trig.initialize();
        trig.setValue("state", 0); // Ready
        trig.setValue("trigger_type", 0); // Run once
        trig.setValue("next_action", future1Min); // Scheduled time
        trig.setValue("name", triggerName);
        trig.setValue("script", scriptContent);

        // Insert and return result
        var id = trig.insert();
        if (id) {
            gs.info("[ExperimentCDSGlobalScheduler] Trigger created with ID: " + id);
            return id;
        } else {
            gs.error("[ExperimentCDSGlobalScheduler] Failed to create trigger.");
            return null;
        }
    },

    type: "ExperimentCDSGlobalScheduler"
};
