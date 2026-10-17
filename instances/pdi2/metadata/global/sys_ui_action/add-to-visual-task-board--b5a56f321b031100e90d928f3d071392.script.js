function openAddToBoardDialogForm() {
	var taskSysID = g_form.getUniqueValue();
	var tableName = g_form.getTableName();

	var url = new nowapi.GlideURL('/$vtb_add_to_board.do');
	url.addParam('sysparm_nostack', 'yes');
	url.addParam('sysparm_record_id', taskSysID);
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
}
