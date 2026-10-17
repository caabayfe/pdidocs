var html = new AssessmentUtils().getInstanceLinkHTML(current);
if(!!current.metric_type.sample_metric)
	template.print('<p> To take the survey, click the following image: </p>');
template.print(html);  
