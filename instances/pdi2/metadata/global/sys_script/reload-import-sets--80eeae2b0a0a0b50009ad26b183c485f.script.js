// search all my import set rows and updated them to pending state

reset_import_set_row();

function reset_import_set_row() {
  var mu = new GlideMultipleUpdate("sys_import_set_row");
  mu.addQuery("sys_import_set", current.sys_id);
  mu.setValue("sys_import_state", "pending");
  mu.execute();

  gs.addInfoMessage(gs.getMessage("import set rows updated to 'Pending' state"));
}
