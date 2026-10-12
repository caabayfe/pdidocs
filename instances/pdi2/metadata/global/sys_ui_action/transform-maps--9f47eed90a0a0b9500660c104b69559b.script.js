function showTransformMap() {
  var tableName = gel('sys_target').value;
  window.location = "sys_transform_map_list.do?sysparm_query=source_table=" + tableName;
}
