onDemandAssignToAssessors(current);

function onDemandAssignToAssessors(asmtMetricType) {
	var assessors = [];

	// Get all assessable records that has been used for current assessment.
	var metricCategory = new GlideRecord("asmt_metric_category");
	metricCategory.addQuery("metric_type", asmtMetricType.sys_id);
	metricCategory.query();
	while (metricCategory.next()) {
		var catAsmt = new GlideRecord("asmt_m2m_category_assessment");
		catAsmt.addQuery("category", metricCategory.sys_id);
		catAsmt.query();
		while (catAsmt.next()) {
			var ar = new GlideRecord("asmt_assessable_record");
			ar.get(catAsmt.assessment_record);
			
			// Get assessors from selected user field of source table
			var source = new GlideRecord(ar.source_table);
			source.get(ar.source_id);
			var user_id = source.getElement(asmtMetricType.user_field).toString();
			var userIdArr = user_id.split(",");
			for (var i = 0; i < userIdArr.length; i++) {
				if (GlideStringUtil.isEligibleSysID(userIdArr[i])) {
					assessors.push(userIdArr[i]);
				}
			}
		}
	}

	// Send assessment to assessors
	var sum = 0;
	assessors = removeDuplicatesAndEmpties(assessors);
	for (var i = 0; i < assessors.length; i ++)
		sum += doAssessment(asmtMetricType.sys_id, assessors[i]);

	// Show message on page
	if (sum > 0)
		gs.addInfoMessage(gs.getMessage('Invited {0} assessors to take the assessment.', sum + ''));
	else
		gs.addInfoMessage(gs.getMessage('No assessors sent for the assessment'));
}

function doAssessment(metricTypeId, new_user) {
	new SNC.AssessmentCreation().addRecentAssessor(new_user);

	var instanceId = new SNC.AssessmentCreation().createAssessments(metricTypeId, "", new_user);

	var gr = new GlideRecord("asmt_assessment_instance");
	var success = gr.get(instanceId.substring(0,32));
	if(success)
		return 1;
	return 0;
}

function removeDuplicatesAndEmpties(arr){
	var unique_array = [];
	for(var i = 0; i < arr.length; i++){
		if(arr[i] && unique_array.indexOf(arr[i]) == -1)
			unique_array.push(arr[i]);
	}
	return unique_array;
}
