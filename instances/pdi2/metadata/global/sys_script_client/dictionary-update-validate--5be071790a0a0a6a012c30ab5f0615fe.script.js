function onSubmit() {
    // clear errors if any exist
    g_form.hideFieldMsg("name");
    g_form.hideFieldMsg("element");

    // allow creation of new records
    if (g_form.newRecord)
        return;

    var action = g_form.getActionName();
    if (action == 'sysverb_insert' || action == 'sysverb_insert_and_stay')
        return;

    // disallow name or element change for existing records
    var answer = true;
    var o_element = $('sys_original.sys_dictionary.element');
    var c_element = g_form.getValue('element');
    if (o_element.value != c_element && g_scratchpad.appsPluginInstalled !== true) {
        g_form.showFieldMsg('element', getMessage('Cannot change field name of existing dictionary record'), 'error');
        answer = false;
    }
    var o_name = $('sys_original.sys_dictionary.name');
    var c_name = g_form.getValue('name');
    if (o_name.value != c_name) {
        g_form.showFieldMsg('name', getMessage('Cannot change table of existing dictionary record'), 'error');
        answer = false;
    }
    return answer;
}
