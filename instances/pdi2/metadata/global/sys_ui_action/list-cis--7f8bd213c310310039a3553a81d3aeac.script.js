function execute() {
    var serviceId = current.getUniqueValue();
    var ciIds = ListCis.getCis(serviceId);
    var cisArr = ciIds.split(',');
    var maxCis = Math.floor(Number(gs.getProperty('sa.it_service.list_cis_max_count', 4000)) || 4000);

    var hasOverflow = (cisArr.length === maxCis);

    if (!ciIds)
        ciIds = '-1';

    action.setReturnURL(current);
    action.setRedirectURL('sa_list_cis.do?sysparm_mode=all' +
        (hasOverflow ? '&sysparm_overflow=true' : '') +
        '&sysparm_query=sys_idIN' + ciIds
    );
}

execute();
