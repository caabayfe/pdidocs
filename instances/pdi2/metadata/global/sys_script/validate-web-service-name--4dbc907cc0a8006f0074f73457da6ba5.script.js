validateWSname();

function validateWSname() {
  if (!current.name.changes())
    return true;

  var tgr = new GlideRecord("sys_dictionary");
  tgr.addQuery("name", current.name);
  tgr.query();
  if (tgr.next()) {
    current.name.setError("Web service name may not be the same as table name '" + current.name +"'");
    current.setAbortAction(true);
    return false;
  }

  return true;
}
