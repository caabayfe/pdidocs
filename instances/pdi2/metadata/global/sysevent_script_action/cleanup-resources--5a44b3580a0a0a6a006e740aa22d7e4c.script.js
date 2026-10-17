// react to logout and cleanup any sys_poll data that may be left over
new CleanupListExport().cleanup(event);
cleanupReportViews(event.parm1);

function cleanupReportViews(userID) {
   var rpt = new GlideReportViewManagement();
   rpt.cleanTempViews(userID);
}
