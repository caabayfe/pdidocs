function onClick(g_form) {
	getMessages(['Create Change Task', 'Create', 'Cancel'], openInterceptorModal);
	
	function openInterceptorModal(msg) {
		g_modal.sn_itsm_workspace.showInterceptor({
			title: msg['Create Change Task'],
			confirmTitle: msg['Create'],
			cancelTitle: msg['Cancel'],
			size:'sm',
			height:'md',
			params: {"modal": "false","target":"change_task","params":"change_request=" + g_form.getUniqueValue()}
		}).then(function(result){
			if (result.data)
				g_aw.openRecord(result.data.table, result.data.sys_id, {query:result.data.query});
		});
	}
}
