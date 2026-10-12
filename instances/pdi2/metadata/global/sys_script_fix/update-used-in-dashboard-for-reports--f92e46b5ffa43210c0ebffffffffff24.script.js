(function() {
    // Create a new scheduled job
    trigger = new GlideRecord('sys_trigger');
    trigger.initialize();
    // Set basic job properties
    trigger.setValue('name', 'Update Used in Dashboard for Reports & Visualizations');
    trigger.setValue('trigger_type', 0); // Run once
    trigger.setValue('job_classification', "RunOnce.VizType");
    // Set the script to run
    var scriptFunction = function() {
        try {
			gs.info("Starting to update 'Used in Dashboard' column for visualizations");
            var util = new global.AnalyticsCenterUtil();
			util.updateUsedInDashboard();

            gs.info("Finished updating 'Used in Dashboard' for visualizations");
        } catch (e) {
            gs.error("Error populating 'Used in Dashboard' for visualizations: " + e);
        }
    };
    // Convert function to string and remove function wrapper
    var scriptContent = scriptFunction.toString();
    scriptContent = scriptContent.substring(scriptContent.indexOf('{') + 1, scriptContent.lastIndexOf('}')).trim();
    trigger.setValue('script', scriptContent);
    var triggerId = trigger.insert();
    if (triggerId) {
        gs.info('Created scheduled job "Update Used in Dashboard for visualizations" with sys_id: ' + triggerId);
    } else {
        gs.error('Failed to create scheduled job "Update Used in Dashboard for visualizations"');
    }
})();
