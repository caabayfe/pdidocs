function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue == '')
		return;
	
	switch (newValue) {
		case 'custom':
		case 'long':
			g_form.setValue('min', 0);
			g_form.setValue('max', 10);
			break;
		
		case 'percentage':
			g_form.setValue('min', 0);
			g_form.setValue('max', 100);
			break;
		
		case 'choice':
		case 'scale':
			var ansMinMax = getAnswerMinAndMax();
			
			g_form.setValue('min', ansMinMax[0]);
			g_form.setValue('max', ansMinMax[1]);
			break;
							
		case 'numericscale':			
		case 'rating':
			g_form.setValue('min', 0);
			g_form.setValue('max', 5);
			break;
			
		case 'template':
			var template = g_form.getReference("template");
			if (template && template.sys_id != undefined) {
				var ga = new GlideAjax('AssessmentUtilsAJAX');
				ga.addParam('sysparm_name', 'getTemplateMinMax');
				ga.addParam('sysparm_template', template.sys_id);
				ga.getXML(ajaxResponse);
			}
			break;
	}
}

function ajaxResponse(serverResponse) {
	var result = serverResponse.responseXML.getElementsByTagName("result");
	g_form.setValue('min', result[0].getAttribute("min"));
	g_form.setValue('max', result[0].getAttribute("max"));
}

function getAnswerMinAndMax() {
	var minMax = [];
	var min;
	var max;
	var answerRec = new GlideRecord('asmt_metric_definition');
	answerRec.addQuery('metric', g_form.getUniqueValue());
	answerRec.orderBy('value');
	answerRec.query();
	
	if (answerRec.next()) {
		min = answerRec.value; // first record is the min
		answerRec.loadRow(answerRec.rows[answerRec.rows.length - 1]); // move to last record
		max = answerRec.value; // last record is max
	} else {
		min = 0;
		max = 0;
	}
	
	minMax[0] = min;
	minMax[1] = max;
	return minMax;
}
