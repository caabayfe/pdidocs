function moveToAdvancedView() {
    var encodedQueueName = encodeURIComponent(g_form.getValue('queue'));
    var encodedSuffix = encodeURIComponent(g_form.getValue('suffix'));
    var encodedScope = encodeURIComponent(g_form.getValue('sys_scope'));
	
    if (g_form.getBooleanValue('automatic_processing') == false) {
        g_form.addWarningMessage("Automatic Job scheduling should be enabled before switching to advanced view");
        return;
    }
    var url = "";
    if (!g_form.isNewRecord()) {
        url = g_form.getTableName() + '.do?sys_id=' + g_form.getUniqueValue() + '&sysparm_view=advanced';
    } else {
        url = g_form.getTableName() + '.do?sysparm_queue=' + encodedQueueName + '&sysparm_suffix=' + encodedSuffix + '&sysparm_transaction_scope=' + encodedScope + '&sysparm_view=advanced';
    }
    top.window.location = url;
}
