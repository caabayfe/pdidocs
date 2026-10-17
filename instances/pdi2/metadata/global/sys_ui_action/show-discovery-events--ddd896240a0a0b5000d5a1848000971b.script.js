showDiscoveryEvents();

function showDiscoveryEvents() {
    var gr = new GlideRecord('discovery_device_history');
    gr.addQuery('cmdb_ci', current.sys_id);
    gr.orderByDesc('sys_updated_on');
    gr.query();

    var eq = gr.getEncodedQuery();
    var url = 'discovery_device_history.do?sysparm_query=cmdb_ci%3D' + 
              current.sys_id +
              '%5EORDERBYDESCsys_updated_on';
    var url = 'discovery_device_history_list.do?sysparm_query=' + eq;
    action.setRedirectURL(url);
}
