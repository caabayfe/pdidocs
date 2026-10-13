function transform(input) {
	if (!input || !input.taskTable || !input.taskId || !input.templateId) return {};
	return new sn_uib_tcm.CommunicationManagementUXFBaseUtil().getNotifySMSTemplateMessage(input.taskTable, input.taskId, input.templateId);
}
