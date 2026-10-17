var sample_metric_id = current.metric_type.sample_metric + '';
var metric_id = current.getUniqueValue();
var canSurveyCreatorDelete = true;
if (gs.hasRole('survey_creator')) {
	if ((current.category.qb_evaluation_method+"") == "" && ((current.metric_type+"") != "" && (current.metric_type.survey_owners+"").indexOf(gs.getUserID()) !== -1))
		canSurveyCreatorDelete = true;
	else 
		canSurveyCreatorDelete = false;
}
answer = !(sample_metric_id && sample_metric_id === metric_id) && (new AssessmentUtils()).canDeleteMetric(current) && canSurveyCreatorDelete;
