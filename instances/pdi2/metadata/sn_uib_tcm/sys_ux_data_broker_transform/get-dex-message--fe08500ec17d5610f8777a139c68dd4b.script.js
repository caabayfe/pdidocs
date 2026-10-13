function transform(input) {
    var output = {};
    if (!input || !input.templateId || !input.commTaskSysId || !input.table)
        output.message = gs.getMessage("Inputs cannot be empty");
    else {
        var respData = {};
        var commManagementUtils = new sn_comm_management.CommunicationManagementUtil();
        var handlerInstance = new sn_comm_management.CommunicationManagementBridgeSNC().getHandlerInstance(input.table);
        var commTaskGR = new GlideRecord(handlerInstance.getCommTaskInstanceForTask());
        if (commTaskGR.get(input.commTaskSysId)) {
            var dexTemplateGr = new GlideRecord("sn_dex_desktop_assistant_notification_template");
            dexTemplateGr.get(input.templateId);
            var commManagementGlobalUtil = new global.CommunicationManagementGlobalUtilSNC();
            output.message = commManagementGlobalUtil.formatContent(commTaskGR, dexTemplateGr.template);
            output.title = dexTemplateGr.getDisplayValue('title');
        } else
            output.message = gs.getMessage("Communication task not found");
    }
    return output;
}
