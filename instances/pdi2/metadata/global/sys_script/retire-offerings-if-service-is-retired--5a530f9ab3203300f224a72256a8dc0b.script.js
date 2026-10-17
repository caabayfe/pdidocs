(function executeRule(current, previous /*null when async*/ ) {
    var gr = new GlideRecord('service_offering');
    gr.addQuery('parent', current.sys_id);
    gr.query();
    while (gr.next()) {
        if (gs.getProperty('csdm.lifecycle.migration.activated') == true) {
            gr.setValue('portfolio_status', 'retired');
            gr.setValue('service_status', 'retired');
            gr.setValue('life_cycle_stage', current.life_cycle_stage);
            gr.setValue('life_cycle_stage_status', current.life_cycle_stage_status);
        } else {
            if (current.service_status.changes()) {
                gr.setValue('portfolio_status', 'retired');
                gr.setValue('service_status', 'retired');
            } else {
                gr.setValue('life_cycle_stage', current.life_cycle_stage);
                gr.setValue('life_cycle_stage_status', current.life_cycle_stage_status);
            }
        }
        gr.update();
    }
})(current, previous);
