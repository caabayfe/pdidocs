if (!pm.isZboot()) {
    gs.info("Fix Script: Started updating existing blocked-insert IRE data source rules to use partial routing");
    
    var gr = new GlideRecord('cmdb_ire_data_source_rule');
    gr.addQuery('insert_not_allowed', true);
    gr.query();
    
    var updateCount = 0;
    while (gr.next()) {
        // Set insert_incomplete to false so blocked inserts route to partial table (legacy behavior)
        gr.setValue('insert_incomplete', false);
        gr.update();
        updateCount++;
    }
    
    gs.info("Fix Script: Finished updating " + updateCount + " blocked-insert IRE data source rules to use partial routing");
}
