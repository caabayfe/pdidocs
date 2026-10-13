function makeChart() {
	// Make the selected transform option the transform that was chosen by the user
	if ('$[sysparm_transform]'){
		var transform = document.getElementById("transformPicker");
		transform.options.namedItem('$[sysparm_transform]').selected = true;
		handleTransformChange('$[sysparm_transform]');
	}
	
	// Make the selected time span option the time span that was chosen by the user
	if ('$[sysparm_time_span]'){
		var timeSpan = document.getElementById("timeSpanPicker");
		timeSpan.options.namedItem('$[sysparm_time_span]').selected = true;
	}
	
	var startTime = ($j("#timeSpanPicker option:selected" ).val());

	var params = {
		sysparm_title: "$[jvar_chart_title]",
		sysparm_type: "line",
		sysparm_table: "$[sysparm_table]",
		sysparm_source_type: "metricbase",
		sysparm_custom_config: "$[transformString]",
		sysparm_start_time: startTime,
		sysparm_end_time: "P0D",
		sysparm_show_marker: false
	};
	
	embedReportByParams($j("#mb_viewer_chart"), params);
}

function fireLimitNotification() {
	GlideUI.get().addOutputMessage({msg: '$[gs.getMessage("Only showing results for up to 20 records")]', type: 'warning', id: 'clotho_highcharts_warning'});
}

// When the transform type is selected, either trigger transform graphing
// process or if complex type, show the value input
function handleTransformChange(key) {
	var isComplexType = isComplexTransformType(key);
	
	if (!key || key == "" || !isComplexType) {
		if ($j("#complex_input_container").is(":visible")) {
			$j("#complexInput").val("");
			$j("#complex_input_container").hide();
		}
		
		return;
	}

	if (isComplexType) {
		$j("#complex_input_container").show();
		$j("#complex_input_container").focus();
		$j("#complexInput").val('$[sysparm_transform_value]');
		
		if (key === "resample")
			$j("#complex_input_container .label-text").html("$[gs.getMessage('Value (min)')])");
		else
			$j("#complex_input_container .label-text").html("$[gs.getMessage('Value')]");
		
	}
}

function isComplexTransformType(key) {
	if (!key)
		key = $j("#transformPicker option:selected").val() || null;
	
	var complexTypes = ['add', 'mul', 'div', 'resample'];
	return $j.inArray(key, complexTypes) !== -1;
}

function validateSubmit() {
	var transformType = $j("#transformPicker option:selected").val() || null;
	// No transform selected
	if (!transformType)
		return true;

	var transformVal = $j("#complexInput").val() || null;
	// Not a complex transform so don't need to validate anything
	if (!transformVal)
		return true;

	return (validateTransformInput(transformType, transformVal));
}

function validateTransformInput(type, value) {
	var val = parseInt(value);

	if (isNaN(val)) {
		fireNotification('$[gs.getMessage("Please enter a number value.")]', 'error', 'clotho_form_validation');
		return false;
	}
	
	if (type === 'resample' && val <= 0) {
		fireNotification('$[gs.getMessage("Please enter a number greater than 0.")]', 'error', 'clotho_form_validation');
		return false;
	}
	
	if (type === 'div' && val === 0) {
		fireNotification('$[gs.getMessage("Cannot divide by 0. Please choose another number.")]', 'error', 'clotho_form_validation');
		return false;
	}

	GlideUI.get().clearOutputMessages();
	return true;
}

function fireNotification(msg, type, id) {
	GlideUI.get().addOutputMessage({msg: msg, type: type, id: id});
}
