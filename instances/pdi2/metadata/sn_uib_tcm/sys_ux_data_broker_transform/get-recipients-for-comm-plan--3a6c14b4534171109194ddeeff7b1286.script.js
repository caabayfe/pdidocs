function transform(input) {
	if (!input || !input.commPlanTable || !input.commPlanSysId) return [];
	return new sn_uib_tcm.CommunicationManagementUXFBaseUtil().getCommPlanRecipients(input.commPlanTable, input.commPlanSysId);
}
