function onChange(control, oldValue, newValue, isLoading, isTemplate) {
  if (isLoading || newValue === '') {
		return;
	}

	var availableDefaultDateFilters = gel("sys_ui_hp_publisher.default_date_filter_left");
	var selectedDefaultDateFilters = gel("sys_ui_hp_publisher.default_date_filter_right");
	var selectedDateFilter = gel("sys_ui_hp_publisher.date_filter_right");
	var hasDateFilterSelected = selectedDateFilter.options.length;
	var selectedDateFilterOptions = selectedDateFilter.options;

	if (!hasDateFilterSelected) g_form.setDisplay("sys_ui_hp_publisher.default_date_filter", false);

	enableDefaultDateFilterLeft(availableDefaultDateFilters, selectedDateFilter);
	removeSelectedDefaultDateFilterRight(availableDefaultDateFilters, selectedDefaultDateFilters, selectedDateFilter);


}

function enableDefaultDateFilterLeft(availableDefaultDateFilters, selectedDateFilter) {
	for (var i = 0; i < availableDefaultDateFilters.options.length; i++) {
		availableDefaultDateFilters.options[i].setAttribute("disabled", true);
	}

	for (var j = 0; j < availableDefaultDateFilters.options.length; j++) {
		var selectedDateFilterOptionsLenght = selectedDateFilter.options.length;
		for (var k = 0; k < selectedDateFilterOptionsLenght; k++) {
			var a = selectedDateFilter.options[k].value;
			var b = availableDefaultDateFilters.options[j].value;
			if (a === b) {
				availableDefaultDateFilters.options[j].removeAttribute("disabled");
			}
		}
	}

}

function removeSelectedDefaultDateFilterRight(availableDefaultDateFilters, selectedDefaultDateFilters, selectedDateFilter) {
	var optionsToAdd = [];
	for (var j = 0; j < selectedDefaultDateFilters.options.length; j++) {
		var selectedDateFilterOptionsLength = selectedDateFilter.options.length;
		var isPresent = false;
		for (var k = 0; k < selectedDateFilterOptionsLength; k++) {
			var a = selectedDateFilter.options[k].value;
			var b = selectedDefaultDateFilters.options[j].value;
			if (a === b) {
				isPresent = true;
			}
		}
		if (!isPresent){
			optionsToAdd.push(selectedDefaultDateFilters[j]);
			selectedDefaultDateFilters.removeChild(selectedDefaultDateFilters[j]);
		}
	}

	for(var i=0;i<optionsToAdd.length;i++){
		optionsToAdd[i].setAttribute("disabled",true);
		availableDefaultDateFilters.options.add(optionsToAdd[i]);
	}


   
}
