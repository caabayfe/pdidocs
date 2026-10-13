(function executeRule(current, previous /*null when async*/ ) {

    var scheduleId = current.getValue('dscheduler');

    if (scheduleId)
        DiscoveryApiAttribute.deleteCIScheduleAttributeHistory(scheduleId);

})(current, previous);
