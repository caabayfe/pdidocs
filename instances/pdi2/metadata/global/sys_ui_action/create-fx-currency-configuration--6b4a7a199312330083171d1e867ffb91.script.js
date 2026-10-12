var tableName = encodeURI("target_table="+current.name);
var url = encodeURI("fx_configuration.do?sys_id=-1&sysparm_query=" + tableName);
action.setRedirectURL(url);
