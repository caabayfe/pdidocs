setResolutionFields();

function setResolutionFields() {
   if (current.resolved_by.nil())
      current.resolved_by = gs.getUserID();
   if (current.resolved_at.nil())
      current.resolved_at = gs.nowDateTime();
   
   // Update the fields that indicate the time and duration of this incident from open to resolve.
   // Keep track of duration as a glide_duration value (dd hh:mm:ss) and as a pure number of seconds.
   // Both calendar time and business time are maintained.
   
   var dataChange = current.opened_at.changes() || current.resolved_at.changes();
   var opened = current.opened_at.getDisplayValue();
   var resolved = current.resolved_at.getDisplayValue();

   if (dataChange || current.business_duration.nil())
      current.business_duration = gs.calDateDiff(opened, resolved, false);
   
   if (dataChange || current.business_stc.nil())
      current.business_stc = gs.calDateDiff(opened, resolved, true);
   
   if (dataChange || current.calendar_duration.nil())
      current.calendar_duration = gs.dateDiff(opened, resolved, false);
   
   if (dataChange || current.calendar_stc.nil())
      current.calendar_stc = gs.dateDiff(opened, resolved, true);
}
