showOlderDiscovery();

function showOlderDiscovery() {
    var gr = new GlideRecord('discovery_device_history');
    gr.addQuery('cmdb_ci', current.cmdb_ci);
    gr.orderByDesc('sys_updated_on');
    gr.query();

    while (gr.next())
        if (gr.sys_id == current.sys_id) {
            gr.next();
            break;
        }

    var url = 'discovery_device_history.do?sys_id=' + gr.sys_id;
    action.setRedirectURL(url);
}
