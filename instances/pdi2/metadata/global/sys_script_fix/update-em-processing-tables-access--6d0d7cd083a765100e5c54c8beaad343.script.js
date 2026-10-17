var tableNameArr = ['em_compose_field', 'em_mapping_pair', 'em_mapping_rule', 'em_match_field', 'em_match_rule'];

    var gr = new GlideRecord('sys_db_object');
    gr.addQuery('name', 'IN', tableNameArr.join(','));
    gr.query();
    while (gr.next()) {
        var record_update = false;
        if (!gr.create_access) {
            gr.setValue('create_access', '1');
            record_update = true;
        }
        if (!gr.read_access) {
            gr.setValue('read_access', '1');
            record_update = true;
        }
        if (!gr.update_access) {
            gr.setValue('update_access', '1');
            record_update = true;
        }
        if (!gr.actions_access) {
            gr.setValue('actions_access', '1');
            record_update = true;
        }
        if (!gr.client_scripts_access) {
            gr.setValue('client_scripts_access', '1');
            record_update = true;
        }
        if (!gr.ws_access) {
            gr.setValue('ws_access', '1');
            record_update = true;
        }
        if (!gr.alter_access) {
            gr.setValue('alter_access', '1');
            record_update = true;
        }
        if (record_update) {
            gr.update();
        }
    }
