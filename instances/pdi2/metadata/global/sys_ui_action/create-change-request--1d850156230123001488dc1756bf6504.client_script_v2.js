function onClick(g_form) {
	getMessages(['Create Change Request', 'Create', 'Cancel'], openInterceptorModal);
	
	function openInterceptorModal(msg) {
		var result = g_form.submit('create_std_change');
		if (!result) {
			return;
		}
		result.then(function() {
			g_modal.sn_itsm_workspace.showInterceptor({
				title: msg['Create Change Request'],
				confirmTitle: msg['Create'],
				cancelTitle: msg['Cancel'],
				size:'sm',
				height:'md',
				params: {"modal": "false","target":"change_request"}})
			.then(function(modalResult){
				if (modalResult.data) {
					if (modalResult.data.table != 'sc_cat_item')
						g_aw.openRecord(modalResult.data.table, modalResult.data.sys_id, {query:modalResult.data.query});
					else {
						var ga = new GlideAjax('StdChangeUtils');
						ga.addParam('sysparm_name', 'ajaxFunction_getCategory');
						ga.getXMLAnswer(function (answer) {
							if (answer) {
								var params =modalResult.data.params;
								params.sysparm_parent_table = "incident";
								params.sysparm_parent_sys_id = g_form.getUniqueValue();

								g_service_catalog.openCatalogItem('sc_cat_item', '-1', params);
							}
						});
					}
				}
			});
		});
	}
}
