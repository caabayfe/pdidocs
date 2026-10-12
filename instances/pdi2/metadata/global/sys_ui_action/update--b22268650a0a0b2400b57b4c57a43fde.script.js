current.setForceUpdate(true);
current.update();

if (current.copy_fields == true && !current.target_table.nil()) {
  new ImportSetUtil().copyFields(current.name, current.target_table, current.extends_table);
}
