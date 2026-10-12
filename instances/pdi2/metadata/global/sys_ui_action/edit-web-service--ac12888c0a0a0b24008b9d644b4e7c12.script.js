function editWS() {
  var tableName = gel('sys_target').value;
  var dgr = new GlideRecord("sys_dictionary");
  dgr.addQuery("name", tableName);
  dgr.addQuery("element", "");
  dgr.query();
  if (dgr.next()) {
    window.location = "v_ws_editor.do?sysparm_query=target_sys_id=" + dgr.sys_id;
  }
}
