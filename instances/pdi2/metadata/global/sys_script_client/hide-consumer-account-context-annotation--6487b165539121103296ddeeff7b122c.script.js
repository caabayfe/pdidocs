function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading) {
        return;
    }

    var ga = new GlideAjax('VirtualAgentFeatureUtil');
    ga.addParam('sysparm_name', 'doesMwebChannelSupportMultipleConversations');
    ga.getXMLAnswer(showHideControls);
}

function showHideControls(serverResponse) {
    var result = JSON.parse(serverResponse);
    var mwebMultipleConversations = result.mwebSupportMultipleConversations;
    var mwebSysId = result.sysId;
    // Hide annotation and consumer account context if 'delivery_channels' does not contain 'mweb' or multiple conversations for mweb is disabled
    if (g_form.getValue('delivery_channels').indexOf(mwebSysId) >= 0 && mwebMultipleConversations == true) {
		g_form.addDecoration('consumer_account_contexts', 'icon-info', getMessage('When supporting multiple active conversations, the consumer account context identifies the content area for this notification for the web client (mweb) channel. Virtual Agents with this same content area will display this notification.'));
        document.getElementById("element.sys_notification_va_content.consumer_account_contexts").parentNode.style.display = "block";
    } else {
        document.getElementById("consumer_account_context_annotation").parentNode.style.display = "none";
        document.getElementById("element.sys_notification_va_content.consumer_account_contexts").parentNode.style.display = "none";
    }
}
