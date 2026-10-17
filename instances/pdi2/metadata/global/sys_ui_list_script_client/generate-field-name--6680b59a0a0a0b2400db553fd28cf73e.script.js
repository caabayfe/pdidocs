function onChange(sysId, oldValue, newValue) {
  if (oldValue != "")
    return; // if we are modifying the existing label, dont modify the field name

  var c = "u_" + newValue.toLowerCase().replace(/[^a-zA-Z0-9_]/g, '_');

  g_list.setValue(sysId, "name", c);
  g_list.setDisplayValue(sysId, "name", c);
  g_list.renderValue(sysId, "name", c);
}
