//Clean up VM instances
gr = new GlideRecord("cmdb_ci_hyper_v_instance");
gr.addQuery("server", current.sys_id);
gr.deleteMultiple();

//Clean up resource pools, virtual networks
gr = new GlideRecord("cmdb_ci_hyper_v_resource_pool");
gr.addQuery("server", current.sys_id);
gr.deleteMultiple();

gr = new GlideRecord("cmdb_rel_ci");
gr.addQuery("type", "4afd799338a02000c18673032c71b817"); //Provided by
gr.addQuery("child", ""+current.sys_id);
gr.query();

var networksToDelete = [];
while(gr.next())
	networksToDelete.push(""+gr.parent);

gr = new GlideRecord("cmdb_ci_hyper_v_network");
gr.addQuery("sys_id", networksToDelete);
gr.deleteMultiple();
