(function executeRule(current, previous /*null when async*/ ) {

	var parameterScreenHelper = new SGParameterScreenHelper();
	var parameterizedScreenClasses = parameterScreenHelper.getParameterizedScreenClasses();

	// Using INNER JOIN, querying all these tables to see which have a reference to the current parameter screen
    var ga = new GlideAggregate('sys_sg_screen');
    ga.addAggregate('COUNT');
    var q;
    for (var i = 0; i < parameterizedScreenClasses.length; i++) {
        var screenClass = parameterizedScreenClasses[i];
        if (!q) {
            q = ga.addQuery('ref_' + screenClass + '.parameter_screen', current.getUniqueValue());
        } else {
            q.addOrCondition('ref_' + screenClass + '.parameter_screen', current.getUniqueValue());
        }
    }

    ga.query();
    ga.next();
    if (parseInt(ga.getAggregate('COUNT')) > 0) {
        current.setAbortAction(true);
        gs.addErrorMessage(gs.getMessage('Presentation Style cannot be set to "Screen" as this Input Form Screen is configured to be used with Parameterized Screens. To see the full list of Parameterized Screens that use this Input Form Screen, <a target="_blank" href="/sys_sg_screen_list.do?sysparm_query={0}"> Click here. </a>', ga.getEncodedQuery()));
    }


})(current, previous);
