(function() {
    var enableAuditForTable = function(tableName) {
        var prefix = "sys_script_fix_5578f5914313121033c0827cfbb8f2ea";
        var gr = new GlideRecord('sys_dictionary');
        gr.addQuery('name', tableName);
        gr.query();
        while (gr.next()) {
            var audit = gr.getValue('audit');
            if (audit == 0) {
                gs.log(prefix + ' updating table: ' + tableName + ' field: ' + gr.getValue('column_label') + ' to enable auditing.');
                gr.setValue('audit', 1);
                gr.update();
            } else {
                gs.log(prefix + ' audit already enabled for table: ' + tableName + ' field: ' + gr.getValue('column_label'));
            }
        }
    };

    enableAuditForTable('hermes_topics_state');
    enableAuditForTable('hermes_app_services');
})();
