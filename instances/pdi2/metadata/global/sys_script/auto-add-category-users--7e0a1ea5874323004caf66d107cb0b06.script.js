(function executeRule(current, previous /*null when async*/) {
	var asmtUtil = new global.AssessmentUtils();
	
	// Get category
	var metricCategory = new GlideRecord("asmt_metric_category");
	metricCategory.get(current.category);
	
	// Get assessable record
	var assessableRecord = new GlideRecord("asmt_assessable_record");
	assessableRecord.get(current.assessment_record);
	
	// Get asmt metric type
	var metricType = new GlideRecord("asmt_metric_type");
	metricType.get(metricCategory.metric_type);
	
	// Get user(assessor) from assessable record
	var userIds = asmtUtil.getAssessorFromAssessableRecord(assessableRecord.sys_id, metricType.user_field);
	
	if (!userIds)
		return;
	var userIdsrArr = userIds.split(",");
	var catUsers = [];
	for (var i=0 ; i < userIdsrArr.length; i++) {
		if (GlideStringUtil.isEligibleSysID(userIdsrArr[i])) {
			// Generate category user and assign it to assessable record
			catUsers.push(asmtUtil.createCategoryUser(metricCategory.sys_id, userIdsrArr[i]));
		}
	}
	for (var j=0 ; j < catUsers.length; j++) {
		// Create a new stakeholder if not existing
		asmtUtil.createStakeholders(catUsers[j].sys_id, assessableRecord.sys_id);
	}
	
})(current, previous);
