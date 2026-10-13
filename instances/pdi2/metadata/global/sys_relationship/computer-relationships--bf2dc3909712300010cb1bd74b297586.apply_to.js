answer = false;
// list of tables is in an immutable Java ArrayList...
var tables_raw = GlideDBObjectManager.getTables(table_name);
for (var i = 0; i < tables_raw.size(); i++) {
   if (('' + tables_raw.get(i)) == 'cmdb_ci_computer') {
      answer = true;
      break;
   }
}
