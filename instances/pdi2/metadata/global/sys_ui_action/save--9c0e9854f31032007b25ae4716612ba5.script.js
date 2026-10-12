(function(current, action) {
	var redir = function() {
	    var url = 'cmdb_ci_service_discovered.do?sys_id='+current.getUniqueValue()+'&sysparm_view=Default&20view';
		action.setRedirectURL(url);
	};
	
    redir();
    current.update();
    if (! current.isActionAborted())
        redir();
})(current, action);
