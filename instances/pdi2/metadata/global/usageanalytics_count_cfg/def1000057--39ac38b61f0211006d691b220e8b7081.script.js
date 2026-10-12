// Count the number of custom(u_*) tables
// that extend from an OOB table other than task.
var cnt = 0;
var gr = new GlideRecord("sys_db_object");
gr.addQuery("name", "STARTSWITH", "u_");
gr.query();
while(gr.next()) {
	var extendsTableName = gr.super_class.name + '';
	if (extendsTableName.length > 0 && !extendsTableName.startsWith('u_')
		&& extendsTableName != 'task' && extendsTableName != 'sys_import_set_row')
		cnt++;
}
answer = cnt;
