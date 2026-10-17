// This event triggers the "Domain Upgraded Overridden Process Tracker Job" to collect records modified during the family upgrade process.

function triggerJobIfValidSystemUpgrade() {
    var input = event.parm1;
    if (!input) {
        gs.log("Missing required event parameter for: Track Overridden Global Process - System");
        return;
    }

    var triggerSysId = new SNC.UpgradedProcessTracker().createTrackerTrigger(input);
    if (triggerSysId)
        gs.info("[Domain Upgraded Overridden Process Tracker] sys_trigger created for system upgrade with trigger id " + triggerSysId);
    else
        gs.error("[Domain Upgraded Overridden Process Tracker] Error creating sys_trigger record for system upgrade");
}
triggerJobIfValidSystemUpgrade();
