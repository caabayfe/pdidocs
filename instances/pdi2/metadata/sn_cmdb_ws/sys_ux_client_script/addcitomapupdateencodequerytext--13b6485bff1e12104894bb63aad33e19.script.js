async function script({ api, event, helpers, imports }) {
	//addCiToMapUpdateEncodeQueryText function, fired in mapSearchFilterController when apply filter button is clicked on Add ci to map panel in edit mode
	const tableName = api.state.selectedClassAddCiToMap;
	if (tableName) {
		if (api.data.get_display_name_of_encodedquery.output?.result?.encodedQueryDisplayValue) {
			let label = await helpers.translate("Class = {0} > {1}", tableName,
				api.data.get_display_name_of_encodedquery.output.result.encodedQueryDisplayValue);
			api.setState("addCiToMapEncQryDisplayValue", label);
		} else {
			api.setState("addCiToMapEncQryDisplayValue", await helpers.translate("Class = {0}", tableName));
		}
	}
}
