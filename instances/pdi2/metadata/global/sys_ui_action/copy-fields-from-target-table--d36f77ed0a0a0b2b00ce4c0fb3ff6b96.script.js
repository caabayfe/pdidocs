if (current.isNewRecord()) {
  current.insert();
} else {
  current.update();
}

var dgr = new GlideRecord("sys_dictionary");
dgr.addQuery("name", current.name);
dgr.addQuery("element", "");
dgr.query();
if (dgr.next()) {
  gs.setRedirect("v_ws_editor.do?sysparm_query=target_sys_id=" + dgr.sys_id);
}
