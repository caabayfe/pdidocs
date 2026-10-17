(function executeRule(current, previous /*null when async*/) {
	var tables = [];
    var gr = new GlideRecord('sys_dm_policy');
    gr.query();
    while (gr.next()) {
        var table = gr.getValue('tablename');
        tables.push(table);
    }
    g_scratchpad.has_policy_defined_tables = tables;
})(current, previous);
