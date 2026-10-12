createStakeholder(current);

function createStakeholder(record) {
	
	var catAssess = new GlideRecord("asmt_m2m_category_assessment");
	catAssess.addQuery("category", record.metric_category.sys_id);
	catAssess.query();
	while (catAssess.next()){
			var assessmentSys = catAssess.assessment_record.sys_id;
			new AssessmentUtils().createStakeholders(/*categoryUserSys*/record.sys_id, assessmentSys);
	}
}
