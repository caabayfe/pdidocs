current.update();
action.setRedirectURL(current);

var oldTZ = gs.getSession().getTimeZoneName();
var defaultTZ = GlideUser.getSysTimeZone();
gs.print("Setting session timezone to " + defaultTZ + " for Service Offering availability calculations");
gs.getSession().setTimeZoneName(defaultTZ);

recalcAvailability();

gs.getSession().setTimeZoneName(oldTZ);
gs.print("Restored session timezone to " + oldTZ + " after Service Offering availability calculations");

function recalcAvailability() {
   var current_ci_class = current.cmdb_ci.sys_class_name;
   var newBeginVal = new GlideDateTime().getNumericValue();
   var d = new GlideDateTime();
   d.addDays(-400)
   newEndVal = d.getNumericValue();
   updateCalc(newBeginVal, newEndVal);
}

function updateCalc(v1, v2) {
   if (v1 == v2 || v1 == 0 || v2 == 0)
      return;

   var today = new GlideDateTime(gs.beginningOfTomorrow()).getNumericValue();
   low = Math.min(v1, v2);
   high = Math.max(v1, v2);
   gs.print("Calculating past year availability for Service Offering: " + current.getDisplayValue());
   while (low <= high && low < today) {
      var d = new GlideDateTime();
      d.setNumericValue(low);
      var ac = new AvailabilitySummarizer();
      ac.setCI(current.sys_id);
      ac.summarize(d);

      low += 24 * 3600 * 1000;
   }
}
