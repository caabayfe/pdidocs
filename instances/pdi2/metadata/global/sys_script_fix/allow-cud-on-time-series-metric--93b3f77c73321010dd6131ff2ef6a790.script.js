function provideAccess(tableName) {
    var gr = new GlideRecord('sys_db_object');
    gr.addQuery('name', tableName);
    gr.query();
    gs.info("Fix Script: Allow Create, Update for Time Series Metric table from other applications - Started");
    if (gr.next()) {
        gs.info("Fix Script: Allow CUD for Time Series Metric tables - create access is " + gr.getValue('create_access') +
            " update access is " + gr.getValue('update_access'));

        if (gr.getValue('create_access') === '0')
            gr.setValue('create_access', '1');
        if (gr.getValue('update_access') === '0')
            gr.setValue('update_access', '1');

        if (!isCustomized(gr)) {
            gs.info("Fix Script: Updating CUD for Time Series Metric tables - create access is " + gr.getValue('create_access') +
                " update access is " + gr.getValue('update_access'));
            gr.setWorkFlow(false);
            gr.setUseEngines(false);
            gr.update();
        }
    }
}

function isCustomized(gr) {
    var detector = GlideCollisionDetector.get();
    return detector.containsKey(gr.sys_update_name);
}

provideAccess('sys_metric');
gs.info("Fix Script: Allow Create, Update, Delete for Time Series Metric table from other applications - Finished");
