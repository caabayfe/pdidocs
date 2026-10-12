(function () {
	if (!options.table)
		return;
	
	data.filter = options.filter || 'sys_id!=NULL';

	// Kill switch for DEF0878626. Defaults to true.
	// Setting to false reinstates the pre-fix, ACL-blind behavior instance-wide as an emergency
	// escape hatch only - every exploit path closed by DEF0878626 becomes exploitable again while
	// this is false.
	if (gs.getProperty('glide.service_portal.count_widget.enforce_acl', 'true') == 'false') {
		var ga = new GlideRecordCounter(options.table);
		ga.addEncodedQuery(data.filter);
		data.count = ga.getCount();
	} else {
		var gr = new GlideRecordSecure(options.table); // does ACL checking
		gr.addEncodedQuery(data.filter, true); // enforce field ACLs on the caller-supplied filter
		gr.query();
		data.count = gr.getRowCount();
	}
})()
