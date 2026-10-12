(function(current, action) {
    var redir = function() {
		var viewType = '' + gs.getSession().getClientData('ts_view');
		gs.getSession().putClientData('ts_view', null);
		if (viewType == 'EM') {
			action.setRedirectURL('cmdb_ci_query_based_service.do?sys_id='+current.getUniqueValue()+'&sysparm_view=event_management_TBS');
		} else if (viewType == 'SM') {
			action.setRedirectURL('cmdb_ci_query_based_service.do?sys_id='+current.getUniqueValue()+'&sysparm_view=null');
		}
    };
    
	//redir();
	if (current.isNewRecord())
		current.insert();
	else
	    current.update();
    if (! current.isActionAborted())
        redir();
	
})(current, action);
