function onSubmit() {
    g_form.hideAllFieldMsgs();
    var ga = new GlideAjax('VirtualAgentFeatureUtil');
    ga.addParam('sysparm_name', 'doesMwebChannelSupportMultipleConversations');
	ga.getXMLWait();

	var serverResponse = ga.getAnswer();
    var result = JSON.parse(serverResponse);
    var mwebMultipleConversations = result.mwebSupportMultipleConversations;
    var mwebSysId = result.sysId;
    if (g_form.getValue('delivery_channels').indexOf(mwebSysId) >= 0 && mwebMultipleConversations == true &&
        g_form.getValue('consumer_account_contexts') == '') {
        g_form.showErrorBox("consumer_account_contexts", "A consumer account context needs to be selected when multiple conversations on the mweb channel are supported and when mweb is a delivery channel.", true);
        return false;
    }
}
