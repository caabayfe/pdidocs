var gr = new GlideRecord("cmdb_ci_service_auto");
gr.query();
var im = new SNC.ImpactManager();
while(gr.next()) {
	im.notifyHashOnCreation(gr.sys_id);
}
