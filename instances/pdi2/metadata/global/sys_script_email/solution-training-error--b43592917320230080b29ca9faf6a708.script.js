(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {
	
	var sysExecutionTrackerGr = getErrorExecutionTracker(current);
	if (!JSUtil.nil(sysExecutionTrackerGr)) {
		template.print('Failure State: ' + sysExecutionTrackerGr.name);
		template.print('<br/><br/>');
		template.print('Failure Message: ' + sysExecutionTrackerGr.message);
	}
	
})(current, template, email, email_action, event);

function getErrorExecutionTracker(mlSolutionGr) {
	var gr = new GlideRecord('sys_execution_tracker');
	gr.addQuery('parent', mlSolutionGr.progress_tracker);
	gr.addQuery('state', 3); // 3 means failed
	gr.query();
	return gr.next() ? gr : null;
}
