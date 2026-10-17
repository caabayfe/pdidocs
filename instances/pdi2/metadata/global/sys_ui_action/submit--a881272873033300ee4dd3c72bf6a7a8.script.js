var bs = new GlideRecord("cmdb_ci_service");
bs.addEncodedQuery(current.query);
bs.addQuery("sys_class_name", "cmdb_ci_service");
bs.orderBy("busines_criticality");
bs.query();
while(bs.next()){
	var service = new GlideRecord("cmdb_convert_bulk_services_entry");
	service.addQuery("service", bs.getValue("sys_id"));
	service.query();
	if(service.hasNext())
		continue;
	var record = new GlideRecord("cmdb_convert_bulk_services_entry");
	record.initialize();
	record.setValue("service", bs.getValue("sys_id"));
	record.setValue("bulk_transform", current.getValue("sys_id"));
	record.insert();
}
current.status = "READY";
current.progress = 0;
current.insert();
action.setRedirectURL(current);
