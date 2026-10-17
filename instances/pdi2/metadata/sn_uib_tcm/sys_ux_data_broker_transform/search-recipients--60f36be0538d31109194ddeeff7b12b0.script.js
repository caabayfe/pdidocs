function transform(input) {
    if (!input || !input.searchQuery) return {};
	return new sn_uib_tcm.CommunicationManagementUXFBaseUtil().getRecipientsSearchResult(input.searchQuery);
}
