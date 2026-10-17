(function executeRule(current, previous /*null when async*/ ) {

    var rangeId = current.sys_id;

    // Query discovery_schedule_range to find all schedules associated with this range
    var scheduleRangeGR = new GlideRecord('discovery_schedule_range');
    scheduleRangeGR.addQuery('range', rangeId);
    scheduleRangeGR.query();

    while (scheduleRangeGR.next()) {
        var scheduleId = scheduleRangeGR.getValue('dscheduler');
        if (scheduleId)
            DiscoveryApiAttribute.deleteCIScheduleAttributeHistory(scheduleId);
    }

})(current, previous);
