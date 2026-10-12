function transform(input) {
    var scheduleSysId = input.scheduleSysId;
    var scheduleEntrySysId = input.scheduleEntrySysId;
    if (gs.nil(scheduleSysId) || gs.nil(scheduleEntrySysId)) return false;
    var scheduleEntryGr = new GlideRecord('cmn_schedule_span');
    scheduleEntryGr.addQuery('sys_id', scheduleEntrySysId);
    scheduleEntryGr.query();
    if (scheduleEntryGr.next()) {
        var scheduleEntryScheduleSysId = scheduleEntryGr.getValue('schedule');
        if (scheduleSysId === scheduleEntryScheduleSysId) {
            //delete this entry from cmn schedule span table directly
            if (scheduleEntryGr.canDelete()) {
                return scheduleEntryGr.deleteRecord();
            }
        } else {
            //get the record from cmn other schedule table and then delete that record 
            var otherScheduleGr = new GlideRecord('cmn_other_schedule');
            otherScheduleGr.addQuery('child_schedule', scheduleEntryScheduleSysId);
            otherScheduleGr.addQuery('schedule', scheduleSysId);
            otherScheduleGr.query();
            if (otherScheduleGr.next()) {
                if (otherScheduleGr.canDelete()) {
                    return otherScheduleGr.deleteRecord();
                }
            }
        }
    }
    return false;
}
