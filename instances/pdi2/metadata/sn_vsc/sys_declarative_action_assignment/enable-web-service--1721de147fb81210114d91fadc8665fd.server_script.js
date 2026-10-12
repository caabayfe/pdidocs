// updateUserRecord();
var gr = new GlideRecord('sys_user');
gr.addQuery('sys_id', current.user);
gr.query();
if (gr.next()) {
    gr.web_service_access_only = true;
    gr.update();
}
current.update();
