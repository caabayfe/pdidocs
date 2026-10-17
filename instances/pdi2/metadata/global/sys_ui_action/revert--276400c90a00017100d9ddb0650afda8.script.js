var updateSet2 = new GlideUpdateSet();
var update = new GlideRecord("sys_update_xml");
update.query("sys_id",current.update_xml.sys_id + "" );
update.next();
var gr2 = updateSet2.getPrevious(update);
if (gr2 != null) {
  var updateManager = new GlideUpdateManager2();
  updateManager.loadXML(gr2.payload);
  gs.addInfoMessage(gs.getMessage("Record successfully reverted"));
} else {
  gs.addInfoMessage(gs.getMessage("There is a more recent update available"));
}
