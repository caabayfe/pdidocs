global_events(current);

if (current.percent_complete.changes())
   updateFeatureCompletionPercent(current);

//
// Get each task and compute the percent complete for the feature
// by averaging the tasks
//
// If there is only 1 task then set the feature workflow = task workflow
//
function updateFeatureCompletionPercent(me) {
   var tasks = new GlideRecord('release_task');
   tasks.addQuery('feature', '=', current.feature);
   tasks.query();
   var xpercent = 0;
   var tcount = 0;   
   while (tasks.next()) {
      tcount += 1;
      var rpercent = tasks.percent_complete.getDisplayValue();     
      var ipercent = parseInt(rpercent);
      xpercent = xpercent + ipercent;
   }
   if (xpercent > 0 && tcount > 0 ) {
      var feature = new GlideRecord('release_feature');
      if (feature.get("sys_id", me.feature)) {
         feature.percent_complete.setValue(xpercent/tcount);
         if (tcount == 1)
            feature.workflow_state.setValue(me.workflow_state);
         feature.update();
      }
   }
}
