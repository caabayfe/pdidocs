var answer = g_uri.toString();
var formDefn = true;
var sys_id = g_request.getParameter('sys_id');
var instance = new GlideRecord("asmt_assessment_instance");
var view = g_request.getParameter('sysparm_view') + '';
if (instance.get(sys_id)) {
	if (g_request.getParameter('sysparm_record_list')) {
		//Check if the survey instance is complete and take the user directly to View User's Response Page
		var query = g_request.getParameter('sysparm_record_list');
		var querySplit = query.split('\\^');
		for(var i = 0; i < querySplit.length; i++) {
			if (querySplit[i].indexOf('state') === 0) {
				var instanceState = querySplit[i].substring(querySplit[i].indexOf('=') + 1);
				if (instanceState == 'complete')
					formDefn = false;
			}
		}
	} else if (sys_id) {
		//While clicking on information button for the row and open record, some parameters are not set
		if (instance.getValue('state') == 'complete')
			formDefn = false;
	}

	if ((view === 'survey' || view === 'assessment' || view === 'quiz') && !formDefn) {
		g_uri.set('sysparm_assessable_sysid', sys_id);
		g_uri.set('sysparm_assessable_type', instance.getValue('metric_type'));
		g_uri.set('sysparm_reader_view', 'true');
		g_uri.set('sysparm_instance','true');
		answer = g_uri.toString('assessment_take2.do');
	}
}
answer;
