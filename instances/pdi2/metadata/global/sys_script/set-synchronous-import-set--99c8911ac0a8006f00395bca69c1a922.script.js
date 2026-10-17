new GlideProperty('com.glide.synchronous_import_set.enable_row_increment', true);
setImportSetSysId();

if (GlideProperties.getBoolean('com.glide.synchronous_import_set.enable_row_increment', true))
    setImportSetRow();
else
    current.sys_import_row = 0;

function setImportSetSysId() {
    var it = new GlideImportSet(current.getTableName());
    it.setSynchronous(true);
    current.sys_import_set = it.create();
}

// set the import set row number if it is blank
function setImportSetRow() {
  if (!current.sys_import_row.nil()) {
    return;
  }

  var rgr = new GlideRecord('sys_import_set_row');
  rgr.orderByDesc("sys_import_row");
  rgr.setLimit(1);
  rgr.addQuery('sys_import_set',current.sys_import_set);
  rgr.query();
  if (rgr.next()) {
    current.sys_import_row = rgr.sys_import_row + 1;
  } else {
    current.sys_import_row = 0;
  }
}
