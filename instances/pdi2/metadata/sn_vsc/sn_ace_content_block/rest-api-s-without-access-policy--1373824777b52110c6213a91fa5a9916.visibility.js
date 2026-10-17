var gr = new GlideRecord('sys_script_include');
// get the access of RESTAPIServiceInfo 
if (gr.get('694a273e670210106fcfecccb585ef08')) {
    accessVal = gr.getValue("access");
}
answer = accessVal === 'public';
