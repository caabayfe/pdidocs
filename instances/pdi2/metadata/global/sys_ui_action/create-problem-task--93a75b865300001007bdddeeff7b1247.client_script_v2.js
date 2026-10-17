function onClick(g_form) {
	getMessages(['Create Problem Task', 'Create', 'Cancel'], openProblemTypeModal);
	
	function openProblemTypeModal(msg) {
		var result = g_form.submit('create_ptask');
		if (!result) {
			//failed form submission
			return;
		}

		result.then(function() {
			g_modal.sn_itsm_workspace.showInterceptor({
				title: msg['Create Problem Task'],
				confirmTitle: msg['Create'],
				cancelTitle: msg['Cancel'],
				size:'sm',
				height:'md',
				params: {"modal": "false","target":"problem_task", "params": "problem=" + g_form.getUniqueValue()}})
			.then(function(modalResult){
				if (modalResult.data)
						g_aw.openRecord(modalResult.data.table, modalResult.data.sys_id, {query:modalResult.data.query});
			});
		});
	}
}
