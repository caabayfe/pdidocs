function openAddToBoardDialogListContext() {
	var url = new nowapi.GlideURL('/$vtb_add_to_board.do');
	url.addParam('sysparm_nostack', 'yes');
	url.addParam('sysparm_record_id', rowSysId);
	url.addParam('sysparm_table_name', g_list.getTableName());

	nowapi.g_modal
		.showFrame({
			title: getMessage('Select a Visual Task board'),
			url: url.getURL(),
			size: 'full',
			autoCloseOn: 'NEVER'
		})
		['catch'](function () {
			// dismissal rejects the promise; nothing to do
		});
}
