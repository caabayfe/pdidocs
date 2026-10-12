
    (function executeRule(current, previous /*null when async*/) {
      // Add your code here
      new ScheduleSpanManager().getUpdatedScheduleSpanTimeZone(current.sys_id, previous.time_zone, current.time_zone);
    })(current, previous);
