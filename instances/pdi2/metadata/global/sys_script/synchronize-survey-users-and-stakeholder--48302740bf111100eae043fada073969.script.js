syncUsers(current);

// this metric type is a survey, keep other categories in sync regarding users
function syncUsers(record) {	
	// starting with metric type (the survey), find all categories that have this type
	var grCategory = new GlideRecord('asmt_metric_category');
	grCategory.addQuery('metric_type', current.metric_category.metric_type.sys_id);
	grCategory.query();
	
	if (grCategory.getRowCount() == 0)
		return;
	
	// for each category with this metric type, make sure to only delete users that are in categories under this particular survey
	while (grCategory.next()) {
		var grCatUser = new GlideRecord('asmt_m2m_category_user');
		grCatUser.addQuery('metric_category', grCategory.sys_id);
		grCatUser.addQuery('user', record.user);
		grCatUser.query();

		if (record.operation().equals('insert') && grCatUser.getRowCount() == 0) {
			// if it's an insert, go through each category, check if that user already exists
			// if that category does not already have this user, add a new record with this category/user
			var newCatUser = new GlideRecord('asmt_m2m_category_user');
			newCatUser.user = record.user;
			newCatUser.metric_category = grCategory.sys_id;
			newCatUser.insert();
		} else if (record.operation().equals('delete') && grCatUser.getRowCount() > 0) {
			// if it's a delete, go through each category, find each category_user with the same user name and same category, and delete
			while (grCatUser.next() )  {
				grCatUser.deleteRecord();
			}
		}
	}
}
