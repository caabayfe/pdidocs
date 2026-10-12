function showImportSets() {
  var tableName = gel('v_ws_editor.name').value;
  window.location = "sys_import_set_list.do?sysparm_query=table_name=" + tableName;
}
