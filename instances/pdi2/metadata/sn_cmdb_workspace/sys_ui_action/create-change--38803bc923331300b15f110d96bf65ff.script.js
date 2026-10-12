if(current){
	var change = new GlideRecord("change_request");
	change.newRecord();
	change.cmdb_ci = current.sys_id;
	action.openGlideRecord(change);
}
