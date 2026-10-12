changeMinMaxInTemplates();


function changeMinMaxInTemplates() {
	
	//find unpublished assessments which use this template
	var gr = new GlideRecord('asmt_metric_type');
	gr.addQuery('publish_state','draft');
	gr.addQuery('evaluation_method', 'assessment');
	gr.query();
	
	
	while (gr.next()) {
		//find metrics which use this template
		var metricGr = new GlideRecord('asmt_metric');	
		metricGr.addQuery('evaluation_method', 'assessment');
		metricGr.addQuery('metric_type',gr.sys_id);
		metricGr.addQuery('datatype', 'template');
		metricGr.addQuery('template', current.template);
		metricGr.query();
		
		while (metricGr.next()) {
			//update min and max to new values
			var minMax = new AssessmentUtils().getTemplateMinMax(current.template);
			metricGr.min = minMax.min;
			metricGr.max = minMax.max;
			metricGr.update();
		}
	}
}
