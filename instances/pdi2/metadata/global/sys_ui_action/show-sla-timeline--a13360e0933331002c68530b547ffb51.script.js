var slaUtilSNC = new SLAUtilSNC();
//duplicating last(top) url in stack as setRedirectURL is removing current form url from stack
slaUtilSNC.duplicateLastUrlInGlideStack('default');
action.setRedirectURL('$sla_timeline.do?sysparm_task_sys_id=' + current.task + '&sysparm_sla_filter=' + current.sla);
