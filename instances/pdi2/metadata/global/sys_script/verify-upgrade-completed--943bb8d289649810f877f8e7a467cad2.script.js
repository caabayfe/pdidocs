(function executeRule(current, previous /*null when async*/ ) {
    var timeToWait = parseInt(gs.getProperty('mid.upgrade.verification_delay_sec', '3600'));

    if (isNaN(timeToWait))
        timeToWait = 3600;

    var gdt = new GlideDateTime();
    gdt.addSeconds(timeToWait);

    var schedule = new ScheduleOnce();
    schedule.setLabel("Verify MID upgrade for " + current.name);
    schedule.script = "MIDServerUpgradeUtil.verifyUpgradeCompleted('" + current.sys_id + "');";
    schedule.setTime(gdt.getValue());
    schedule.schedule();
})(current, previous);
