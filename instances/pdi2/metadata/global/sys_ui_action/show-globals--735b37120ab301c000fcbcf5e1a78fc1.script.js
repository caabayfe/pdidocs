function onShowGlobals() {
    var spq = getQueryForList('sys_script');
    var url = window.location;
    if (spq) {
        if (spq.indexOf('collection=global') < 0) {
            url = 'sys_script_list.do?sysparm_query=' + spq;
            var x = url.indexOf('collection=');
            url = url.substring(0,x) + 'collection=global^OR' + url.substring(x);
        }
    }
    window.location = url;
}
