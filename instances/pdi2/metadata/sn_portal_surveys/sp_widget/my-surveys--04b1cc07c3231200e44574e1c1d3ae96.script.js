(function() {
  // populate the 'data' object
  // e.g., data.table = $sp.getValue('table');
	data.maxRecords = options.maxRecords || 5;
	var sp = new SPSurveyAPI();
	options.showAll = $sp.getParameter('id') == 'my_surveys';
	if($sp.getParameter('id') != 'my_surveys'){
		if(options.widgetTitle && options.widgetTitle.length>0){
			data.widgetTitle = gs.getMessage(options.widgetTitle);
		}else{
			data.widgetTitle = gs.getMessage("My Assessments and Surveys");
		}
		data.encodedWidgetTitle = encodeURIComponent(data.widgetTitle);
	} else{
		data.widgetTitle = $sp.getParameter('title') ? gs.getMessage($sp.getParameter('title')) : gs.getMessage("My Assessments and Surveys");
	}
	
	sp.getSurveys(data.maxRecords, options.showAll, data, true);
	data.instances.forEach(function(instance) {
		if (!!instance.description)
			instance.description = $sp.stripHTML(instance.description);
			var percentAnswered = parseInt(instance.portal_progress).toFixed(0) + '%';
		  instance.progress_text = gs.getMessage("{0} complete", percentAnswered);
		  instance.due_display_message = instance.due_display;
		  if (instance.due_days < -1)
		    instance.due_display_message = gs.getMessage("Due in {0} days",(0-instance.due_days) + '');
		  else if (instance.due_days == -1)
		    instance.due_display_message = gs.getMessage("Due in 1 day");
	});

})();
