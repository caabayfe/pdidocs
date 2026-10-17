(function executeRule(current, previous /*null when async*/) {

	var gr = new GlideRecord('ticket_tab_configuration');
    if (!gr.isValid())
        return;

    gr.addQuery("parent", current.sys_overrides);
    gr.query();
    while (gr.next()) {
        gr.parent = current.getUniqueValue();
        gr.insert();
    }

})(current, previous);
