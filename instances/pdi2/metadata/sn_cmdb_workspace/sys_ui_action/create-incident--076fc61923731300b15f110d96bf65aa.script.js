if(current){
	var incident = new GlideRecord("incident");
	incident.newRecord();
	incident.cmdb_ci = current.sys_id;
	action.openGlideRecord(incident);
}
