addStakeholders(current);

function addStakeholders(record) {
	var catUser = new GlideRecord("asmt_m2m_category_user");
	catUser.addQuery("metric_category", record.sys_id);
	catUser.query();
	while (catUser.next()){
		var catAssess = new GlideRecord("asmt_m2m_category_assessment");
		catAssess.addQuery('category', record.sys_id);
		catAssess.query();
		while(catAssess.next()) {
			new AssessmentUtils().createStakeholders(/*categoryUserSys*/catUser.sys_id, catAssess.assessment_record);
		}
	}
}
