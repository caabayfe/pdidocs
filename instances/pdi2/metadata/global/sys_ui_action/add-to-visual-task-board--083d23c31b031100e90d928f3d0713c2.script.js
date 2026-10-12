function openAddToBoardDialogList() {
	var tableName = g_list.getTableName();
	var checked = g_list.getChecked();

	if (!checked)
		return;

	var url = new nowapi.GlideURL('/$vtb_add_to_board.do');
	url.addParam('sysparm_nostack', 'yes');
	url.addParam('sysparm_record_list', checked);
	url.addParam('sysparm_table_name', tableName);

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

	g_list.clearChecked();
}
