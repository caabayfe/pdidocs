function redirectToServiceForm(serviceType) {
    var serviceFormUrl = serviceType + '.do?' +
        'sys_id=-1' +
        '&sysparm_query=' + 'spm_taxonomy_node=' + getParmVal('sysparm_taxonomy') +
        '&spm_service_portfolio=' + getParmVal('sysparm_portfolio') +
        '&sysparm_view=' + getParmVal('sysparm_view');
    g_navigation.open(serviceFormUrl);
}

function getParmVal(name) {
    var url = document.URL.parseQuery();
    if (url[name]) {
        return decodeURI(url[name]);
    } else {
        return;
    }
}
