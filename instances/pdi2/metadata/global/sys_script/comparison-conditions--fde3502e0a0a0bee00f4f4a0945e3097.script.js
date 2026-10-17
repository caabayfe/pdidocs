function updateSetPreviewInstalled() {
   var gr = new GlideRecord("sys_plugins");
   gr.query("source","com.glide.system_update_set_preview");
   if (gr.next())
     return true;

   return false;
}

function areAllPreviewProblemsIgnored(id) {
  var worker = new GlideUpdateSetWorker();
  return worker.areAllPreviewProblemsIgnored(id);
}

function recordHasUpdateXML(gr) {
  var updateManager =  new GlideUpdateManager2();
  var name = updateManager.getUpdateName(gr)
  var update = new GlideRecord("sys_update_xml");
  update.query("name", name +"");
  if (update.next())
    return true;

  return false;
}

function historyRecordPresent(gr) {
 var history = new GlideRecord('sys_upgrade_history');
 history.query("update_set", gr.sys_id);
 if (history.next())  
    return true;
 
 return false;
}
