var viewConfigSysID = action.getGlideURI().get('sysparm_collectionID');

gs.getSession().putClientData('view_config_for_action_for', viewConfigSysID);

/* Go to the form to create a new Declarative action */
action.setRedirectURL('sys_declarative_action_assignment.do?sys_id=-1&sysparm_query=model=035d270073151010c342d5fdbdf6a715&config=' + viewConfigSysID);

/* Return to this View config form when done */
var viewConfigGR = new GlideRecord("sys_ux_composite_data_template_predicate");
viewConfigGR.get(viewConfigSysID);
action.setReturnURL(viewConfigGR);
