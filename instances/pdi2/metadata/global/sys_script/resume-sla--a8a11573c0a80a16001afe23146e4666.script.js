resumeSLA();

function resumeSLA() {
   var actualPauseDur;
   var businessPauseDur;
   var now = current.task.sys_updated_on.getDisplayValue();

   //Calculate actual pause time
   actualPauseDur = (gs.dateDiff(current.pause_time.getDisplayValue(), now, true)) * 1000;
   if (current.pause_duration)
      actualPauseDur += current.pause_duration.getGlideObject().getNumericValue();

   current.pause_duration.setDateNumericValue(actualPauseDur);

   //Calculate business pause time
   if (current.schedule) {
      var schedule = new GlideSchedule(current.schedule);
      if (current.timezone)
         schedule.setTimeZone(current.timezone);
      else
         schedule.setTimeZone(gs.getSysTimeZone());

      var duration = schedule.duration(current.pause_time.getGlideObject(), current.task.sys_updated_on.getGlideObject());

      businessPauseDur = duration.getNumericValue();

      if (current.business_pause_duration)
         businessPauseDur += current.business_pause_duration.getGlideObject().getNumericValue();

      current.business_pause_duration.setDateNumericValue(businessPauseDur);
   } else
      current.business_pause_duration.setDateNumericValue(actualPauseDur);

   current.pause_time = '';
}
