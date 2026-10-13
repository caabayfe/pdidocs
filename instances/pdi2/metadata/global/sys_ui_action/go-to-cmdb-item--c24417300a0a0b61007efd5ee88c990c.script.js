gotoCMDBItem();

function gotoCMDBItem() {
    var ip = SncIPAddress.fromString(current.source);
    var ci = SncDiscoveryUtils.getCIFromIP(ip);
    var url = current;
    if (ci)
        return action.setRedirectURL('cmdb_ci.do?sys_id=' + ci);

    ci = findByHostname(current.source);
    if (ci)
        return action.setRedirectURL('cmdb_ci.do?sys_id=' + ci);

    action.setRedirectURL(url);
}

/*
 *  In Help the helpdesk, the source name is always the name of the computer.
 */
function findByHostname(source) {
    var gr = new GlideRecord("cmdb_ci_computer");
    gr.addQuery("name", source);
    gr.query();
    if (gr.next())
        return gr.sys_id + '';

    return false;
}
