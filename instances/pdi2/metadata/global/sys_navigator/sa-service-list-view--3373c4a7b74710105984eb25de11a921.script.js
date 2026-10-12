var gr = new GlideRecord('sa_service_list_view');
var rowId = g_request.getParameter('sys_id');
gr.get(rowId);
g_uri.set('sys_id', gr.getValue('ci_sys_id'));
answer = g_uri.toString('cmdb_ci.do');
answer;
