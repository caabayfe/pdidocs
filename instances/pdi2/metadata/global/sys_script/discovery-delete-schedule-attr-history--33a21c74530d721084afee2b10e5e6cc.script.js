(function executeRule(current, previous /*null when async*/ ) {

    var scopeTable = current.getValue('attr_scope_table');
    var scopeId = current.getValue('attr_scope');

    if (scopeTable == 'discovery_schedule') {
        DiscoveryApiAttribute.deleteCIScheduleAttributeHistory(scopeId);

    } else if (scopeTable == 'discovery_range_item') {
        // Get schedule from range item
        var rangeItemGR = new GlideRecord('discovery_range_item');
        if (rangeItemGR.get('sys_id', scopeId)) {
            var scheduleId = rangeItemGR.getValue('schedule');
            if (scheduleId)
                DiscoveryApiAttribute.deleteCIScheduleAttributeHistory(scheduleId);
        }

    } else if (scopeTable == 'discovery_range') {
        // Get schedules from discovery_schedule_range junction table
        var schedRangeGR = new GlideRecord('discovery_schedule_range');
        schedRangeGR.addQuery('range', scopeId);
        schedRangeGR.query();

        while (schedRangeGR.next()) {
            var scheduleId = schedRangeGR.getValue('dscheduler');
            if (scheduleId)
                DiscoveryApiAttribute.deleteCIScheduleAttributeHistory(scheduleId);
        }
    }

})(current, previous);
