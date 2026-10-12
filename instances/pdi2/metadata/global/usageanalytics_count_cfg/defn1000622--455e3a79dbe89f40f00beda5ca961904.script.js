var gr = new GlideRecord('ua_instance_state');
gr.query();

var dbSize = 0;

if (gr.next()) {
	var dbSize = gr.getValue('primary_db_size_mb');
	if (JSUtil.nil(dbSize))
		dbSize = 0;
}

answer = dbSize;
