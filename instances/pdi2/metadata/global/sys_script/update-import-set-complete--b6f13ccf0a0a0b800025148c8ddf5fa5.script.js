(function executeRule(current, previous /*null when async*/) {
  
  var isrgr = new GlideRecord("sys_import_set_run");
  isrgr.addQuery("set", current.set);
  isrgr.addQuery("state", "NOT IN", "complete,complete_with_errors");
  isrgr.setLimit(1);
  isrgr.query();
  if (isrgr.hasNext()) 
      return;
    
  var isgr = new GlideRecord("sys_import_set");
  isgr.addQuery("sys_id", current.set);
  isgr.addQuery("state", "!=", "processed");
  isgr.addQuery("mode", "!=", "synchronous");
  isgr.query();
  if (isgr.next()) {
      isgr.state = "processed";
      isgr.update();
  }

})(current, previous);
