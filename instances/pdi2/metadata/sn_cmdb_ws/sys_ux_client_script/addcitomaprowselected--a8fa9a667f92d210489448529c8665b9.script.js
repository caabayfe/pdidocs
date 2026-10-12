function script({ api, event, helpers, imports }) {
	//addCiToMapRowSelected fired in mapSearchSearchFilterController when a row is selected in add to map panel 
	const { cloneDeep } = imports['sn_cmdb_ws.unifiedMapUtils']();
	let isRowChecked = event.payload.isRowChecked;
	if (!isRowChecked && api.state.addCiToMapSelectedRecord === event.payload.value) {
		api.setState("addCiToMapSelectedRecord", "");
	} else {
		api.setState("addCiToMapSelectedRecord", event.payload.value);
	}

	let rowDefinitions = cloneDeep(event.payload.rowDefinition);
	if (isRowChecked) {
		rowDefinitions.rows.forEach((row) => {
			if (row.key === event.payload.value)
				row.isSelected = true;
			else
				row.isSelected = false;
		});
	}
	api.setState("rowDefinition", rowDefinitions);
}
