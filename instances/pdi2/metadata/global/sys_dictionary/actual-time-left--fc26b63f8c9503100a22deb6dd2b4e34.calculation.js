if (!current.planned_end_time.nil()) {
   if (current.active == true && current.stage != 'paused') {
      var durSeconds = gs.dateDiff(gs.nowDateTime(), current.planned_end_time.getDisplayValue(), true);
      if (durSeconds > 0) {
         answer = gs.dateDiff(gs.nowDateTime(), current.planned_end_time.getDisplayValue(), false);
      } else {
         answer = '00 00:00:00';
      }
   } else {
      current.time_left;
   }
} else {
   var newDur2 = new GlideDuration(0);
   answer = newDur2.getDurationValue();
}
