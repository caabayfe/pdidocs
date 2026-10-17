(function(action) {
	var ciRef = parent.sys_id;
	var baseURL = "/cmdb_rel_team.do";
	var ciParamString = "?sysparm_ci=" + ciRef;
    action.setRedirectURL(baseURL + ciParamString);
})(action);
