function onChange(sysId, oldValue, newValue) {
  if (newValue != "") {
    g_list.setValue(sysId, "type", "reference");
    g_list.renderValue(sysId, "type", "Reference");
  }
}
