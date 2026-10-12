function onChange(sysId, oldValue, newValue) {
  var c = "u_" + newValue.toLowerCase().replace(/[^a-zA-Z0-9_]/g, '_');

  g_list.setValue(sysId, "name", c);
  g_list.renderValue(sysId, "name", c);
}
