(function transform(transformBuilder) {
try {
	if(!transformBuilder) return;
	
	var listModel = transformBuilder.transform();
	var listCol = listModel.columnDefinitions.columns;

	for (var i = 0; i < listCol.length; i++) {
		if (listCol[i].key == 'portal') {
			listCol[i].label = gs.getMessage("Portals");
		}
		else {
			var nameColumn = {
				key: "name",
				label: gs.getMessage("Name"),
				type: "url",
				opensInNew: true
			};
			listCol[i] = nameColumn;
		}
	}
	
	var listData = new CIUtil().getPublicAccessListData();
	var linkData = listData.link;
	var labelData = listData.name;
	var listRow = listModel.rowDefinitions.rows;

	for (var i = 0; i < listRow.length; i++) {
		if (linkData.hasOwnProperty(listRow[i].key)) {
			var urlProps = {
				value: 'now/now-assist-in-virtual-agent/setup/params/assistantid/' + linkData[listRow[i].key],
				label: labelData[listRow[i].key],
			};
			listRow[i].cells.name = urlProps;
		}
	}

	return listModel;
} 

catch(error) {
	return {
		failed: true,
		error: error.message
	};
}
})(transformBuilder);
