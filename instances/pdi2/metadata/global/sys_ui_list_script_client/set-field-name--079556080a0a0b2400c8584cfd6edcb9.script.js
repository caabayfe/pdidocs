function onChange(sysId, oldValue, newValue) {
  var vv = newValue.toLowerCase().replace(/[^a-zA-Z0-9_]/g, '_');

  if (vv.startsWith("sys_"))
    vv = "u_" + vv;

  g_list.setValue(sysId, "name", vv);
  g_list.renderValue(sysId, "name");
}
