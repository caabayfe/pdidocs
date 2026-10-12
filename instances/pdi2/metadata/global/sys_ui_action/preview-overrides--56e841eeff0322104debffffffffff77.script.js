function redirectToOverridingRecordListView() {
    var tableName = g_form.getValue('table_name');
    var sysId = g_form.getUniqueValue();
    if (!tableName || !sysId) 
        return;
    var ga = new GlideAjax('DomainUpgradedProcessAjax');
    ga.addParam('sysparm_name', 'getOverriddenRecordGuid');
    ga.addParam('sysparm_sys_id', sysId);
    ga.getXMLAnswer(function(recordGuid) {
        if (!recordGuid) 
            return;
        var url = '/' + encodeURIComponent(tableName) + '_list.do?sysparm_query=' +
            encodeURIComponent('sys_overrides=' + recordGuid) +
            '&sysparm_query_no_domain=true';
        window.open(url, '_blank');
    });
}
