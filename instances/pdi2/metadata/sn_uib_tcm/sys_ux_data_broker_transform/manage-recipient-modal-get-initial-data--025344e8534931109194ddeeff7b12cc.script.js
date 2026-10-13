function transform(input) {
    if (!input || !input.table || !input.sysId) return {};
	return new sn_uib_tcm.CommunicationManagementUXFBaseUtil().getInitialManageRecipientModalData(input.table, input.sysId);
}
