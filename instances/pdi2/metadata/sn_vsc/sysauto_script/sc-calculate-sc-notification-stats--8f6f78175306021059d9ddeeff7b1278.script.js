var spUtil = new SCSecurityPolicyUtil();
var constants = new sn_vsc.SecurityCenterConstants();
var policy = new GlideRecord(constants.SECURITY_POLICY);
policy.query();
while (policy.next()) {
    var stats = spUtil.getPolicyStats(policy.sys_id);
    var count = spUtil.getWeeklyTriggerCount(policy.sys_id, 0);
    stats.setValue('triggered_count_last_7days', count);

    var sixWeekTotal = 0;
    for (var i = 1; i <= 6; i++) {
        sixWeekTotal += spUtil.getWeeklyTriggerCount(policy.sys_id, i);
    }
    var sixWeekAverage = sixWeekTotal / 6;
    stats.setValue('previous_6_week_average_trigger_count', sixWeekAverage.toFixed(2));

    var change = 100;
    if (sixWeekAverage > 0) {
        change = (100 * (count - sixWeekAverage)) / sixWeekAverage;
        change = change.toFixed(2);
    }
    stats.setValue('percentage_change', change);
    stats.update();
}
