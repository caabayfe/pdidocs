var gr = new GlideRecord('sys_db_object');
gr.addQuery('name', 'sys_suggested_utterance');
gr.query();
if (gr.next()) {
    var updated = false;
    if (gr.getValue('create_access') != 'true') {
        gr.setValue('create_access', true);
        updated = true;
    }
    if (gr.getValue('update_access') != 'true') {
        gr.setValue('update_access', true);
        updated = true;
    }
    if (updated) {
        gr.setWorkflow(false);
        gr.update();
        gs.info('Enabled cross-scope write access on sys_suggested_utterance table');
    } else {
        gs.info('Cross-scope write access already enabled on sys_suggested_utterance table');
    }
} else {
    gs.warn('sys_suggested_utterance table not found in sys_db_object');
}
