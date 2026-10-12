// Count the number of custom(u_*) tables 
// that extend service creator tables (service_task)
var cnt = 0;
var gr = new GlideRecord("sys_db_object");
gr.addQuery("name", "STARTSWITH", "u_");
gr.query();
while(gr.next()) {
	var tblName = gr.name;
	var baseTbls = GlideDBObjectManager.getTables(tblName);
	if (baseTbls.indexOf('service_task') >= 0)
		cnt++;
}
answer = cnt;
