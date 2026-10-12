function showImportSets() {
  var tableName = gel('sys_target').value;
  window.location = "sys_import_set_list.do?sysparm_query=table_name=" + tableName;
}
