function moveToDefaultView() {
    var encodedQueueName = encodeURIComponent(g_form.getValue('queue'));
    var encodedSuffix = encodeURIComponent(g_form.getValue('suffix'));
    var encodedScope = encodeURIComponent(g_form.getValue('sys_scope'));
    var url = "";
    if (!g_form.isNewRecord()) {
        url = g_form.getTableName() + '.do?sys_id=' + g_form.getUniqueValue() + '&sysparm_view=';
    } else {
        url = g_form.getTableName() + '.do?sysparm_queue=' + encodedQueueName + '&sysparm_suffix=' + encodedSuffix + '&sysparm_transaction_scope=' + encodedScope + '&sysparm_view=';
    }
    g_navigation.open(url);
}
