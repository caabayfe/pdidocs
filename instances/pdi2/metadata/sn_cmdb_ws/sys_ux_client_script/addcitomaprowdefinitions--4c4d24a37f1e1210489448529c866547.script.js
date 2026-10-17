function script({ api, event, helpers, imports }) {
	//addCIToMapRowDefinitions fired in mapSearchFilterController add to map panle when data fetch event is successful on List controller
	const { cloneDeep } = imports['sn_cmdb_ws.unifiedMapUtils']();
	let rowDefinitions = event.payload.rowDefinition;

	rowDefinitions.rows.forEach((row) => {
		if (row.key === api.state.addCiToMapSelectedRecord)
			row.isSelected = true;
		else
			row.isSelected = false;
	});
	api.setState("rowDefinition", cloneDeep(rowDefinitions));
}
