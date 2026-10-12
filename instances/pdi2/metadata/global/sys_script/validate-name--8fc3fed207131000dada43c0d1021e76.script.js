validateName();

function validateName() {

    var gr = new GlideRecord('sys_rest_message_fn');
    gr.addQuery('function_name', '' + current.function_name);
    gr.addQuery('rest_message', current.rest_message);
    gr.query();
    if (gr.next() && gr.sys_id != current.sys_id) {
        current.setAbortAction(true);
        gs.addErrorMessage('The function ' + current.function_name + ' is already defined');
        return;
    }
}
