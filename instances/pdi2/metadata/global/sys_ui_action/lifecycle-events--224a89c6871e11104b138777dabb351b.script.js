showLifecycleEvents();

function showLifecycleEvents() {
    var url = 'mid_server_event_list.do?sysparm_query=cluster%3D' + current.getValue('name') + '^ORDERBYname^ORDERBYDESCsys_created_on';
    gs.setRedirect(url);
}
