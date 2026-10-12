if (current.canRead()) {
    new MIDServerManage().getResourceState(current.getValue('name'));

    var url = 'ecc_queue_list.do?sysparm_query=topic%3D';
    url += "SystemCommand";
    url += '^source%3D';
    url += "getResourceState";
    url += '^agent%3D';
    url += "mid.server." + current.name;
    action.setRedirectURL(url);
}
