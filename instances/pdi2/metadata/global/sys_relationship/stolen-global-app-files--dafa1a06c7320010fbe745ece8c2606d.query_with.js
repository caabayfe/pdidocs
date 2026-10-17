var missing_files = sn_gfiles.ClaimAPI.computeStolenRecordList(parent.sys_id);
if(missing_files == "" || missing_files.includes(","))
	current.addQuery("sys_update_name", "IN", missing_files);
else 
	current.addQuery("sys_update_name", "=", missing_files);
