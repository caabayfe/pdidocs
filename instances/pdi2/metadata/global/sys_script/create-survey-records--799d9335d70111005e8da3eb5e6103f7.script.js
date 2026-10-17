createSurveyHeaderParts();

function createSurveyHeaderParts() {
	var metricTypeRecord = createAssessmentMetricType();
	createAssessableRecord(metricTypeRecord);
	createAssessmentCategory(metricTypeRecord);
}

function createAssessmentMetricType() {
	var metricTypeRecord = new GlideRecord('asmt_metric_type');
	metricTypeRecord.get(current.getUniqueValue());
	metricTypeRecord.scale_factor = 10;
	metricTypeRecord.table = 'asmt_metric_type';
	metricTypeRecord.display_field = 'name';
	metricTypeRecord.condition = 'sys_id=' + current.getUniqueValue() + '^EQ';
	
	var getRoles = [];
	if (metricTypeRecord.roles)
		getRoles = metricTypeRecord.roles.split(',');
	
	if (getRoles.length === 0) {
		getRoles.push("survey_admin");
		getRoles.push("survey_reader");
	} else {
		if (getRoles.indexOf("survey_admin") === -1)
			getRoles.push('survey_admin');
		
		if (getRoles.indexOf("survey_reader") === -1)
			getRoles.push('survey_reader');
		
	}
	metricTypeRecord.roles = getRoles.toString();
		
	metricTypeRecord.update(); // force business rule to apply
	
	return metricTypeRecord;
}

function createAssessmentCategory(metricTypeRecord) {
	//This is to avoid the category creation when the ui action is clone
	var assessmentAction = SNC.NGAssessmentUtil.getAssessmentAction();
	var skipActions = 'clone, SAVE, SAVE_AND_PUBLISH';
	if (assessmentAction && skipActions.indexOf(assessmentAction) > -1)
		return;
	
	var assessmentCategoryRecord = new GlideRecord('asmt_metric_category');
	var surveyId = metricTypeRecord.sys_id;
	var surveyName = metricTypeRecord.name;

	assessmentCategoryRecord.name = surveyName;
	assessmentCategoryRecord.order = 1;
	assessmentCategoryRecord.metric_type = surveyId;
	assessmentCategoryRecord.weight = 10;
	assessmentCategoryRecord.filter = 'sys_id=' + surveyId + '^EQ';
	assessmentCategoryRecord.table = metricTypeRecord.table;
	assessmentCategoryRecord.insert();
}

function createAssessableRecord(metricTypeRecord) {
	(new SNC.AssessmentCreation()).createAssessableRecords(metricTypeRecord);
}
