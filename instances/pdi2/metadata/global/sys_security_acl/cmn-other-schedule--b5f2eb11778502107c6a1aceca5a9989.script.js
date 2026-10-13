if (current.isNewRecord())
    answer = new global.OCCalendarUtils().canRead();
else
    answer = new OnCallSecurityNG().rotaManagerAccessBySchedule(current.schedule.getRefRecord());
