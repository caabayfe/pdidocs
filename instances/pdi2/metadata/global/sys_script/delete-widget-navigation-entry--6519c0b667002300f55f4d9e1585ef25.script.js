(function executeRule(current, previous /*undefined when async or display*/) {

	var wigNavGr = new GlideRecord('widget_navigation');
	wigNavGr.addQuery('widget', current.sys_id);
	wigNavGr.query();
	while(wigNavGr.next()){
		wigNavGr.deleteRecord();
		gs.addDebugMessage('Widget Navigation for pa_widgets ' + current.sys_id + ' is deleted');
	}

})(current, typeof previous != 'undefined' ?  previous : null);
