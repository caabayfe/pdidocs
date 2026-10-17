createAssessableRecord(current);

function createAssessableRecord(metricTypeRecord) {
	if (metricTypeRecord.scale_factor == 0)
		metricTypeRecord.scale_factor = 10;
	if (!metricTypeRecord.table || !metricTypeRecord.display_field  || !metricTypeRecord.condition) {
		metricTypeRecord.table = 'asmt_metric_type';
		metricTypeRecord.display_field = 'name';
		metricTypeRecord.condition = 'sys_id=' + metricTypeRecord.sys_id + '^EQ';
	}
	metricTypeRecord.update();
	
	createAssessmentCategory(metricTypeRecord);
	
	(new SNC.AssessmentCreation()).createAssessableRecords(metricTypeRecord);
}

function createAssessmentCategory(metricTypeRecord) {
	//This is to avoid the category creation when the ui action is clone
	var assessmentAction = SNC.NGAssessmentUtil.getAssessmentAction();
	
	if(assessmentAction != "clone"){
	
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
}
