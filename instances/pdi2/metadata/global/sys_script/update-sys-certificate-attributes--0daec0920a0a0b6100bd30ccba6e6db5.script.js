var cgr = new GlideRecord("sys_certificate");
if(cgr.get(current.table_sys_id)) {
  cgr.subject = "unknown";
  cgr.update();
}
