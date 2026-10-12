// if the category is being added to an existing survey
// get all other categories, and grab their users
// add users to this category in asmt_m2m_category_user table
syncUsers(current);

function syncUsers(record) {	
	// verified that the metric type this category is a survey
	// get all users in categories tied to this survey
	var ga = new GlideAggregate('asmt_m2m_category_user');
	ga.groupBy('user');
	ga.addQuery('metric_category.metric_type', current.metric_type);
	ga.query();
		
	while(ga.next()) {
		var m2mGr = new GlideRecord('asmt_m2m_category_user');
		m2mGr.setValue('user', ga.getValue('user'));
		m2mGr.setValue('metric_category', current.getValue('sys_id'));
		m2mGr.insert();
	}
}
