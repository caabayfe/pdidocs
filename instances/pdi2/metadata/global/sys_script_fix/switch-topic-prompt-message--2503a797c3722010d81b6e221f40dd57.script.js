setPromptMessage();

function setPromptMessage() {
    var gr = new GlideRecord('sys_cs_general_settings');
    gr.addQuery('sys_domain', 'global');
    gr.query();
    while (gr.next()) {
        gr.setValue('auto_select_prompt_message', "You'd like help with {Topic name}. Is that right?");
        gr.update();
    }
}
