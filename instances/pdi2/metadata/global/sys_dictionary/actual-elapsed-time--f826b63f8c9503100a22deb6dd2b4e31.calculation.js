if (!current.start_time.nil()) {
   if (current.active == true && current.stage != 'paused') {
      var totalElapsedMS = gs.dateDiff(current.start_time.getDisplayValue(), gs.nowDateTime(), true) * 1000;
      var pausedMS = 0;
      if (current.pause_duration) {
         pausedMS = current.pause_duration.getGlideObject().getNumericValue();
      }
      var adjustedMS = totalElapsedMS - pausedMS;
      var newDur = new GlideDuration(adjustedMS);
      answer = newDur.getDurationValue();
   } else {
      current.duration;
   }
} else {
   var newDur2 = new GlideDuration(0);
   answer = newDur2.getDurationValue();
}
