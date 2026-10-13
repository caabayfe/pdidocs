callExportRota();

function callExportRota() {
    var url = 'export_cmn_rota.do';
    url += '?sysparm_sys_id=' + current.sys_id;
    url += '&sysparm_group_id=' + current.group;
    url += '&sysparm_schedule_id=' + current.schedule;
    url += '&sysparm_schedule_based_id=' + current.based_on;
    url += '&sysparm_ck=' + gs.getSessionToken();
    action.setRedirectURL(url);
}
