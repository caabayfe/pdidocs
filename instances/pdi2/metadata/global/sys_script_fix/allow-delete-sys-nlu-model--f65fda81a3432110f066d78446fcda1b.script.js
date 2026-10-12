var gr = new GlideRecord('sys_db_object');
gr.addQuery('name', 'sys_nlu_model');
gr.query();
if (gr.next()) {
    gr.delete_access = true;
    gr.update();
    gs.info('Upgrade Script: Delete Application Access Updated for sys_nlu_model table');
}
