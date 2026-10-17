var bucket_sysid;
createRecords();

function createRecords() {
	var bucket = new GlideRecordSecure("pa_bucket_groups");
	bucket.name = new_name;
	bucket_sysid = bucket.insert();
	
	var dim = new GlideRecordSecure("pa_dimensions");
	dim.name = new_name;
	dim.facts_table = 'pa_buckets';
	dim.conditions = 'bucket_group=' + bucket_sysid;
	if(!dim.insert())
		gs.addErrorMessage(gs.getMessage("Insufficient permissions to create new Bucket Group and/or new Breakdown Source"));
}

response.sendRedirect('pa_bucket_groups.do?sys_id=' + bucket_sysid);
