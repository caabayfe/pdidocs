var gr = new GlideRecord('sys_script');
gr.addQuery('action_delete', true);
gr.addQuery('action_update', true);
gr.addQuery('script', 'CONTAINS', 'new AisDisableSearchSignalEvent');
gr.addQuery('name', 'STARTSWITH', 'Disable');
gr.query();
while (gr.next()) {
    gs.info("Deleting Business Rule with name: \"" + gr.getValue('name') + "\" as disabling suggestions is now handled as part of AIS Indexing logic.");
    gr.deleteRecord();
}
