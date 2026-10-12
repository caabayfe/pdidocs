// save any updates
current.update();

var table = current.intercepts.toString().split(".")[0];
action.setRedirectURL("wizard_view.do?sys_target=" + table + "&sysparm_stack=" + table + "_list.do&sysparm_wizardAction=sysverb_new&sysparm_parent=" + current.sys_id);
