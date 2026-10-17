function transform(input) {
    var tcm = {};
    var notify = {};
    var telephoneProviderType = '';

    if (input.table && input.sysId) {
        var filterCriteria = "recordClass=" + input.table + "&orderBy=order";
        if (GlidePluginManager.isActive("com.snc.task_communication_management")) {
            var taskSysId = input.sysId;
            var commTaskHandler = new sn_comm_management.CommunicationManagementBridgeSNC().getHandlerInstance("incident");
            tcm = commTaskHandler.getCommunicationDetails(taskSysId, filterCriteria);
        }

        if (GlidePluginManager.isActive("com.snc.notify")) {
            var confUtils = new sn_uib_notify.NotifyUXFConferenceUtil();
            notify = confUtils.getAllConferenceCardsData(input.sysId);
            telephoneProviderType = confUtils.TELEPHONY_PROVIDER;
        }
    }

    var result = {
        "tcm": tcm,
        "notify": notify,
        "telephoneProviderType": telephoneProviderType
    };
    return result;
}
