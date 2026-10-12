var gv_selected_columns,
	gv_available_columns,
	gv_remove_val_from_indx = [];
function closeModal() {
	window.location.href = 'ws_blank_page.do';
}
function cancel() {
	closeModal();
}
function actionOK() {
	var array = slush.getValues(slush.getRightSelect());  
	var currentSelected = array.join(',');
	var prevSelected = slush.getRightValues();
	var changes = true;
	if (currentSelected == prevSelected)
		changes = false;
	
	if (currentSelected === '') {
		jQuery('#slush_right').css({"border-color": "#f95050"}); 
		changes = false;
	}
	
	if (changes) {
		iframeMsgHelper.confirm(currentSelected);
	} 
	return false;
}
function populateSlushbucket(listItem, id) {
	var listData = listItem.split('^');
	if (listData.length === 2) {
		gv_selected_columns = listData[1].split(',');
		populateBuckets(listData[0]);
	}
}
function populateBuckets(table) {
	var ga1 = new GlideAjax('AJAXListColumns');
	ga1.addParam('tableName', table);
	ga1.addParam('sysparm_function', 'getAllColumns');
	ga1.addParam('sysparm_name', 'getAllColumns');
	ga1.getXMLAnswer(function(response) {
		gv_available_columns = response.slice(1, -1).split(', ').map(function (item) {
			var newItem = item.split(' : ');
			return {
				label: newItem[0],
				value: newItem[1]
			};
		});
 		var ga2 = new GlideAjax('AJAXListColumns');
		ga2.addParam('tableName', table);
		ga2.addParam('selectedColumns', gv_selected_columns);
		ga2.addParam('sysparm_function', 'getListColumns');
		ga2.addParam('sysparm_name', 'getListColumns');
		ga2.getXMLAnswer(function(response) {
			var selectedColumns = response.slice(1, -1).split(', ').map(function (item) {
				var newItem = item.split(' : ');
				return {
					label: newItem[0],
					value: newItem[1]
				};
			});
			populateRightBucket(selectedColumns);
 			populateLeftBucket();
		});
	});
}
function populateRightBucket(selectedColumns) {
	for (var x = 0; x < gv_selected_columns.length; x++) {
		for (var y = 0; y < gv_available_columns.length; y++) {
			if (gv_selected_columns[x] === gv_available_columns[y].value) {
				gv_remove_val_from_indx.push(y);
			}
		}
	}
	populateSelection(gel('slush_right'), selectedColumns);
	var array = slush.getValues(slush.getRightSelect());
	var r = array.join(",");
	slush.saveRightValues(r);
}
function populateLeftBucket() {
	var availableColumns = gv_available_columns;
	gv_remove_val_from_indx.sort(function(a,b){ return b - a; });
	for (var z = 0; z < gv_remove_val_from_indx.length; z++) {
		availableColumns.splice(gv_remove_val_from_indx[z], 1);
	}
	availableColumns.sort(function(a, b){
		if(a.label < b.label) return -1;
		if(a.label > b.label) return 1;
		return 0;
	});
	populateSelection(gel('slush_left'), availableColumns);
}
function populateSelection(select, choices) {
  select.options.length = 0;
  for (var i = 0; i < choices.length; i++ ) {
    var choice = choices[i];
    var o = new Option(choices[i].label, choices[i].value);
    select.options[select.options.length] = o;
  }
}
