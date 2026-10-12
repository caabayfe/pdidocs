createStakeholdersForAssessment(current);

function createStakeholdersForAssessment(record) {
	var catUser = new GlideRecord("asmt_m2m_category_user");
	catUser.addQuery("metric_category", record.category.sys_id);
	catUser.query();
	while (catUser.next()){
			new AssessmentUtils().createStakeholders(/*categoryUserSys*/catUser.sys_id, /*assessableSys*/record.assessment_record.sys_id);
	}
}
