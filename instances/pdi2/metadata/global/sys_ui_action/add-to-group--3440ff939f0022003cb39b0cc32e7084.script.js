gs.getSession().putClientData('em_add_parent_id', parent.sys_id);
gs.getSession().putClientData('em_add_parent_number', parent.number);

action.setRedirectURL('/em_alert_list.do?sysparm_view=add_to_group&sysparm_fixed_query=correlation_group!=1^parent!=' + parent.sys_id+"^ORparentISEMPTY^sys_id!=" + parent.sys_id + "^state!=Closed&sysparm_query=maintenance=false");

gs.addInfoMessage(gs.getMessage("Select the alerts you need to add as a secondary to {0} and then click \"Add Selected\" action ", parent.number));
