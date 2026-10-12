var configSysID = action.getGlideURI().get('sysparm_collectionID');

action.setRedirectURL('sys_ux_predicate_m2m_action_assignment.do?sys_id=-1&sysparm_query=predicate=' + configSysID);

var configGR = new GlideRecord("sys_ux_composite_data_template_predicate");
configGR.get(configSysID);
action.setReturnURL(configGR);
