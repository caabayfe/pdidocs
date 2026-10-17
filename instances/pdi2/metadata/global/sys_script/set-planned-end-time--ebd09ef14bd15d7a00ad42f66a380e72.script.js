setPlannedEndTime();

function setPlannedEndTime() {
   var dur = new DurationCalculator();
   var tz;
   if (current.timezone)
      tz = current.timezone;
   else
      tz = gs.getSysTimeZone();

   dur.setSchedule(current.schedule, tz);
   dur.setStartDateTime(current.start_time);
   if (current.sla.duration_type == "") {
      var totalDur = current.sla.duration.getGlideObject().getNumericValue() + current.business_pause_duration.getGlideObject().getNumericValue();
      dur.calcDuration(totalDur / 1000);
   } else {
      dur.calcRelativeDuration(current.sla.duration_type);
   }
   current.planned_end_time = dur.getEndDateTime();
   
   if (current.active == true) {
      //Create a trigger
      var newTrigger = new GlideRecord("sys_trigger");
      newTrigger.name = 'SLA breach timer - ' + current.task.number + ' - ' + current.sla.name;
      newTrigger.next_action = current.planned_end_time;
      newTrigger.document = 'task_sla';
      newTrigger.document_key = current.sys_id;
      newTrigger.script = "var sla = new GlideRecord('task_sla'); sla.addQuery('sys_id', '" + current.sys_id + "'); sla.query(); if (sla.next()) { sla.stage = 'breached'; sla.update();}";
      newTrigger.job_id.setDisplayValue('RunScriptJob');
      newTrigger.trigger_type = 0;
      newTrigger.insert();
   }
}
