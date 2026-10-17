var sys_id = current.getValue('sys_id');
var url = "/wf_condition_list.do?sysparm_view=workflow_activity_conditionals&sysparm_query=activity=" + sys_id;
gs.setRedirect(url);
