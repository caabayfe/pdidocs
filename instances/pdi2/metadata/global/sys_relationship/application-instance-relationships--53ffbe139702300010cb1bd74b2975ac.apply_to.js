answer = false;
// list of tables is in an immutable Java ArrayList...
var tables_raw = GlideDBObjectManager.getTables(table_name);
var tables = [];
for (var i = 0; i < tables_raw.size(); i++)
	tables.push('' + tables_raw.get(i));
if (tables.length >= 2)
	answer = ('cmdb_ci_appl' == tables[tables.length - 2]);
