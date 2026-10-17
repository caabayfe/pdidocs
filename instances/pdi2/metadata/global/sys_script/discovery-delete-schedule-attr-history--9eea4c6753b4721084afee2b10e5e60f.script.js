(function executeRule(current, previous /*null when async*/ ) {

    var scheduleId = current.getValue('schedule');
    if (scheduleId)
        DiscoveryApiAttribute.deleteCIScheduleAttributeHistory(scheduleId);

})(current, previous);
