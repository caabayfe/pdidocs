function createTransformMap() {
  var tableName = gel('sys_target').value;
  window.location = "sys_transform_map.do?sys_id=-1&sysparm_query=source_table=" + tableName;
}
