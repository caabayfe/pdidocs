function onHideGlobals() {
    var spq = getQueryForList('sys_script');
    var url = window.location;
    if (spq) {
        if (spq.indexOf('collection=global^OR') >= 0) {
            spq = spq.replace(/collection=global\^OR/g, '');
            url = 'sys_script_list.do?sysparm_query=' + spq;
        }
    }
    window.location = url;
}
