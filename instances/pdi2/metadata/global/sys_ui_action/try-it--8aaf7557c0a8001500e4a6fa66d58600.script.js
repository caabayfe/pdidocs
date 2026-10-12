current.update();
var view = action.get('sysparm_view');
action.setRedirectURL('expert_shell.do?sysparm_sys_id=' + current.sys_id + '&sysparm_initial=true&sysparm_view=' + view);
action.setNoPop(true);
