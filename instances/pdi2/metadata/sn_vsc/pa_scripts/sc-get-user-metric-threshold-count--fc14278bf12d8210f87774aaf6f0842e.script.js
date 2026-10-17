getMyThresholdEventCount();

function getMyThresholdEventCount() {
    var gr = new GlideRecord('sn_vsc_metric_threshold_event');
    gr.addEncodedQuery('user=' + gs.getUserID() + '^sys_created_onONToday@javascript:gs.beginningOfToday()@javascript:gs.endOfToday()', true);
    gr.query();
    var recCount = gr.getRowCount();
    return recCount; 
}
