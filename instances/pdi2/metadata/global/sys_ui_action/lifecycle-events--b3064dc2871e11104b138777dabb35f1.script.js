showLifecycleEvents();

function showLifecycleEvents() {
    var url = 'mid_server_event_list.do?sysparm_query=agent%3D' + current.getValue('name') + '^ORDERBYDESCsys_created_on';
    gs.setRedirect(url);
}
