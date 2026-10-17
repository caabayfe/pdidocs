function onChange(sysId, oldValue, newValue) {
  // default to "string" type
  g_list.setValue(sysId, "length", "40");
  g_list.renderValue(sysId, "length", "Default (40)");

  // default Journal fields to be 100 chars
  if (newValue == "suggestion" || newValue == "url") {
    g_list.setValue(sysId, "length", "100");
    g_list.renderValue(sysId, "length", "Medium (100)");
  }

  // default Journal fields to be 4000 chars
  if (newValue == "journal") {
    g_list.setValue(sysId, "length", "4000");
    g_list.renderValue(sysId, "length", "Extra Large (4000)");
  }

  if (newValue != "reference") {
    g_list.setValue(sysId, "reference_table", "");
    g_list.renderValue(sysId, "reference_table", "N/A");
  } else {
    g_list.setValue(sysId, "reference_table", "");
    g_list.renderValue(sysId, "reference_table", "");
  }

  // if its not a "string" type field, display N/A for length value
  if (!isStringType(newValue)) {
    g_list.renderValue(sysId, "length", "N/A");
  }
}

function isStringType(typeName) {
  if (typeName == "string") {
    return true;
  }

  if (typeName == "journal") {
    return true;
  }

  if (typeName == "suggestion") {
    return true;
  }

  if (typeName == "url") {
    return true;
  }

  return false;
}
