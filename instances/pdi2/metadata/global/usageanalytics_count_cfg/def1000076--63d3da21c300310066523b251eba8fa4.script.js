// Count the number of custom(u_*) tables
// that extend task directly
var cnt = 0;
var gr = new GlideRecord("sys_db_object");
gr.addQuery("name", "STARTSWITH", "u_");
gr.query();
while(gr.next()) {
	var extendsTableName = gr.super_class.name + '';
	if (extendsTableName == 'task' )
		cnt++;
}
answer = cnt;
