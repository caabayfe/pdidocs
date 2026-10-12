function script({ api, event, helpers, imports}) {
	//addCiToMapApplyFilter fired in mapSearchFilterController when applyFilter button is clicked in add ci to map panel for edit mode
	const { cloneDeep } = imports['sn_cmdb_ws.unifiedMapUtils']();
	var processClick = {
		init: function () {
			this.buildListControllerObject();
		},

		_defaultColumnList: function () {
			let columns = [];
			columns.unshift("sys_class_name");
			columns.unshift("name");
			return columns;
		},

		buildListControllerObject: function () {
			let listControllerInp = {
				"tableName": api.state.selectedClassAddCiToMap,
				"query": api.state.addCiToMapCBQuery,
				"columns": this._defaultColumnList().join(",")
			}
			api.setState("addCiToMapResultInpObj", listControllerInp);
			//Reset all selections
			api.setState("addCiToMapSelectedRecord", "");
			let rowDefinitions = cloneDeep(api.state.rowDefinition);
			if(rowDefinitions && Object.keys(rowDefinitions)?.length) {
				rowDefinitions?.rows.forEach((row) => {
					row.isSelected = false;
				});
				api.setState("rowDefinition", rowDefinitions);
			}
			api.data.get_display_name_of_encodedquery.refresh();				
		}
	}
	processClick.init();
}
