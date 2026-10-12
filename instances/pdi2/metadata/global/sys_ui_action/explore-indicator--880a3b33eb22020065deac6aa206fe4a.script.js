var uuid = current.sys_id;
if (current.default_aggregate && current.default_aggregate !== '')
	uuid = uuid + ':' + current.default_aggregate;
action.setRedirectURL('$pa_detailed.do?jvar_uuid=' + uuid);
