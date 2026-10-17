function onClick(g_form) {
	function openPopup() {
		var url = '/quick_ranges.do?sysparm_stack=no&sysparm_workspace=' + true 
			+ '&sysparm_mr_id=' + g_form.getUniqueValue() 
			+ '&sysparm_mr_table=discovery_schedule';
		g_modal.showFrame({
			title: getMessage('Quick Ranges'),
			url: url,
			width: '620px',
			height: '620px',
			autoCloseOn: 'URL_CHANGED',
			callback: function (ret, data) {
				g_form.reload();
			}
		});
	}
	
	openPopup();
}
