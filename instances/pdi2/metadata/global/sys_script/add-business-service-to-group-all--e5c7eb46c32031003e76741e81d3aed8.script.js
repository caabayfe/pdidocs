var memberGr = new GlideRecord('sa_service_group_member');
memberGr.addQuery('service', current.sys_id);
memberGr.query();
if (!memberGr.hasNext()) {
	addServiceToAllGroup(current);
}

function addServiceToAllGroup(current) {
	var gr = new GlideRecord("cmdb_ci_service_group");
		gr.addQuery("name", "All");
		gr.query();
		if (gr.hasNext()) {
			gr.next();
			var memberGr = new GlideRecord("sa_service_group_member");
			memberGr.initialize();
			memberGr.setValue("service", current.sys_id);
			memberGr.setValue("service_group", gr.sys_id);
			memberGr.insert();
		} else 
			gs.print("group All not found");
}
