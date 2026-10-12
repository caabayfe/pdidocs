function showTransformHistory() {
  var tableName = gel('sys_target').value;
  window.location = "sys_import_set_run_list.do?sysparm_query=set.table_name=" + tableName;
}
