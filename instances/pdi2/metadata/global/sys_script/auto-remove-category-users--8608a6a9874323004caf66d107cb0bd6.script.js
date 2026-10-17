(function executeRule(current, previous /*null when async*/) {
	var asmtUtil = new global.AssessmentUtils();
	
	// Get category
	var metricCategory = new GlideRecord("asmt_metric_category");
	metricCategory.get(previous.category);
	
	// Get assessable record
	var assessableRecord = new GlideRecord("asmt_assessable_record");
	assessableRecord.get(previous.assessment_record);
	
	// Get asmt metric type
	var metricType = new GlideRecord("asmt_metric_type");
	metricType.get(metricCategory.metric_type);
	
	// Get user(assessor) from assessable record
	var userIds = asmtUtil.getAssessorFromAssessableRecord(assessableRecord.sys_id, metricType.user_field);
	
	if (!userIds)
		return;
	var userIdsrArr = userIds.split(",");
	for (var i=0 ; i < userIdsrArr.length; i++) {
		if (!GlideStringUtil.isEligibleSysID(userIdsrArr[i]))
			continue;
		// Remove category user from metric category
		var catUser = asmtUtil.getM2mCategoryUserByCategoryAndUser(metricCategory.sys_id, userIdsrArr[i]);
		if (catUser.next()) {
			// Check if there is other assessable record using this category user; If not, remove this category user from metric category
			var catAsmt = asmtUtil.getM2mCategoryAssessmentByCategory(metricCategory.sys_id);
			var catAsmtRec = [];
			while (catAsmt.next()) {
				if (catAsmt.assessment_record == assessableRecord.sys_id)
					continue;
				catAsmtRec.push(catAsmt.assessment_record + '');
			}
			//If there is only one assessable record using this category user (the removed one), we can delete this category user from current metric category
			var stakeholder = new GlideRecord("asmt_m2m_stakeholder");
			stakeholder.addQuery("category_user", catUser.sys_id);
			stakeholder.addQuery("assessment_record", "IN", catAsmtRec);
			stakeholder.setLimit(1);
			stakeholder.query();
			if (!stakeholder.hasNext()) {
				catUser.deleteRecord();
			}
		}
	}
	
})(current, previous);
