function onBefore(current, previous) {
	var action = SNC.NGAssessmentUtil.getAssessmentAction();
	if (action == "SAVE" || action == "SAVE_CLONE" || action == "DELETE_CLONE" || action == "SAVE_AND_PUBLISH" || action == "clone")
		return;
	if (current.operation() == 'delete')
		removeAllNumericScaleAnswers();
	//PRB1320939: scorecard shows empty response if numeric scale question gets updated. Do not update unless min or max is changed.
	else if (current.operation() == 'update' && current.min == previous.min && current.max == previous.max)
		return;
	else{
		var metricDefGR = new GlideRecord('asmt_metric_definition');
		metricDefGR.addQuery('sys_id','IN',current.correct_answer_choice);
		metricDefGR.query();
		var correctAnswerValueList = [];
		while(metricDefGR.next()){
			correctAnswerValueList.push(parseInt(metricDefGR.value));
		}
		removeNumericScaleAnswers();
		var correctAnswerIdList = createNumericScaleAnswers(correctAnswerValueList);
		current.correct_answer_choice = correctAnswerIdList.join();
	}
}

function removeAllNumericScaleAnswers() {
	var answers = new GlideRecord('asmt_metric_definition');
	answers.addQuery('metric', current.sys_id);
	answers.deleteMultiple();
}

function removeNumericScaleAnswers() {
	var answers = new GlideRecord('asmt_metric_definition');
	answers.addQuery('metric', current.sys_id);
	answers.query();
	while (answers.next()) {
		var answerValue = answers.getValue('value');
		if (answerValue < current.min || answerValue > current.max)
			answers.deleteRecord();
	}
}

function createNumericScaleAnswers(correctAnswerValueList) {
	var correctAnswerIdList = [];
	
	var existingAnswerList = [];
	var existingAnswers = new GlideRecord('asmt_metric_definition');
	existingAnswers.addQuery('metric', current.sys_id);
	existingAnswers.orderBy('value');
	existingAnswers.query();
	while (existingAnswers.next()) {
		var answerValue = parseInt(existingAnswers.getValue('value'));
		existingAnswerList.push(answerValue);
		if (correctAnswerValueList.indexOf(answerValue) >= 0)
			correctAnswerIdList.push(existingAnswers.getUniqueValue());
	}
		
	var newAnswer = new GlideRecord('asmt_metric_definition');
	for (var i = current.min; i <= current.max; i++) {
		if (existingAnswerList.indexOf(parseInt(i)) != -1)
			continue;
		
		newAnswer.initialize();
		newAnswer.metric = current.sys_id;
		newAnswer.display = i.toString();
		newAnswer.value = i;
		newAnswer.order = i;
		newAnswer.insert();
		if(correctAnswerValueList.indexOf(parseInt(i)) >= 0){
			correctAnswerIdList.push(newAnswer.getUniqueValue());
		}
	}
	return correctAnswerIdList;
}
