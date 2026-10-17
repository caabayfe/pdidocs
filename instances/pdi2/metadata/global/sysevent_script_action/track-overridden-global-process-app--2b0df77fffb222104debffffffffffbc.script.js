// This event triggers the "Domain Upgraded Overridden Process Tracker Job" to collect records modified during the app/plugin upgrade process.

//different use cases as part of app/plugin upgrade

// Case 1: Family Upgrade in Progress
// When a Family Upgrade (system.upgraded) is in progress, both the application and plugins 
// are upgraded as part of the same process. Therefore, this event (plugin.upgraded) should not 
// trigger separately, as the record are already being handled/tracked in the family upgrade process.

// Case 2: When a Family Upgrade, App Install, App Upgrade, or Plugin Repair is in progress,
// no other plugins or apps can be installed or upgraded concurrently. Events triggered for 
// isolated or individual app upgrades will not even be triggered, meaning the use case 
// cannot proceed while the system is paused, and no action will take place during this time.

// Case 3: Plugin repair is a valid use case for triggering this event to track overridden global processes. 
// During the repair, some global records may have been missed or modified, and it's important to capture 
// these changes to ensure all relevant data is tracked and repaired properly.

// Case 4: A plugin's first-time installation is also a valid use case and event "plugin.upgraded" is tied to first time//installation as well. 
// During the installation, records in the app (under if folder) might alter global processes 
// that already exist, making it necessary to track these changes as part of collecting the data

function triggerJobIfValidAppUpgrade() {
    if (gs.isPaused()) {
        gs.log("System is paused. Exiting from Track Overridden Global Process - App.");
        return;
    }

    var scope = event.parm1;
    if (!scope) {
        gs.log("Missing required event parameter for: Track Overridden Global Process - App");
        return;
    }

    var triggerSysId = new SNC.UpgradedProcessTracker().createTrackerTrigger(scope);
    if (!triggerSysId)
        gs.error("[Domain Upgraded Overridden Process Tracker] Error creating sys_trigger record for app " + scope);
}
triggerJobIfValidAppUpgrade();
