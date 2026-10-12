function script({ api, event, helpers, imports }) {
	//swapCIs script in Map Search Filter UI Controller; fired whne swap CIs button is clicked in edit mode
	//NOTE: have to use a script here as the OOB Update State handler (inline script version) can't call shared code in client script includes
	const { cloneDeep } = imports['sn_cmdb_ws.unifiedMapUtils']();
	const { setEditModeManageConnections } = imports['sn_cmdb_ws.unifiedMapUtilsMapSearchFilter']();

	var functions = {

		swapCIs: function () {
			var existing = api.state.editModeManageConnections;
			var newObj = cloneDeep(existing);
			newObj.selectedSourceCi = existing.selectedTargetCi;
			newObj.selectedTargetCi = existing.selectedSourceCi;
			setEditModeManageConnections(newObj, api);
		}

	};

	functions.swapCIs();
}
