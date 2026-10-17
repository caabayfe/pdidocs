answer = false;
var gr = new GlideRecord('sys_cs_provider');
gr.addQuery('message_order', true);
gr.query();
if (gr.next()) {
    answer = true;
}
