var igr = new GlideRecord("sys_import_set");
igr.addQuery("concurrent_import_set",current.sys_id);
igr.addQuery("state","loaded");
igr.query();
while(igr.next()){
  var cgr = new GlideRecord("sys_concurrent_import_set_job");
  cgr.addQuery("import_set",igr.sys_id);
  cgr.addQuery("concurrent_import_set",current.sys_id);
  cgr.query();
  if(cgr.next()){
    cgr.setValue("state","pending");
    cgr.setValue("type","resuming");
    cgr.update();
  }
}
