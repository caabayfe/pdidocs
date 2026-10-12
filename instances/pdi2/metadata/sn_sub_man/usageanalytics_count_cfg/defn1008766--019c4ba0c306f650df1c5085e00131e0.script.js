answer = getInstanceUsageDataForCloudStorage();

function getInstanceUsageDataForCloudStorage() {
    var instanceId = gs.getProperty('instance_id');
    var gr = new GlideRecord('sn_storage_cloud_consumption');
    gr.addQuery('instance_id', instanceId);
    gr.query();
    if (gr.next()) {
        return gr.getValue('total_usage');
    }
    return 0;
}
