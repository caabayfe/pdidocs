
            (function() {
    // Create a new scheduled job
    trigger = new GlideRecord('sys_trigger');
    trigger.initialize();
    // Set basic job properties
    trigger.setValue('name', 'Populate Dashboard Ready To Migrate Column');
    trigger.setValue('trigger_type', 0); // Run once
    trigger.setValue('job_classification', "RunOnce.PAR Migration");
    // Set the script to run
    var scriptFunction = function() {
        try {
            gs.info("Starting to populate ready_to_migrate column for all dashboards");
            var populator = new PopulateReadyToMigrate();
            populator.populateAllDashboardsReadyToMigrateColumns();
            gs.info("Finished populating ready_to_migrate column for all dashboards");
        } catch (e) {
            gs.error("Error populating ready_to_migrate column: " + e);
        }
    };
    // Convert function to string and remove function wrapper
    var scriptContent = scriptFunction.toString();
    scriptContent = scriptContent.substring(scriptContent.indexOf('{') + 1, scriptContent.lastIndexOf('}')).trim();
    trigger.setValue('script', scriptContent);
    var triggerId = trigger.insert();
    if (triggerId) {
        gs.info('Created scheduled job "Populate Dashboard Ready To Migrate Column" with sys_id: ' + triggerId);
    } else {
        gs.error('Failed to create scheduled job "Populate Dashboard Ready To Migrate Column"');
    }
})();
