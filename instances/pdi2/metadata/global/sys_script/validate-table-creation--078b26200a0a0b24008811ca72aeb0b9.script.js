var v = validateTablename();
if (v && current.getTableName() != 'v_table_editor') {
  v = validateRequiredFields();
}


function validateTablename() {
  if (!current.name.changes())
    return true;

  var tgr = new GlideRecord("sys_dictionary");
  tgr.addQuery("name", current.name);
  tgr.query();
  if (tgr.next()) {
    current.name.setError(gs.getMessage("table name") + " '" + current.name + "' " + gs.getMessage("already exists"));
    current.setAbortAction(true);
    return false;
  }

  return true;
}

function validateRequiredFields() {
  var fgr = new GlideRecord("v_field_creator");
  fgr.addQuery("table_creator", current.sys_id);
  fgr.query();
  if (!fgr.next() && current.extends_table.nil()) {
    gs.addErrorMessage(gs.getMessage("Invalid table, please add at least 1 field"));
    current.setAbortAction(true);
    return false;
  } else {
    if (fgr.label.nil())
      outputInvalidBlankField();

    if (fgr.type == "reference" && fgr.reference_table.nil()) {
      gs.addErrorMessage(gs.getMessage("Invalid table, reference table name cannot be blank when it is a reference field"));
      current.setAbortAction(true);
      return false;
    }

    while (fgr.next()) {
      if (fgr.label.nil()) {
        outputInvalidBlankField();
        return false;
      }
    }
  }

  return true;
}

function outputInvalidBlankField() {
    gs.addErrorMessage(gs.getMessage("Invalid table, field label cannot be blank"));
    current.setAbortAction(true);
}
