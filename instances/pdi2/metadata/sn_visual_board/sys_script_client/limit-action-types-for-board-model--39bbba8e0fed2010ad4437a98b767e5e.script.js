function onLoad() {
    var actionModel = g_form.getValue('model');
    //hide value for non values
    if (actionModel === '45757de50fa52010ad4437a98b767e33') {
        g_form.removeOption('declarative_action_type', 'dispatch_action');
        g_form.removeOption('declarative_action_type', 'action_component');
        g_form.removeOption('declarative_action_type', 'server_script');
    }
}
