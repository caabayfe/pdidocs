(function() {
    var upgradeSessionId = event.parm1;
    var scheduleId = event.parm2;

    if (!upgradeSessionId || !scheduleId) {
        gs.error("sn_upgrade_mgmt.batch_install_scheduled: Missing parm1 or parm2");
        return;
    }

    var scheduleGR = new GlideRecord("sys_installation_schedule");
    if (!scheduleGR.get(scheduleId)) {
        gs.warn("sn_upgrade_mgmt.batch_install_scheduled: Schedule not found: " + scheduleId);
        return;
    }

    var trackerId = scheduleGR.getValue("execution_tracker_id");

    // If tracker not yet available, re-queue with a 2-minute delay
    if (!trackerId) {
        // Safety: stop retrying if more than 30 minutes past schedule start time
        var scheduleStart = new GlideDateTime(scheduleGR.getValue("start_time"));
        var now = new GlideDateTime();
        var diffMs = GlideDateTime.subtract(now, scheduleStart).getNumericValue();
        if (diffMs > 1800000) {
            gs.error("sn_upgrade_mgmt.batch_install_scheduled: Gave up after 30 min for schedule: " + scheduleId);
            return;
        }

        var retryGdt = new GlideDateTime();
        retryGdt.addSeconds(120);
        var retrySessionGR = new GlideRecord("sn_um_upgrade_sessions");
        if (retrySessionGR.get(upgradeSessionId)) {
            gs.eventQueueScheduled(
                "sn_upgrade_mgmt.batch_install_scheduled",
                retrySessionGR,
                upgradeSessionId,
                scheduleId,
                retryGdt
            );
            gs.info("sn_upgrade_mgmt.batch_install_scheduled: Tracker not ready, re-queued for 2 min");
        }
        return;
    }

    // Link tracker to upgrade session
    var sessionGR = new GlideRecord("sn_um_upgrade_sessions");
    if (sessionGR.get(upgradeSessionId)) {
        sessionGR.setValue("batch_app_install_execution_tracker", trackerId);
        sessionGR.update();
        gs.info("sn_upgrade_mgmt.batch_install_scheduled: Linked tracker " + trackerId + " to session " + upgradeSessionId);
    } else {
        gs.error("sn_upgrade_mgmt.batch_install_scheduled: Session not found: " + upgradeSessionId);
    }
})();
