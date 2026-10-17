function onClick(g_form) {
	function openPopup() {
		var url = '/discover_now.do?sysparm_stack=no&sysparm_workspace=' + true + '&sysparm_schedule_sysid=' + g_form.getUniqueValue();
		g_modal.showFrame({
			title: '',
			url: url,
			size: 'xs',
			autoCloseOn: 'URL_CHANGED',
			callback: handleModalResult
		});
	}

	openPopup();
}

function handleModalResult(ret, data) {
	if (ret && data.hasOwnProperty('statusSysId'))
		top.window.location = 'now/discovery-admin-workspace/status/' + data.statusSysId;
	else
		g_form.addErrorMessage(data.error);
}
